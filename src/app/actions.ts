"use server";

import { supabase } from "@/lib/supabase";

export async function parsePdf(formData: FormData, userId: string) {
    const file = formData.get("file") as File;

    if (!file) {
        throw new Error("No file provided");
    }

    if (!userId) {
        throw new Error("User not authenticated");
    }

    // Check book limit (Max 5 per user)
    const { count, error: countError } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (countError) {
        console.error("Error checking book limit:", countError);
        throw new Error("Failed to check book limit");
    }

    if (count !== null && count >= 5) {
        throw new Error("Límite de libros alcanzado (Máximo 5). Por favor elimina algunos libros para continuar.");
    }

    try {
        // Dynamic import to ensure Server Component compatibility
        // pdf-parse has different exports for CommonJS vs ES modules
        const pdfParse = await import("pdf-parse");
        const pdf = (pdfParse as any).default || pdfParse;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdf(buffer);

        // Save to Supabase with user_id
        const { data: bookData, error } = await supabase
            .from('books')
            .insert([
                {
                    title: file.name.replace(/\.pdf$/i, ''), // Remove .pdf extension
                    author: 'Desconocido', // data.info?.Author || 'Desconocido',
                    text_content: data.text,
                    user_id: userId,
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error saving to Supabase:", error);
            throw new Error("Failed to save book to database");
        }

        return {
            id: bookData.id,
            text: data.text,
            numPages: data.numpages,
        };
    } catch (error: any) {
        console.error("Error parsing PDF:", error);
        throw new Error(`Failed to parse PDF: ${error.message || error}`);
    }
}

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
