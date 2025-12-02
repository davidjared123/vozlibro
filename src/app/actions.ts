"use server";

import { PDFParse } from "pdf-parse";
import { supabase } from "@/lib/supabase";

export async function parsePdf(formData: FormData) {
    const file = formData.get("file") as File;

    if (!file) {
        throw new Error("No file provided");
    }

    // Check book limit (Max 5)
    // Note: Since we don't have auth yet, this is a global limit or per-session if we had session ID.
    // For now, we'll just check total books in DB as a simple safeguard.
    const { count, error: countError } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error("Error checking book limit:", countError);
        throw new Error("Failed to check book limit");
    }

    if (count !== null && count >= 5) {
        throw new Error("Límite de libros alcanzado (Máximo 5). Por favor elimina algunos libros para continuar.");
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        await parser.destroy();

        // Save to Supabase
        const { data, error } = await supabase
            .from('books')
            .insert([
                {
                    title: file.name.replace(/\.pdf$/i, ''), // Remove .pdf extension
                    author: 'Desconocido', // result.info?.Author || 'Desconocido',
                    text_content: result.text,
                    // created_at is automatic
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error saving to Supabase:", error);
            throw new Error("Failed to save book to database");
        }

        return {
            id: data.id,
            text: result.text,
            // info: result.metadata,
            // metadata: result.metadata,
            numPages: result.pages ? result.pages.length : 0,
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
