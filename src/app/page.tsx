import { BookGrid } from "@/components/library/book-grid";
import { Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function Home() {
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching books:", JSON.stringify(error, null, 2));
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
          <p className="text-muted-foreground">
            Tus libros convertidos a audio.
          </p>
        </div>
        <Link
          href="/upload"
          className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Libro</span>
        </Link>
      </div>

      <BookGrid books={books || []} />
    </div>
  );
}
