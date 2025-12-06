import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseClient } from "@/lib/supabase-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
    try {
        // Get the current user from the session
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        const userId = user.id;

        // Delete user's books
        const { error: booksError } = await supabase
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
                await supabaseClient.storage
                    .from('profile-images')
                    .remove([avatarPath]);
            } catch (error) {
                console.error("Error deleting profile image:", error);
                // Continue even if image deletion fails
            }
        }

        // Call the delete_user RPC function
        const { error: deleteError } = await supabase.rpc('delete_user', {
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
        await supabaseClient.auth.signOut();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting account:", error);
        return NextResponse.json(
            { error: `Failed to delete account: ${error.message || error}` },
            { status: 500 }
        );
    }
}
