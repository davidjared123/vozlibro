"use client";

import { Play, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlayerPlaceholder() {
    return (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:pl-64">
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded bg-muted animate-pulse" />
                    <div className="space-y-1">
                        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="p-2 hover:text-primary">
                        <SkipBack className="h-5 w-5" />
                    </button>
                    <button className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90">
                        <Play className="h-5 w-5" />
                    </button>
                    <button className="p-2 hover:text-primary">
                        <SkipForward className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
