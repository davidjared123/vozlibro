"use client";

import { useEffect, useState } from "react";
import { BookGrid } from "@/components/library/book-grid";
import { Plus } from "lucide-react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase-client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, [user]);

  const fetchBooks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabaseClient
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching books:", JSON.stringify(error, null, 2));
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <BookGrid books={books} onBookDeleted={fetchBooks} />
        )}
      </div>
    </ProtectedRoute>
  );
}
