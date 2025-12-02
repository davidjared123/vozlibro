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
            // Filter for specific high-quality Spanish voices
            // Using partial matching to catch different name variations
            const preferredVoiceKeywords = [
                'Google español',
                'Helena',
                'Sabina',
                'Monica',
                'Mónica'
            ];

            const allVoices = window.speechSynthesis.getVoices();
            const availableVoices = allVoices.filter(voice =>
                voice.lang.startsWith('es') &&
                preferredVoiceKeywords.some(keyword => voice.name.includes(keyword))
            );

            // If no preferred voices found, fall back to all Spanish voices
            const voicesToUse = availableVoices.length > 0 ? availableVoices : allVoices.filter(v => v.lang.startsWith('es'));
            set({ voices: voicesToUse });

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
