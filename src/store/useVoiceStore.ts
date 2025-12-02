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
            const availableVoices = window.speechSynthesis.getVoices()
                .filter(voice => voice.lang.startsWith('es'));
            set({ voices: availableVoices });

            const savedVoiceName = localStorage.getItem('voz-libro-voice-name');
            let voiceToSelect = null;

            if (savedVoiceName) {
                voiceToSelect = availableVoices.find(v => v.name === savedVoiceName);
            }

            // If not found or not set, default to first available
            if (!voiceToSelect && availableVoices.length > 0) {
                voiceToSelect = availableVoices[0];
            }

            if (voiceToSelect) {
                set({ selectedVoice: voiceToSelect });
            }
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;
    },
}));
