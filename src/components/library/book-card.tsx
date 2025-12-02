"use client";

import { Play, MoreVertical, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookCardProps {
    title: string;
    author: string;
    coverUrl?: string;
    progress: number;
    duration: string;
    onClick?: () => void;
}

export function BookCard({
    title,
    author,
    coverUrl,
    progress,
    duration,
    onClick,
}: BookCardProps) {
    return (
        <div
            className="group relative flex flex-col space-y-3 rounded-xl bg-card p-4 border transition-all hover:bg-accent/50 hover:border-primary/50 cursor-pointer"
            onClick={onClick}
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted shadow-sm">
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
            <div className="space-y-1">
                <h3 className="font-semibold leading-none truncate" title={title}>
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{author}</p>
            </div>
            <div className="space-y-2 pt-2">
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
    );
}
