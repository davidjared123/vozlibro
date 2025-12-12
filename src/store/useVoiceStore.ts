import { create } from 'zustand';


interface VoiceState {
    voices: SpeechSynthesisVoice[];
    selectedVoice: SpeechSynthesisVoice | null;
    setVoices: (voices: SpeechSynthesisVoice[]) => void;
    setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
    initializeVoices: () => void;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
    voices: [],
    selectedVoice: null,
    setVoices: (voices) => set({ voices }),
    setSelectedVoice: (voice) => {
        set({ selectedVoice: voice });
        if (voice) {
            localStorage.setItem('voz-libro-voice-name', voice.name);
        }
    },
    initializeVoices: () => {
        const updateVoices = () => {
            const preferredVoiceKeywords = [
                'Google español',
                'Google US',
                'Monica',
                'Mónica',
                'Paulina'
            ];

            const allVoices = window.speechSynthesis.getVoices();

            // Get all Spanish voices
            const spanishVoices = allVoices.filter(voice => voice.lang.startsWith('es'));

            // Sort voices: Google first, then preferred keywords, then others
            const sortedVoices = spanishVoices.sort((a, b) => {
                const aName = a.name;
                const bName = b.name;

                // Check if voices are Google voices
                const aIsGoogle = aName.includes('Google');
                const bIsGoogle = bName.includes('Google');

                if (aIsGoogle && !bIsGoogle) return -1;
                if (!aIsGoogle && bIsGoogle) return 1;

                // Check for other preferred keywords
                const aIndex = preferredVoiceKeywords.findIndex(k => aName.includes(k));
                const bIndex = preferredVoiceKeywords.findIndex(k => bName.includes(k));

                // If both are in preferred list, maintain order from config
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                // If a is preferred and b is not, a comes first
                if (aIndex !== -1) return -1;
                // If b is preferred and a is not, b comes first
                if (bIndex !== -1) return 1;

                // Default alphabetical sort for the rest
                return aName.localeCompare(bName);
            });

            set({ voices: sortedVoices });

            // Handle default selection
            const savedVoiceName = localStorage.getItem('voz-libro-voice-name');
            let voiceToSelect = null;

            if (savedVoiceName) {
                voiceToSelect = sortedVoices.find(v => v.name === savedVoiceName);
            }

            // If not found or not set, default to first available (which will be Google if available)
            if (!voiceToSelect && sortedVoices.length > 0) {
                voiceToSelect = sortedVoices[0];
            }

            if (voiceToSelect) {
                set({ selectedVoice: voiceToSelect });
            }
        };

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
        updateVoices();
    },
}));
