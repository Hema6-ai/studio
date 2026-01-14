import { PlaceHolderImages } from "./placeholder-images";

export const dummySchedule = [
    { time: "09:00 - 10:00", subject: "Data Structures", venue: "C-201" },
    { time: "10:00 - 11:00", subject: "Algorithms", venue: "C-202" },
    { time: "11:15 - 12:15", subject: "Database Systems", venue: "Lab 3" },
    { time: "14:00 - 15:00", subject: "Operating Systems", venue: "C-105" },
];

export const dummyAnnouncements = [
    {
        title: "HackOverflow 2024 Registrations Open",
        category: "Hackathons",
        date: "July 20, 2024",
        image: PlaceHolderImages.find(img => img.id === 'announcement-1')!
    },
    {
        title: "Guest Lecture on Quantum Computing",
        category: "Events",
        date: "July 22, 2024",
        image: PlaceHolderImages.find(img => img.id === 'announcement-2')!
    },
    {
        title: "Robotics Club Recruitment Drive",
        category: "Clubs",
        date: "July 25, 2024",
        image: PlaceHolderImages.find(img => img.id === 'announcement-3')!
    },
];
