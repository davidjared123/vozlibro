"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TextDisplayProps {
    text: string;
    charIndex: number;
}

export function TextDisplay({ text, charIndex }: TextDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Simple logic to find the current sentence or word range
    // This is a basic approximation for the MVP
    const getHighlightRange = () => {
        if (charIndex < 0 || charIndex >= text.length) return { start: 0, end: 0 };

        // Find start of word (space before)
        let start = text.lastIndexOf(" ", charIndex) + 1;
        if (start === -1) start = 0;

        // Find end of word (space after)
        let end = text.indexOf(" ", charIndex);
        if (end === -1) end = text.length;

        return { start, end };
    };

    const { start, end } = getHighlightRange();

    const before = text.slice(0, start);
    const current = text.slice(start, end);
    const after = text.slice(end);

    return (
        <div
            ref={containerRef}
            className="prose prose-lg dark:prose-invert max-w-none p-6 leading-relaxed"
        >
            <span>{before}</span>
            <span className="bg-primary/30 text-primary font-medium rounded px-0.5">
                {current}
            </span>
            <span>{after}</span>
        </div>
    );
}
