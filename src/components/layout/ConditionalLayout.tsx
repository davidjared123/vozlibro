"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AudioPlayer } from "@/components/player/audio-player";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Public pages without sidebar/player
    const isPublicPage = pathname === '/landing' || pathname === '/login' || pathname === '/signup';

    if (isPublicPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Sidebar />
            <main className="flex-1 overflow-y-auto pb-32 md:pb-24 bg-background">
                {children}
            </main>
            <AudioPlayer />
            <MobileNav />
        </>
    );
}
