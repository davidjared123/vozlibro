import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

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

        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        const userId = user.id;

        // Check book limit (Max 5 per user)
        const { count, error: countError } = await supabaseServer
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

        // Use pdf2json - works well in serverless, no browser APIs
        const PDFParser = (await import("pdf2json")).default;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF using pdf2json
        const pdfParser = new PDFParser();

        const pdfData = await new Promise<any>((resolve, reject) => {
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                resolve(pdfData);
            });

            pdfParser.on("pdfParser_dataError", (error: any) => {
                reject(error);
            });

            pdfParser.parseBuffer(buffer);
        });

        // Extract text from parsed PDF
        let fullText = '';
        let numPages = 0;

        if (pdfData && pdfData.Pages) {
            numPages = pdfData.Pages.length;

            for (const page of pdfData.Pages) {
                if (page.Texts) {
                    for (const text of page.Texts) {
                        if (text.R) {
                            for (const run of text.R) {
                                if (run.T) {
                                    fullText += decodeURIComponent(run.T) + ' ';
                                }
                            }
                        }
                    }
                    fullText += '\n';
                }
            }
        }

        // Clean up the extracted text
        fullText = fullText
            // Remove excessive tabs and spaces
            .replace(/\t+/g, ' ')
            .replace(/ {2,}/g, ' ')
            // Remove spaces between individual letters (common in PDFs)
            .replace(/(\w) (\w)/g, '$1$2')
            // Restore spaces after punctuation
            .replace(/([.,;:!?])(\w)/g, '$1 $2')
            // Clean up multiple newlines
            .replace(/\n{3,}/g, '\n\n')
            // Trim each line
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .trim();

        const data = {
            text: fullText || "No se pudo extraer texto del PDF",
            numpages: numPages
        };

        // Save to Supabase with user_id
        const { data: bookData, error } = await supabaseServer
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
