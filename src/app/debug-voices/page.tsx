"use client";

import { useEffect, useState } from "react";

export default function DebugVoicesPage() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            const spanishVoices = allVoices.filter(v => v.lang.startsWith('es'));

            if (mounted) {
                setVoices(spanishVoices);
                if (spanishVoices.length > 0) {
                    setLoading(false);
                }
                console.log('Spanish voices loaded:', spanishVoices);
            }
        };

        // Try loading immediately
        loadVoices();

        // Set up the event listener
        window.speechSynthesis.onvoiceschanged = loadVoices;

        // Poll for voices in case the event doesn't fire
        const pollInterval = setInterval(() => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                loadVoices();
                clearInterval(pollInterval);
            }
        }, 100);

        // Clean up after 5 seconds
        const timeout = setTimeout(() => {
            clearInterval(pollInterval);
            setLoading(false);
        }, 5000);

        return () => {
            mounted = false;
            clearInterval(pollInterval);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Voces en Español Disponibles</h1>

            {loading && voices.length === 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700">⏳ Cargando voces...</p>
                </div>
            )}

            <p className="mb-4 text-gray-600">Total: {voices.length} voces</p>

            {voices.length === 0 && !loading && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">⚠️ No se encontraron voces en español. Intenta recargar la página.</p>
                </div>
            )}

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
