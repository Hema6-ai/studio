'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navLinks, type NavLink, isNavLinkParent } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/roles';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


export function NavMenu({ role }: { role: UserRole }) {
    const pathname = usePathname();
    const links = role ? navLinks[role] : [];

    // Find if the current path is under a parent link
    const activeParent = links.find(link => 
        isNavLinkParent(link) && (
            link.subLinks.some(sub => pathname.startsWith(sub.href)) ||
            (link.href && pathname.startsWith(link.href)) // Also check parent href
        )
    );

    return (
        <nav className="flex flex-col h-full">
            <div className="flex-1 p-4">
                <Accordion type="single" collapsible defaultValue={activeParent?.key} className="w-full">
                    <ul className="grid items-start gap-1">
                        {links.map((link) => {
                            if (isNavLinkParent(link)) {
                                return (
                                    <li key={link.key}>
                                        <AccordionItem value={link.key} className="border-b-0">
                                            <AccordionTrigger 
                                               className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline",
                                                activeParent?.key === link.key && "bg-muted text-primary"
                                               )}
                                            >
                                                <div className="flex items-center gap-3">
                                                   <link.icon className="h-4 w-4" />
                                                    {link.label}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pl-8 pt-2">
                                                <ul className="grid gap-2">
                                                {link.subLinks.map(subLink => (
                                                     <li key={subLink.href}>
                                                        <Link href={subLink.href}
                                                            className={cn(
                                                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                                                pathname === subLink.href && "bg-muted text-primary"
                                                            )}>
                                                            <subLink.icon className="h-4 w-4" />
                                                            {subLink.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </li>
                                );
                            }
                            return (
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
                            );
                        })}
                    </ul>
                </Accordion>
            </div>
        </nav>
    )
}
