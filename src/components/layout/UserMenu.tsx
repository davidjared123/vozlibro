"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserMenu() {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    if (!user) return null;

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors w-full"
            >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                        {user.email}
                    </p>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border rounded-lg shadow-lg overflow-hidden z-20">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors text-sm"
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
