"use client";

import Link from "next/link";
import { BookOpen, Mic2, Zap, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Redirect to library if already logged in
    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
            {/* Navbar */}
            <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold text-primary">VozLibro</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href="/signup"
                                className="hidden md:block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Comenzar gratis
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                        Convierte tus libros en{" "}
                        <span className="text-primary">audiolibros</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Sube tus PDFs y escúchalos con voces de IA de alta calidad.
                        Perfecto para aprender mientras haces otras actividades.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/signup"
                            className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            Comenzar ahora
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="hidden md:inline-flex px-8 py-4 border rounded-lg text-lg font-medium hover:bg-accent transition-colors"
                        >
                            Iniciar sesión
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
                    <div className="p-6 rounded-xl border bg-card/50 backdrop-blur space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Conversión instantánea</h3>
                        <p className="text-muted-foreground">
                            Sube tu PDF y comienza a escuchar en segundos. Sin esperas, sin complicaciones.
                        </p>
                    </div>

                    <div className="p-6 rounded-xl border bg-card/50 backdrop-blur space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Mic2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Voces naturales</h3>
                        <p className="text-muted-foreground">
                            Elige entre múltiples voces en español de alta calidad con sonido natural.
                        </p>
                    </div>

                    <div className="p-6 rounded-xl border bg-card/50 backdrop-blur space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Tus datos seguros</h3>
                        <p className="text-muted-foreground">
                            Tus libros son privados y solo tú puedes acceder a ellos. Seguridad garantizada.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-24 max-w-3xl mx-auto text-center space-y-6 p-12 rounded-2xl border bg-card/50 backdrop-blur">
                    <h2 className="text-3xl font-bold">¿Listo para empezar?</h2>
                    <p className="text-lg text-muted-foreground">
                        Crea tu cuenta gratis y convierte tu primer libro en audiolibro hoy mismo.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                    >
                        Comenzar gratis
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t mt-24">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <span className="font-bold text-primary">VozLibro</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2024 VozLibro. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
