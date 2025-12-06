"use server";

import { supabase } from "@/lib/supabase";

export async function updateBookProgress(id: string, lastPosition: number, progressPercent: number) {
    const { error } = await supabase
        .from('books')
        .update({
            last_position: lastPosition,
            progress_percent: progressPercent
        })
        .eq('id', id);

    if (error) {
        console.error("Error updating progress:", error);
        // Don't throw, just log. Progress update failure shouldn't crash the app.
    }
}
