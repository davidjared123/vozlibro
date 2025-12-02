
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Book {
    id: string;
    title: string;
    author: string;
    text_content?: string;
    coverUrl?: string;
    last_position?: number;
    progress_percent?: number;
}

interface PlayerState {
    currentBook: Book | null;
    isPlaying: boolean;
    setCurrentBook: (book: Book) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    play: (book: Book) => void;
    pause: () => void;
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set) => ({
            currentBook: null,
            isPlaying: false,
            setCurrentBook: (book) => set({ currentBook: book }),
            setIsPlaying: (isPlaying) => set({ isPlaying }),
            play: (book) => set({ currentBook: book, isPlaying: true }),
            pause: () => set({ isPlaying: false }),
        }),
        {
            name: 'voz-libro-player-storage',
            partialize: (state) => ({ currentBook: state.currentBook }), // Don't persist isPlaying to avoid auto-play issues
        }
    )
);
