"use client";

import { useEffect, useState } from "react";

export default function DebugVoicesPage() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            const spanishVoices = allVoices.filter(v => v.lang.startsWith('es'));
            setVoices(spanishVoices);
            console.log('Spanish voices:', spanishVoices);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Voces en Español Disponibles</h1>
            <p className="mb-4 text-gray-600">Total: {voices.length} voces</p>

            <div className="space-y-4">
                {voices.map((voice, index) => (
                    <div key={index} className="border p-4 rounded-lg bg-white shadow-sm">
                        <h3 className="font-bold text-lg">{voice.name}</h3>
                        <div className="text-sm text-gray-600 mt-2">
                            <p><strong>Lang:</strong> {voice.lang}</p>
                            <p><strong>Local:</strong> {voice.localService ? 'Sí' : 'No'}</p>
                            <p><strong>Default:</strong> {voice.default ? 'Sí' : 'No'}</p>
                            <p><strong>URI:</strong> {voice.voiceURI}</p>
                        </div>
                        <button
                            onClick={() => {
                                const utterance = new SpeechSynthesisUtterance('Hola, esta es una prueba de voz');
                                utterance.voice = voice;
                                window.speechSynthesis.speak(utterance);
                            }}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Probar voz
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
