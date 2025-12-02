"use client";

import { useState, useEffect } from "react";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Maximize2,
} from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { cn, estimateDuration, calculateReadingTime, formatTime } from "@/lib/utils";

import { updateBookProgress } from "@/app/actions";

import { supabase } from "@/lib/supabase";

export function AudioPlayer() {
    const { currentBook, isPlaying, setIsPlaying, setCurrentBook, pause: pauseStore, play: playStore } = usePlayerStore();
    const { speak, pause, resume, cancel, skip, jumpTo, speaking, paused, charIndex, voices, selectedVoice, setSelectedVoice, currentChunkIndex, totalChunks, rate, setRate, volume, setVolume } = useTextToSpeech({
        onEnd: () => setIsPlaying(false),
    });

    // Sync with DB on mount/book change to ensure we have the latest progress (e.g. from another device)
    useEffect(() => {
        if (currentBook?.id) {
            const fetchProgress = async () => {
                const { data, error } = await supabase
                    .from('books')
                    .select('last_position, progress_percent')
                    .eq('id', currentBook.id)
                    .single();

                if (data && !error) {
                    // If DB has a position and it's different from ours, update ours
                    // We prioritize DB if it's ahead, or maybe just always sync to DB on load?
                    // Let's trust DB on initial load of the component if we are not currently playing.
                    if (!speaking && data.last_position !== currentBook.last_position) {
                        console.log("Syncing from DB:", data.last_position);
                        setCurrentBook({ ...currentBook, last_position: data.last_position, progress_percent: data.progress_percent } as any);
                    }
                }
            };
            fetchProgress();
        }
    }, [currentBook?.id, setCurrentBook, speaking]);

    // Save progress periodically
    useEffect(() => {
        if (currentBook && isPlaying && !paused) {
            const timer = setTimeout(() => {
                const progressPercent = totalChunks > 0 ? Math.round((currentChunkIndex / totalChunks) * 100) : 0;
                updateBookProgress(currentBook.id, currentChunkIndex, progressPercent);
                // Update store to keep UI in sync if we switch voices or reload
                setCurrentBook({ ...currentBook, last_position: currentChunkIndex, progress_percent: progressPercent } as any);
            }, 2000); // Debounce 2s
            return () => clearTimeout(timer);
        }
    }, [currentChunkIndex, currentBook, isPlaying, paused, totalChunks, setCurrentBook]);

    // Effect to handle play/pause/change book
    useEffect(() => {
        if (currentBook && isPlaying) {
            if (!speaking && !paused) {
                // Start speaking new book from last position
                speak(currentBook.text_content || "", currentBook.last_position || 0);
            } else if (paused) {
                resume();
            }
        } else if (!isPlaying && speaking && !paused) {
            pause();
        }
    }, [currentBook, isPlaying, speak, pause, resume, speaking, paused]);

    // Effect to handle book change specifically (reset)
    useEffect(() => {
        if (currentBook) {
            cancel(); // Stop previous
        }
    }, [currentBook?.id]); // Only when ID changes

    if (!currentBook) return null;

    return (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 md:pl-64 transition-all duration-300">
            <div className="flex flex-col h-24 md:h-20">
                {/* Progress Bar */}
                <div className="w-full h-1 bg-muted cursor-pointer group relative">
                    <div
                        className="h-full bg-primary relative group-hover:h-1.5 transition-all"
                        style={{
                            width: `${totalChunks > 0
                                ? Math.min(100, (currentChunkIndex / totalChunks) * 100)
                                : 0}%`
                        }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={totalChunks - 1 || 0}
                        value={currentChunkIndex}
                        onChange={(e) => jumpTo(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                </div>

                <div className="flex-1 flex items-center justify-between px-4 md:px-6">
                    {/* Book Info */}
                    <div className="flex items-center space-x-4 w-1/3">
                        <div className="h-12 w-8 bg-muted rounded hidden sm:block flex-shrink-0 overflow-hidden">
                            {currentBook.coverUrl ? (
                                <img src={currentBook.coverUrl} alt={currentBook.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                    {currentBook.title[0]}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold truncate">{currentBook.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">
                                {currentBook.author}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center justify-center w-1/3 space-y-1">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => skip(-1)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                title="Anterior oración"
                            >
                                <SkipBack className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-transform active:scale-95"
                            >
                                {isPlaying ? (
                                    <Pause className="h-5 w-5 fill-current" />
                                ) : (
                                    <Play className="h-5 w-5 fill-current ml-0.5" />
                                )}
                            </button>
                            <button
                                onClick={() => skip(1)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                title="Siguiente oración"
                            >
                                <SkipForward className="h-5 w-5" />
                            </button>
                        </div>
                        <span className="text-xs text-muted-foreground hidden md:inline-block">
                            {currentBook ? `${formatTime(calculateReadingTime(currentBook.text_content || "") * (currentChunkIndex / (totalChunks || 1)))} / ${formatTime(calculateReadingTime(currentBook.text_content || ""))}` : "0:00 / 0:00"}
                        </span>
                    </div>

                    {/* Secondary Controls */}
                    <div className="flex items-center justify-end space-x-4 w-1/3">
                        {/* Voice Selector */}
                        <div className="hidden md:block">
                            <select
                                className="h-8 w-48 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={selectedVoice?.name || ""}
                                onChange={(e) => {
                                    const voice = voices.find((v) => v.name === e.target.value);
                                    if (voice) {
                                        // Save current position to store before switching
                                        setCurrentBook({ ...currentBook, last_position: currentChunkIndex } as any);

                                        setSelectedVoice(voice);
                                        // If playing, restart with new voice
                                        if (isPlaying) {
                                            cancel();
                                            setTimeout(() => {
                                                setIsPlaying(true);
                                                // The effect will pick up the change and start speaking from currentBook.last_position
                                            }, 100);
                                        }
                                    }
                                }}
                            >
                                {voices
                                    .filter(v => v.lang.startsWith('es'))
                                    .sort((a, b) => {
                                        // Prioritize known high-quality voices
                                        const priority = ["Google", "Premium", "Monica", "Paulina", "Jorge", "Diego"];
                                        const aScore = priority.findIndex(p => a.name.includes(p));
                                        const bScore = priority.findIndex(p => b.name.includes(p));

                                        if (aScore !== -1 && bScore !== -1) return aScore - bScore;
                                        if (aScore !== -1) return -1;
                                        if (bScore !== -1) return 1;
                                        return 0;
                                    })
                                    .slice(0, 6) // Show top 6 relevant voices
                                    .map((voice) => {
                                        let description = voice.name;
                                        if (voice.name.includes("Monica")) description = "Mónica (España - Natural)";
                                        else if (voice.name.includes("Paulina")) description = "Paulina (México - Natural)";
                                        else if (voice.name.includes("Jorge")) description = "Jorge (España - Masculina)";
                                        else if (voice.name.includes("Diego")) description = "Diego (Argentina - Masculina)";
                                        else if (voice.name.includes("Google")) description = `Google (${voice.lang.split('-')[1] || 'ES'})`;
                                        else description = `${voice.name.replace('Microsoft', '').replace('Online', '').trim()} (${voice.lang})`;

                                        return (
                                            <option key={voice.name} value={voice.name}>
                                                {description}
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>

                        <div className="hidden md:flex items-center space-x-2 w-24 group relative">
                            <button
                                onClick={() => setVolume(volume === 0 ? 1 : 0)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {volume === 0 ? (
                                    <Volume2 className="h-4 w-4 text-muted-foreground opacity-50" />
                                ) : (
                                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>
                            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden cursor-pointer relative">
                                <div
                                    className="h-full bg-foreground/50 absolute left-0 top-0"
                                    style={{ width: `${volume * 100}%` }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
                                const currentIndex = speeds.indexOf(rate);
                                const nextIndex = (currentIndex + 1) % speeds.length;
                                setRate(speeds[nextIndex]);
                            }}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Velocidad"
                        >
                            <span className="text-xs font-bold border rounded px-1 py-0.5 min-w-[3rem] text-center inline-block">
                                {rate}x
                            </span>
                        </button>
                        <button className="text-muted-foreground hover:text-foreground transition-colors md:hidden">
                            <Maximize2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
