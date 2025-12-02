"use client";

import { useEffect } from "react";
import { VoiceCard } from "@/components/voices/voice-card";
import { useVoiceStore } from "@/store/useVoiceStore";

const MOCK_VOICES = [
    {
        id: "1",
        name: "Sofía",
        category: "Narrador de Audiolibros",
        description:
            "Voz cálida y expresiva, ideal para novelas y ficción. Capaz de transmitir emociones sutiles.",
        isPremium: true,
    },
    {
        id: "2",
        name: "Mateo",
        category: "Académico/Profesional",
        description:
            "Tono serio, claro y autoritario. Perfecto para libros de texto, ensayos y documentos técnicos.",
        isPremium: true,
    },
    {
        id: "3",
        name: "Lucía",
        category: "Estándar",
        description: "Voz clara y neutral. Buena para lectura general y noticias.",
        isPremium: false,
    },
    {
        id: "4",
        name: "Carlos",
        category: "Estándar",
        description: "Voz masculina profunda y pausada. Agradable para escuchas largas.",
        isPremium: false,
    },
];

export default function VoicesPage() {
    const { voices, selectedVoice, setSelectedVoice, initializeVoices } = useVoiceStore();

    useEffect(() => {
        initializeVoices();
    }, [initializeVoices]);

    const handlePreview = (id: string) => {
        console.log("Preview voice:", id);
        // TODO: Implement preview logic
    };

    return (
        <div className="container mx-auto max-w-4xl p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Voces Disponibles</h1>
                <p className="text-muted-foreground">
                    Selecciona la voz perfecta para tu audiolibro.
                </p>
            </div>

            <div className="space-y-6">
                {voices.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        No se encontraron voces disponibles.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {voices
                            .filter(v => v.lang.startsWith('es'))
                            .map((voice) => (
                                <VoiceCard
                                    key={voice.name}
                                    id={voice.name}
                                    name={voice.name}
                                    category={voice.lang}
                                    description={`Voz del sistema (${voice.lang})`}
                                    isPremium={false}
                                    isSelected={selectedVoice?.name === voice.name}
                                    onSelect={() => {
                                        console.log("Selecting voice:", voice.name);
                                        setSelectedVoice(voice);
                                    }}
                                    onPreview={handlePreview}
                                />
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
