import {
    LayoutDashboard,
    CalendarDays,
    BotMessageSquare,
    Newspaper,
    BookCopy,
    FileUp,
    Clock,
    UserCheck,
    Shield,
    BarChart,
    Building,
    FileCheck2,
    Landmark,
    History,
    LogOut,
    User,
    Users,
    GraduationCap,
    Book,
    Briefcase,
    Stethoscope,
    Users2,
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
        { href: '/student/curriculum', label: 'Curriculum', icon: Book },
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
        {
            key: 'availability',
            label: 'Availability',
            icon: UserCheck,
            subLinks: [
                { href: '/student/availability/faculty', label: 'Faculty', icon: Users2 },
                { href: '/student/availability/academic-office', label: 'Academic Office', icon: Briefcase },
                { href: '/student/availability/doctor', label: 'Doctor', icon: Stethoscope },
            ]
        },
        { href: '#burnout', label: 'Burnout Monitor', icon: Clock },
    ],
    faculty: [
        { href: '/faculty', label: 'Dashboard', icon: LayoutDashboard },
        { href: '#schedule', label: 'Class Schedules', icon: CalendarDays },
        { href: '#availability', label: 'My Availability', icon: UserCheck },
        { href: '#reschedule', label: 'Reschedule Class', icon: BotMessageSquare },
    ],
    doctor: [
        { href: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/doctor#availability', label: 'Availability', icon: UserCheck },
        { href: '/doctor#requests', label: 'Medical Requests', icon: FileCheck2 },
        { href: '/doctor#history', label: 'Approval History', icon: History },
        { href: '#', label: 'Profile', icon: User },
        { href: '/login', label: 'Logout', icon: LogOut },
    ],
    academics: [
        { href: '/academics', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/academics#students', label: 'Students', icon: Users },
        { href: '/academics#faculty', label: 'Faculty', icon: GraduationCap },
        { href: '/academics#timetables', label: 'Timetables', icon: CalendarDays },
        { href: '/academics/curriculum', label: 'Curriculum', icon: Book },
        { href: '/academics#medical-records', label: 'Medical Records', icon: Book },
        { href: '#', label: 'Profile', icon: User },
        { href: '/login', label: 'Logout', icon: LogOut },
    ],
    director: [
        { href: '/director', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/director', label: 'Final Approvals', icon: Shield },
        { href: '#', label: 'Analytics', icon: BarChart },
        { href: '#', label: 'Campus Overview', icon: Building },
    ],
};
