"use client";

import { useState } from "react";
import { VoiceCard } from "@/components/voices/voice-card";

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
    const [selectedVoice, setSelectedVoice] = useState("1");

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
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        Premium
                        <span className="ml-2 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20">
                            Recomendado
                        </span>
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {MOCK_VOICES.filter((v) => v.isPremium).map((voice) => (
                            <VoiceCard
                                key={voice.id}
                                {...voice}
                                isSelected={selectedVoice === voice.id}
                                onSelect={setSelectedVoice}
                                onPreview={handlePreview}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Estándar</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {MOCK_VOICES.filter((v) => !v.isPremium).map((voice) => (
                            <VoiceCard
                                key={voice.id}
                                {...voice}
                                isSelected={selectedVoice === voice.id}
                                onSelect={setSelectedVoice}
                                onPreview={handlePreview}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
