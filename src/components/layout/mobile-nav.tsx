"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Mic2, Settings, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Biblioteca", href: "/", icon: Library },
    { name: "Cargar", href: "/upload", icon: Upload },
    { name: "Voces", href: "/voices", icon: Mic2 },
    { name: "Ajustes", href: "/settings", icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-4 md:hidden">
            {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-accent-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
