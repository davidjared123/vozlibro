import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get user from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('sb-qngzkhqlpyogzlsytezn-auth-token');

        if (!accessToken) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        // Parse the auth token
        let userId: string;
        try {
            const tokenData = JSON.parse(accessToken.value);
            userId = tokenData.user?.id;

            if (!userId) {
                return NextResponse.json(
                    { error: "Invalid authentication token" },
                    { status: 401 }
                );
            }
        } catch (e) {
            return NextResponse.json(
                { error: "Failed to parse authentication token" },
                { status: 401 }
            );
        }

        const { id: bookId } = await params;

        // Verify the book belongs to the user before deleting
        const { data: book, error: fetchError } = await supabase
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

        if (book.user_id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized to delete this book" },
                { status: 403 }
            );
        }

        // Delete the book
        const { error: deleteError } = await supabase
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
