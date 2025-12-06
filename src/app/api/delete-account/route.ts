import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
    try {
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

        // Get the current user from the session
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        const userId = user.id;

        // Delete user's books
        const { error: booksError } = await supabaseServer
            .from('books')
            .delete()
            .eq('user_id', userId);

        if (booksError) {
            console.error("Error deleting books:", booksError);
            return NextResponse.json(
                { error: "Failed to delete user books" },
                { status: 500 }
            );
        }

        // Delete user's profile image from storage if exists
        if (user.user_metadata?.avatar_url) {
            try {
                const avatarPath = user.user_metadata.avatar_url.split('/').slice(-2).join('/');
                await supabaseServer.storage
                    .from('profile-images')
                    .remove([avatarPath]);
            } catch (error) {
                console.error("Error deleting profile image:", error);
                // Continue even if image deletion fails
            }
        }

        // Call the delete_user RPC function
        // Note: delete_user RPC must be defined in your database with security definer to allow users to delete themselves
        const { error: deleteError } = await supabaseServer.rpc('delete_user', {
            user_id: userId
        });

        if (deleteError) {
            console.error("Error deleting user:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete user account" },
                { status: 500 }
            );
        }

        // Sign out the user
        await supabaseServer.auth.signOut();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting account:", error);
        return NextResponse.json(
            { error: `Failed to delete account: ${error.message || error}` },
            { status: 500 }
        );
    }
}
