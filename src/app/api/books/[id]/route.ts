import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Create Supabase client with cookies for authentication
        const cookieStore = await cookies();

        const supabaseServer = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        // Get the authenticated user
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        const { id: bookId } = await params;

        // Verify the book belongs to the user before deleting
        const { data: book, error: fetchError } = await supabaseServer
            .from('books')
            .select('user_id')
            .eq('id', bookId)
            .single();

        if (fetchError || !book) {
            return NextResponse.json(
                { error: "Book not found" },
                { status: 404 }
            );
        }

        if (book.user_id !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized to delete this book" },
                { status: 403 }
            );
        }

        // Delete the book
        const { error: deleteError } = await supabaseServer
            .from('books')
            .delete()
            .eq('id', bookId);

        if (deleteError) {
            console.error("Error deleting book:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete book" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting book:", error);
        return NextResponse.json(
            { error: `Failed to delete book: ${error.message || error}` },
            { status: 500 }
        );
    }
}
