
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseTextToSpeechProps {
    onEnd?: () => void;
}

export function useTextToSpeech({ onEnd }: UseTextToSpeechProps = {}) {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [speaking, setSpeaking] = useState(false);
    const [paused, setPaused] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [rate, setRate] = useState(1);
    const [volume, setVolume] = useState(1);

    // Refs to manage state without triggering re-renders during playback loop
    const chunksRef = useRef<string[]>([]);
    const textRef = useRef<string | null>(null);
    const currentChunkIndexRef = useRef(0);
    const isCancelledRef = useRef(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        const updateVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);

            // Try to restore saved voice
            const savedVoiceName = localStorage.getItem('voz-libro-voice');
            if (savedVoiceName) {
                const savedVoice = availableVoices.find(v => v.name === savedVoiceName);
                if (savedVoice) {
                    setSelectedVoice(savedVoice);
                    return;
                }
            }

            // Default to first Spanish voice if available
            const esVoice = availableVoices.find((v) => v.lang.startsWith("es"));
            if (esVoice) setSelectedVoice(esVoice);
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            window.speechSynthesis.cancel();
        };
    }, []);

    // Save selected voice to localStorage
    useEffect(() => {
        if (selectedVoice) {
            localStorage.setItem('voz-libro-voice', selectedVoice.name);
        }
    }, [selectedVoice]);

    useEffect(() => {
        if (speaking && !paused) {
            window.speechSynthesis.cancel();
            speakChunk(currentChunkIndexRef.current);
        }
    }, [rate, volume]);

    const speakChunk = useCallback((index: number) => {
        if (index >= chunksRef.current.length || isCancelledRef.current) {
            setSpeaking(false);
            setPaused(false);
            onEnd?.();
            return;
        }

        const text = chunksRef.current[index];
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance; // Keep reference to prevent GC

        utterance.rate = rate;
        utterance.volume = volume;
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
            console.log("Utterance started for chunk:", index);
            setSpeaking(true);
            setPaused(false);
            currentChunkIndexRef.current = index;
            setCurrentChunkIndex(index);
        };

        utterance.onend = () => {
            if (!isCancelledRef.current) {
                speakChunk(index + 1);
            }
        };

        utterance.onerror = (event) => {
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
                console.error("Speech synthesis error:", event);
                setSpeaking(false);
                setPaused(false);
            }
        };

        utterance.onboundary = (event) => {
            if (event.name === "word" || event.name === "sentence") {
                setCharIndex(event.charIndex);
            }
        };

        console.log("Queueing chunk:", index);
        window.speechSynthesis.speak(utterance);
    }, [selectedVoice, onEnd, rate, volume]);

    const speak = useCallback(
        (text: string, startIndex: number = 0) => {
            if (!text) return;

            console.time("speak_setup");
            window.speechSynthesis.cancel();
            isCancelledRef.current = false;
            setSpeaking(true);

            // Check if we can reuse cached chunks
            if (text !== textRef.current || chunksRef.current.length === 0) {
                console.time("text_splitting");
                // Split text into chunks (sentences)
                const splitText = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
                chunksRef.current = splitText.map(t => t.trim()).filter(t => t.length > 0);
                textRef.current = text;
                console.timeEnd("text_splitting");
            }

            if (chunksRef.current.length === 0) {
                console.warn("No text chunks found to speak");
                setSpeaking(false);
                console.timeEnd("speak_setup");
                return;
            }

            // Validate start index
            const safeStartIndex = Math.max(0, Math.min(startIndex, chunksRef.current.length - 1));

            currentChunkIndexRef.current = safeStartIndex;
            setCurrentChunkIndex(safeStartIndex);

            console.timeEnd("speak_setup");
            console.log("Starting playback with chunks:", chunksRef.current.length);
            speakChunk(safeStartIndex);
        },
        [speakChunk]
    );

    const pause = useCallback(() => {
        window.speechSynthesis.pause();
        setPaused(true);
    }, []);

    const resume = useCallback(() => {
        window.speechSynthesis.resume();
        setPaused(false);
    }, []);

    const skip = useCallback((amount: number) => {
        // Calculate new index
        const newIndex = currentChunkIndexRef.current + amount;
        const safeIndex = Math.max(0, Math.min(newIndex, chunksRef.current.length - 1));

        if (safeIndex !== currentChunkIndexRef.current) {
            window.speechSynthesis.cancel();
            currentChunkIndexRef.current = safeIndex;
            setCurrentChunkIndex(safeIndex);

            if (speaking || !paused) {
                speakChunk(safeIndex);
            }
        }
    }, [speaking, paused, speakChunk]);

    const jumpTo = useCallback((index: number) => {
        const safeIndex = Math.max(0, Math.min(index, chunksRef.current.length - 1));

        if (safeIndex !== currentChunkIndexRef.current) {
            window.speechSynthesis.cancel();
            currentChunkIndexRef.current = safeIndex;
            setCurrentChunkIndex(safeIndex);

            if (speaking || !paused) {
                speakChunk(safeIndex);
            }
        }
    }, [speaking, paused, speakChunk]);

    const cancel = useCallback(() => {
        isCancelledRef.current = true;
        window.speechSynthesis.cancel();
        setSpeaking(false);
        setPaused(false);
        setCharIndex(0);
        chunksRef.current = [];
        textRef.current = null;
        currentChunkIndexRef.current = 0;
        setCurrentChunkIndex(0);
    }, []);

    return {
        voices,
        speaking,
        paused,
        selectedVoice,
        charIndex,
        currentChunkIndex,
        totalChunks: chunksRef.current.length,
        setSelectedVoice,
        speak,
        pause,
        resume,
        cancel,
        skip,
        jumpTo,
        rate,
        setRate,
        volume,
        setVolume,
    };
}
