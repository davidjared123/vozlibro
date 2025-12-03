"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const { data, error } = await supabaseClient.auth.getSession();

            if (error) {
                console.error("Error during auth callback:", error);
                router.push("/login");
                return;
            }

            if (data.session) {
                router.push("/");
            } else {
                router.push("/login");
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Completando inicio de sesión...</p>
            </div>
        </div>
    );
}
