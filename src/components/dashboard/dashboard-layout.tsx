'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PanelLeft, Search } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserNav } from './user-nav';
import { NavMenu } from './nav-menu';
import { Logo } from '../icons';
import type { UserRole } from '@/lib/roles';
import Link from 'next/link';
import { AppLauncher } from './app-launcher';
import { AiChat } from './ai-chat';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Handle nested routes like /student/medical-leave
  const role = pathname.split('/')[1] as UserRole;
  
  const isSubPage = pathname.split('/').length > 2;
  // Conditional class to avoid extra padding on student sub-pages which have their own layout
  const mainContentClass = role === 'student' && isSubPage ? '' : 'sm:pl-64';

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       {/* Main sidebar - hidden on student sub-pages */}
      {!(role === 'student' && isSubPage) && (
         <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
            <div className="flex h-16 items-center gap-2 border-b px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Logo className="h-6 w-6 text-primary" />
                  <span className="font-headline">CampusOS</span>
                </Link>
            </div>
            <NavMenu role={role} />
        </aside>
      )}
     
      <div className={`flex flex-col sm:gap-4 sm:py-4 ${mainContentClass}`}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0">
                <div className="flex h-16 items-center gap-2 border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Logo className="h-6 w-6 text-primary" />
                        <span className="font-headline">CampusOS</span>
                    </Link>
                </div>
                <NavMenu role={role} />
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <AppLauncher />
          <UserNav />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
       <AiChat />
    </div>
  );
}
