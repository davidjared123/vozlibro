"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, BookOpen, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function UploadPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<string>("");
    const { user } = useAuth();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/epub+zip": [".epub"],
        },
    });

    const removeFile = (name: string) => {
        setFiles((files) => files.filter((f) => f.name !== name));
    };

    const handleProcess = async () => {
        if (files.length === 0 || !user) return;

        setIsProcessing(true);
        setStatus("Procesando archivos...");

        try {
            for (const file of files) {
                if (file.type === "application/pdf") {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("userId", user.id);

                    setStatus(`Procesando ${file.name}...`);

                    // Use API route instead of Server Action
                    const response = await fetch("/api/parse-pdf", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Error al procesar el PDF");
                    }

                    const result = await response.json();
                    console.log("PDF Parsed:", result);
                } else {
                    console.warn("Unsupported file type for processing:", file.type);
                }
            }
            setStatus("¡Procesamiento completado!");
            setFiles([]); // Clear files after successful processing
        } catch (error) {
            console.error("Error processing files:", error);
            setStatus(error instanceof Error ? error.message : "Error al procesar los archivos.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto max-w-4xl p-6 space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Cargar Libros</h1>
                    <p className="text-muted-foreground">
                        Sube tus archivos PDF o EPUB para convertirlos en audiolibros.
                    </p>
                </div>

                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                        isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Upload className="h-8 w-8 text-primary" />
                    </div>
                    {isDragActive ? (
                        <p className="text-lg font-medium">Suelta los archivos aquí...</p>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-lg font-medium">
                                Arrastra y suelta archivos aquí, o haz clic para seleccionar
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Soporta PDF y EPUB hasta 50MB
                            </p>
                        </div>
                    )}
                </div>

                {files.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Archivos Seleccionados</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {files.map((file) => (
                                <div
                                    key={file.name}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 rounded bg-primary/10">
                                            {file.type === "application/pdf" ? (
                                                <FileText className="h-6 w-6 text-primary" />
                                            ) : (
                                                <BookOpen className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium truncate max-w-[200px]">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file.name)}
                                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                                        disabled={isProcessing}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {status && (
                            <div className="p-4 rounded-lg bg-muted text-muted-foreground text-sm">
                                {status}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={handleProcess}
                                disabled={isProcessing}
                                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isProcessing ? "Procesando..." : `Procesar ${files.length} ${files.length === 1 ? "Libro" : "Libros"}`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
