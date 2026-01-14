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

export const dummyCourses = [
  { id: 'CS101', name: 'Introduction to Programming' },
  { id: 'CS201', name: 'Data Structures' },
  { id: 'EC205', name: 'Digital Circuits' },
  { id: 'AI301', name: 'Machine Learning' },
  { id: 'MA101', name: 'Calculus' },
];

export const dummyFaculty = [
    {
        id: 'faculty-1',
        name: 'Dr. Alan Turing',
        email: 'alan.t@iiits.in',
        courses: ['CS101', 'CS201'],
        ugYear: [1, 2],
        branch: 'CSE',
        section: 'A'
    },
    {
        id: 'faculty-2',
        name: 'Dr. Ada Lovelace',
        email: 'ada.l@iiits.in',
        courses: ['EC205'],
        ugYear: [2],
        branch: 'ECE',
        section: 'Common Class'
    },
    {
        id: 'faculty-3',
        name: 'Dr. Geoffrey Hinton',
        email: 'geoffrey.h@iiits.in',
        courses: ['AI301'],
        ugYear: [3],
        branch: 'AIDS',
        section: 'B'
    }
];

export const dummyTimetable = {
    "UG1": {
        "CSE": [
            { day: "Monday", time: "09:00-10:00", course: "CS101", faculty: "Dr. Alan Turing", room: "C-101" },
            { day: "Tuesday", time: "10:00-11:00", course: "MA101", faculty: "Dr. Srinivasa Ramanujan", room: "M-102" },
        ],
        "ECE": [
             { day: "Monday", time: "09:00-10:00", course: "EC101", faculty: "Dr. Claude Shannon", room: "E-101" },
        ]
    },
    "UG2": {
       "CSE": [
            { day: "Wednesday", time: "11:00-12:00", course: "CS201", faculty: "Dr. Alan Turing", room: "C-201" },
       ]
    }
};
