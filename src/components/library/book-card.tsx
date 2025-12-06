"use client";

import { useState } from "react";
import { Play, MoreVertical, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookCardProps {
    id: string;
    title: string;
    author: string;
    coverUrl?: string;
    progress: number;
    duration: string;
    onClick?: () => void;
    onDelete?: () => void;
}

export function BookCard({
    id,
    title,
    author,
    coverUrl,
    progress,
    duration,
    onClick,
    onDelete,
}: BookCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/books/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete book");
            }

            setShowDeleteModal(false);
            onDelete?.();
        } catch (error) {
            console.error("Error deleting book:", error);
            alert("Error al eliminar el libro");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="group relative flex flex-col space-y-3 rounded-xl bg-card p-4 border transition-all hover:bg-accent/50 hover:border-primary/50">
                {/* Menu Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full bg-card/80 backdrop-blur hover:bg-accent transition-colors"
                >
                    <MoreVertical className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-20"
                            onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute top-12 right-2 z-30 bg-card border rounded-lg shadow-lg overflow-hidden min-w-[150px]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    setShowDeleteModal(true);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-red-600 dark:text-red-400"
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </button>
                        </div>
                    </>
                )}

                <div
                    className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted shadow-sm cursor-pointer"
                    onClick={onClick}
                >
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt={title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                            <span className="text-4xl font-bold">{title[0]}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg transform scale-90 transition-transform group-hover:scale-100">
                            <Play className="h-6 w-6 fill-current" />
                        </button>
                    </div>
                </div>
                <div className="space-y-1" onClick={onClick}>
                    <h3 className="font-semibold leading-none truncate" title={title}>
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{author}</p>
                </div>
                <div className="space-y-2 pt-2" onClick={onClick}>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {duration}
                        </div>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">¿Eliminar libro?</h3>
                            <p className="text-sm text-muted-foreground">
                                ¿Estás seguro de que deseas eliminar "{title}"? Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
