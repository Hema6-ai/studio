'use client';

import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  FileUp,
  Landmark,
  Menu,
  Briefcase,
  Stethoscope,
  Users2,
  Book,
} from "lucide-react"
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { isNavLinkParent, navLinks } from "@/lib/navigation";


export default function StudentSubLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const studentNav = navLinks.student || [];
    const docSubmissionParent = studentNav.find(item => isNavLinkParent(item) && item.key === 'document-submission');
    const availabilityParent = studentNav.find(item => isNavLinkParent(item) && item.key === 'availability');
    
    const docSubNavLinks = isNavLinkParent(docSubmissionParent) ? docSubmissionParent.subLinks : [];
    const availabilitySubLinks = isNavLinkParent(availabilityParent) ? availabilityParent.subLinks : [];
    
    const isCurriculumPage = pathname.startsWith('/student/curriculum');
    const isAvailabilityPage = pathname.startsWith('/student/availability');
    const isDocSubmissionPage = pathname.startsWith('/student/medical-leave') || pathname.startsWith('/student/fee-receipt');
    
    // Don't show this specialized layout on the main student dashboard page
    if (!isCurriculumPage && !isAvailabilityPage && !isDocSubmissionPage) {
        return <>{children}</>;
    }
    
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <h3 className="font-semibold">Student Menu</h3>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
             <Link
                href="/student/curriculum"
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-base",
                    isCurriculumPage && "bg-muted text-primary"
                )}
                >
                <Book className="h-4 w-4" />
                Curriculum
              </Link>
              <Accordion type="multiple" defaultValue={['document-submission', 'availability']} className="w-full">
                <AccordionItem value="document-submission" className="border-b-0">
                  <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline text-base">
                      <div className="flex items-center gap-3">
                        <FileUp className="h-4 w-4" />
                        Document Submission
                      </div>
                  </AccordionTrigger>
                   <AccordionContent className="pl-8 pt-2">
                      <ul className="grid gap-2">
                        {docSubNavLinks.map(link => (
                          <li key={link.href}>
                              <Link
                                  href={link.href}
                                  className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                      pathname === link.href && "bg-muted text-primary"
                                  )}
                              >
                                  <link.icon className="h-4 w-4" />
                                  {link.label}
                              </Link>
                          </li>
                        ))}
                      </ul>
                   </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="availability" className="border-b-0">
                  <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline text-base">
                      <div className="flex items-center gap-3">
                        <Users2 className="h-4 w-4" />
                        Availability
                      </div>
                  </AccordionTrigger>
                   <AccordionContent className="pl-8 pt-2">
                      <ul className="grid gap-2">
                        {availabilitySubLinks.map(link => (
                          <li key={link.href}>
                              <Link
                                  href={link.href}
                                  className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                      pathname === link.href && "bg-muted text-primary"
                                  )}
                              >
                                  <link.icon className="h-4 w-4" />
                                  {link.label}
                              </Link>
                          </li>
                        ))}
                      </ul>
                   </AccordionContent>
                </AccordionItem>
              </Accordion>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                 <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  <Link
                    href="/student/curriculum"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-base",
                        isCurriculumPage && "bg-muted text-primary"
                    )}
                    >
                    <Book className="h-5 w-5" />
                    Curriculum
                  </Link>
                  <Accordion type="multiple" defaultValue={['document-submission', 'availability']} className="w-full">
                    <AccordionItem value="document-submission" className="border-b-0">
                      <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline text-base">
                          <div className="flex items-center gap-3">
                            <FileUp className="h-5 w-5" />
                            Document Submission
                          </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8 pt-2">
                          <ul className="grid gap-2">
                            {docSubNavLinks.map(link => (
                              <li key={link.href}>
                                  <Link
                                      href={link.href}
                                      className={cn(
                                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                          pathname === link.href && "bg-muted text-primary"
                                      )}
                                  >
                                      <link.icon className="h-5 w-5" />
                                      {link.label}
                                  </Link>
                              </li>
                            ))}
                          </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="availability" className="border-b-0">
                      <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:no-underline text-base">
                          <div className="flex items-center gap-3">
                            <Users2 className="h-5 w-5" />
                            Availability
                          </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8 pt-2">
                          <ul className="grid gap-2">
                            {availabilitySubLinks.map(link => (
                              <li key={link.href}>
                                  <Link
                                      href={link.href}
                                      className={cn(
                                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                          pathname === link.href && "bg-muted text-primary"
                                      )}
                                  >
                                      <link.icon className="h-5 w-5" />
                                      {link.label}
                                  </Link>
                              </li>
                            ))}
                          </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </nav>
                </SheetContent>
            </Sheet>
            <h3 className="font-semibold text-lg">Student Menu</h3>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
