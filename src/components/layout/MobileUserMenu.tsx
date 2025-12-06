"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function MobileUserMenu() {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    if (!user) return null;

    const avatarUrl = user.user_metadata?.avatar_url;

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut();
        router.push("/landing");
    };

    const handleSettings = () => {
        setIsOpen(false);
        router.push("/settings");
    };

    return (
        <div className="md:hidden fixed top-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-10 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-lg hover:border-primary/50 transition-colors"
            >
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <User className="h-5 w-5 text-primary" />
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-12 right-0 z-50 bg-card border rounded-lg shadow-xl overflow-hidden min-w-[200px]">
                        <div className="px-4 py-3 border-b">
                            <p className="text-sm font-medium truncate">
                                {user.email}
                            </p>
                        </div>
                        <button
                            onClick={handleSettings}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-sm"
                        >
                            <Settings className="h-4 w-4" />
                            Configuración
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-sm border-t"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
