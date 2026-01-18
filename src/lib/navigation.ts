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
    Library as LibraryIcon,
    History as HistoryIcon,
    ShieldCheck,
    CalendarPlus,
    SlidersHorizontal,
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
    href?: string;
}

export type NavItem = NavLink | NavLinkParent;

export function isNavLinkParent(item: NavItem): item is NavLinkParent {
    return 'subLinks' in item;
}

export const navLinks: Record<string, NavItem[]> = {
    student: [
        { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/student/curriculum', label: 'Curriculum', icon: Book },
        { href: '/student/ai-schedule-planner', label: 'AI Schedule Planner', icon: CalendarDays },
        { href: '#doubt-clearing', label: 'Gemini AI Chat', icon: BotMessageSquare },
        { href: '#feed', label: 'Campus Feed', icon: Newspaper },
        { href: '/student/resources', label: 'Resource Hub', icon: BookCopy },
        { href: '/student/library', label: 'Library', icon: LibraryIcon },
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
                { href: '/student/availability/librarian', label: 'Librarian', icon: LibraryIcon },
            ]
        },
        { href: '#burnout', label: 'Burnout Monitor', icon: Clock },
    ],
    faculty: [
        { href: '/faculty', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/faculty/ai-schedule-planner', label: 'AI Schedule Planner', icon: BotMessageSquare },
        { href: '/faculty/reschedule', label: 'Class & Reschedule', icon: CalendarDays },
        { href: '/faculty#availability', label: 'My Availability', icon: UserCheck },
        { href: '/student/resources', label: 'Resource Hub', icon: BookCopy },
        { href: '/student/library', label: 'Library', icon: LibraryIcon },
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
        { href: '/academics/students', label: 'Students', icon: Users },
        { href: '/academics/faculty', label: 'Faculty', icon: GraduationCap },
        { href: '/academics/timetables', label: 'Timetables', icon: CalendarDays },
        { href: '/academics/curriculum', label: 'Curriculum', icon: Book },
        { href: '/academics/medical-records', label: 'Medical Records', icon: Book },
        { href: '/academics/reschedule-log', label: 'Reschedule Log', icon: HistoryIcon },
        { href: '#', label: 'Profile', icon: User },
        { href: '/login', label: 'Logout', icon: LogOut },
    ],
    director: [
        { href: '/director', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/director', label: 'Final Approvals', icon: Shield },
        { href: '#', label: 'Analytics', icon: BarChart },
        { href: '#', label: 'Campus Overview', icon: Building },
    ],
    librarian: [
        { href: '/librarian', label: 'Library Management', icon: LibraryIcon },
        { href: '#', label: 'Profile', icon: User },
        { href: '/login', label: 'Logout', icon: LogOut },
    ],
    slc: [
        { href: '/slc', label: 'Complaints Dashboard', icon: ShieldCheck },
        { href: '#', label: 'Profile', icon: User },
        { href: '/login', label: 'Logout', icon: LogOut },
    ],
    sdc: [
        { href: '/sdc', label: 'Events Dashboard', icon: CalendarPlus },
        { href: '#', label: 'Profile', icon: User },
        { href: '/login', label: 'Logout', icon: LogOut },
    ],
    timetable: [
        { href: '/timetable', label: 'Timetable Control', icon: SlidersHorizontal },
        { href: '#', label: 'Profile', icon: User },
        { href: '/login', label: 'Logout', icon: LogOut },
    ],
    acadoffice: [
        { href: '/acadoffice', label: 'Dashboard', icon: LayoutDashboard },
        { href: '#', label: 'Profile', icon: User },
        { href: '/login', label: 'Logout', icon: LogOut },
    ]
};

    