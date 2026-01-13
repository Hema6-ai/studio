'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navLinks, type NavLink } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/roles';

export function NavMenu({ role }: { role: UserRole }) {
    const pathname = usePathname();
    const links = role ? navLinks[role] : [];

    return (
        <nav className="flex flex-col h-full">
            <div className="flex-1 p-4">
                <ul className="grid items-start gap-1">
                    {links.map((link: NavLink) => (
                        <li key={link.href}>
                            <Link href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname === link.href && "bg-muted text-primary"
                                )}>
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    )
}
