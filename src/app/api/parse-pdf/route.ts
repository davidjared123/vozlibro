import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const userId = formData.get("userId") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        // Check book limit (Max 5 per user)
        const { count, error: countError } = await supabase
            .from('books')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) {
            console.error("Error checking book limit:", countError);
            return NextResponse.json(
                { error: "Failed to check book limit" },
                { status: 500 }
            );
        }

        if (count !== null && count >= 5) {
            return NextResponse.json(
                { error: "Límite de libros alcanzado (Máximo 5). Por favor elimina algunos libros para continuar." },
                { status: 400 }
            );
        }

        // Dynamic import of pdf-parse
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
                    title: file.name.replace(/\.pdf$/i, ''),
                    author: 'Desconocido',
                    text_content: data.text,
                    user_id: userId,
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error saving to Supabase:", error);
            return NextResponse.json(
                { error: "Failed to save book to database" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            id: bookData.id,
            text: data.text,
            numPages: data.numpages,
        });
    } catch (error: any) {
        console.error("Error parsing PDF:", error);
        return NextResponse.json(
            { error: `Failed to parse PDF: ${error.message || error}` },
            { status: 500 }
        );
    }
}
