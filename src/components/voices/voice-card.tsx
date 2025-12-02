"use client";

import { Play, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceCardProps {
    id: string;
    name: string;
    category: string;
    description: string;
    isPremium?: boolean;
    isSelected?: boolean;
    onSelect: (id: string) => void;
    onPreview: (id: string) => void;
}

export function VoiceCard({
    id,
    name,
    category,
    description,
    isPremium,
    isSelected,
    onSelect,
    onPreview,
}: VoiceCardProps) {
    return (
        <div
            className={cn(
                "relative flex flex-col space-y-3 rounded-xl border p-4 transition-all cursor-pointer",
                isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "bg-card hover:bg-accent/50 hover:border-primary/50"
            )}
            onClick={() => onSelect(id)}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                        {name[0]}
                    </div>
                    <div>
                        <h3 className="font-semibold leading-none flex items-center">
                            {name}
                            {isPremium && (
                                <Star className="ml-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                            )}
                        </h3>
                        <p className="text-xs text-muted-foreground">{category}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPreview(id);
                        }}
                        className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <Play className="h-4 w-4 fill-current" />
                    </button>
                </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
            </p>
            {isSelected && (
                <div className="absolute top-4 right-4">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                    </div>
                </div>
            )}
        </div>
    );
}
