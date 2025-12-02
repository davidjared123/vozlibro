import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function estimateDuration(text: string): string {
    if (!text) return "--:--";

    const wordsPerMinute = 150; // Average reading speed
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}

export function calculateReadingTime(text: string): number {
    if (!text) return 0;
    const wordsPerMinute = 150;
    const words = text.trim().split(/\s+/).length;
    return words / wordsPerMinute;
}

export function formatTime(totalMinutes: number): string {
    if (!totalMinutes || isNaN(totalMinutes)) return "0:00";

    const seconds = Math.floor(totalMinutes * 60);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}
