
"use client";

import { BookCard } from "./book-card";
import { usePlayerStore, Book } from "@/store/usePlayerStore";
import { estimateDuration } from "@/lib/utils";

interface BookGridProps {
    books: any[];
    onBookDeleted?: () => void;
}

export function BookGrid({ books, onBookDeleted }: BookGridProps) {
    const play = usePlayerStore((state) => state.play);

    return (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {books && books.length > 0 ? (
                books.map((book) => (
                    <BookCard
                        key={book.id}
                        id={book.id}
                        title={book.title}
                        author={book.author || 'Desconocido'}
                        progress={book.progress_percent || 0}
                        duration={estimateDuration(book.text_content || "")}
                        onClick={() => play({
                            id: book.id,
                            title: book.title,
                            author: book.author || 'Desconocido',
                            text_content: book.text_content,
                            last_position: book.last_position,
                        })}
                        onDelete={onBookDeleted}
                    />
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    <p>No tienes libros aún.</p>
                    <p className="text-sm mt-2">Sube tu primer libro para comenzar.</p>
                </div>
            )}
        </div>
    );
}
