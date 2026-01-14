import {
    LayoutDashboard,
    CalendarDays,
    BotMessageSquare,
    Newspaper,
    BookCopy,
    FileUp,
    Clock,
    UserCheck,
    Briefcase,
    Shield,
    BarChart,
    Building,
    FileCheck2,
    ClipboardPen,
    Medal,
    Landmark,
    History,
    LogOut,
    User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavLink {
    href: string;
    label: string;
    icon: LucideIcon;
}

export interface NavLinkParent {
    key: string;
    label: string;
    icon: LucideIcon;
    subLinks: NavLink[];
}

export type NavItem = NavLink | NavLinkParent;

export function isNavLinkParent(item: NavItem): item is NavLinkParent {
    return 'subLinks' in item;
}

export const navLinks: Record<string, NavItem[]> = {
    student: [
        { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
        { href: '#schedule-planner', label: 'AI Schedule Planner', icon: CalendarDays },
        { href: '#doubt-clearing', label: 'Gemini AI Chat', icon: BotMessageSquare },
        { href: '#feed', label: 'Campus Feed', icon: Newspaper },
        { href: '#resources', label: 'Resource Hub', icon: BookCopy },
        {
            key: 'document-submission',
            label: 'Document Submission',
            icon: FileUp,
            subLinks: [
                { href: '/student/medical-leave', label: 'Medical Leave', icon: FileUp },
                { href: '#', label: 'Fee Receipt', icon: Landmark },
            ]
        },
        { href: '#availability', label: 'Staff Availability', icon: UserCheck },
        { href: '#burnout', label: 'Burnout Monitor', icon: Clock },
    ],
    faculty: [
        { href: '/faculty', label: 'Dashboard', icon: LayoutDashboard },
        { href: '#schedule', label: 'Class Schedules', icon: CalendarDays },
        { href: '#availability', label: 'My Availability', icon: UserCheck },
        { href: '#reschedule', label: 'Reschedule Class', icon: BotMessageSquare },
        { href: '#students', label: 'Student Overview', icon: Medal },
    ],
    doctor: [
        { href: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
        { href: '#availability', label: 'Availability', icon: UserCheck },
        { href: '#requests', label: 'Medical Requests', icon: FileCheck2 },
        { href: '#history', label: 'Approval History', icon: History },
        { href: '#profile', label: 'Profile', icon: User },
        { href: '/login', label: 'Logout', icon: LogOut },
    ],
    academics: [
        { href: '/academics', label: 'Dashboard', icon: LayoutDashboard },
        { href: '#submissions', label: 'Submissions', icon: FileCheck2 },
        { href: '#records', label: 'Student Records', icon: Medal },
        { href: '#workflows', label: 'Workflows', icon: ClipboardPen },
    ],
    director: [
        { href: '/director', label: 'Dashboard', icon: LayoutDashboard },
        { href: '#approvals', label: 'Final Approvals', icon: Shield },
        { href: '#analytics', label: 'Analytics', icon: BarChart },
        { href: '#overview', label: 'Campus Overview', icon: Building },
    ],
};
