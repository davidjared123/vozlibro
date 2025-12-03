"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Mic2, Settings, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./UserMenu";

const navigation = [
    { name: "Biblioteca", href: "/", icon: Library },
    { name: "Cargar Libro", href: "/upload", icon: Upload },
    { name: "Voces", href: "/voices", icon: Mic2 },
    { name: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-primary">VozLibro</h1>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                                )}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <UserMenu />
            </div>
        </div>
    );
}
