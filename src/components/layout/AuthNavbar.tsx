import Link from "next/link";
import { BookOpen } from "lucide-react";

export function AuthNavbar() {
    return (
        <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
            <div className="container mx-auto px-6 py-4">
                <Link href="/landing" className="flex items-center space-x-2 w-fit">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-primary">VozLibro</span>
                </Link>
            </div>
        </nav>
    );
}
