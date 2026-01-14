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
  { id: 'PS', name: 'Probability and Statistics', abbr: 'PS' },
  { id: 'DSA', name: 'Data Structures and Algorithms', abbr: 'DSA' },
  { id: 'SS', name: 'Signals and Systems', abbr: 'SS' },
  { id: 'CA', name: 'Computer Architecture', abbr: 'CA' },
  { id: 'BEC', name: 'Basic Electronics and Circuit', abbr: 'BEC' },
  { id: 'OPC', name: 'Operational Communication', abbr: 'OPC' },
  { id: 'EDL', name: 'Ethics in Every Day life', abbr: 'EDL' },
  { id: 'AIV', name: 'AI and Visual Culture', abbr: 'AIV' }
];


export const dummyFaculty = [
  // Probability and Statistics (PS)
  { id: 'faculty-ps1', name: 'Mansoori', email: 'ps1@iiits.in', courses: ['PS'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '1' },
  { id: 'faculty-ps2', name: 'Dr.Jahnabi Chakravarty', email: 'ps2@iiits.in', courses: ['PS'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '2' },
  { id: 'faculty-ps3', name: 'Dr.Jahnabi Chakravarty', email: 'ps3@iiits.in', courses: ['PS'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '3' },
  { id: 'faculty-ps4', name: 'Dr. Narendra singh yadav', email: 'ps4@iiits.in', courses: ['PS'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '4' },
  { id: 'faculty-ps5', name: 'Dr. Narendra singh yadav', email: 'ps5@iiits.in', courses: ['PS'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '5' },

  // Data Structures and Algorithms (DSA)
  { id: 'faculty-dsa1', name: 'Dr.AUG Sankanrarao', email: 'dsa1@iiits.in', courses: ['DSA'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '1' },
  { id: 'faculty-dsa2', name: 'Dr.AUG Sankanrarao', email: 'dsa2@iiits.in', courses: ['DSA'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '2' },
  { id: 'faculty-dsa3', name: 'Dr. Viswanath Pulabaigari', email: 'dsa3@iiits.in', courses: ['DSA'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '3' },
  { id: 'faculty-dsa4', name: 'Dr. Viswanath Pulabaigari', email: 'dsa4@iiits.in', courses: ['DSA'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '4' },

  // Signals and Systems (SS)
  { id: 'faculty-ss1', name: 'Divyabramham', email: 'ss1@iiits.in', courses: ['SS'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '1' },
  { id: 'faculty-ss2', name: 'Dr. Anish Chand Turlapaty', email: 'ss2@iiits.in', courses: ['SS'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '2' },
  { id: 'faculty-ss3', name: 'Dr. Achintya Sarkar', email: 'ss3@iiits.in', courses: ['SS'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '3' },
  { id: 'faculty-ss4', name: 'Dr. Achintya Sarkar', email: 'ss4@iiits.in', courses: ['SS'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '4' },

  // Computer Architecture (CA)
  { id: 'faculty-ca1', name: 'Dr. Santhosh A', email: 'ca1@iiits.in', courses: ['CA'], ugYear: [1], branch: 'CSE,AIDS', section: '1' },
  { id: 'faculty-ca2', name: 'Dr. Bheemappa Halavar', email: 'ca2@iiits.in', courses: ['CA'], ugYear: [1], branch: 'CSE,AIDS', section: '2' },
  { id: 'faculty-ca3', name: 'Dr. Bheemappa Halavar', email: 'ca3@iiits.in', courses: ['CA'], ugYear: [1], branch: 'CSE,AIDS', section: '3' },
  { id: 'faculty-ca4', name: 'Dr. Kartick Sutradhar', email: 'ca4@iiits.in', courses: ['CA'], ugYear: [1], branch: 'CSE,AIDS', section: '4' },

  // Basic Electronics and Circuit (BEC)
  { id: 'faculty-bec', name: 'Dr. Raja Vara Prasad. Y/Mrs. Srivalli', email: 'bec@iiits.in', courses: ['BEC'], ugYear: [1], branch: 'ECE', section: 'Common Class' },

  // Operational Coomunication (OPC)
  { id: 'faculty-opc1', name: 'Dr.Vinay Kumar', email: 'opc1@iiits.in', courses: ['OPC'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '1' },
  { id: 'faculty-opc2', name: 'Dr.Vinay Kumar', email: 'opc2@iiits.in', courses: ['OPC'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '2' },
  { id: 'faculty-opc3', name: 'Dr.Krishna Swamy', email: 'opc3@iiits.in', courses: ['OPC'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '3' },
  { id: 'faculty-opc4', name: 'Dr.Krishna Swamy', email: 'opc4@iiits.in', courses: ['OPC'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '4' },

  // Ethics in Every Day life (EDL)
  { id: 'faculty-edl1', name: 'Dr Rosemaria Regy Mathew', email: 'edl1@iiits.in', courses: ['EDL'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '1' },
  { id: 'faculty-edl2', name: 'Dr Rosemaria Regy Mathew', email: 'edl2@iiits.in', courses: ['EDL'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '2' },
  
  // Al and Visual Culture (AIV)
  { id: 'faculty-aiv1', name: 'Dr Rosemaria Regy Mathew', email: 'aiv1@iiits.in', courses: ['AIV'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '1' },
  { id: 'faculty-aiv2', name: 'Dr Rosemaria Regy Mathew', email: 'aiv2@iiits.in', courses: ['AIV'], ugYear: [1], branch: 'CSE,ECE,AIDS', section: '2' }
];

export const dummyTimetable = {
    "UG1": {
        "Common": [
            // Monday
            { day: "Monday", time: "08:45-09:45", course: "DSA1", faculty: "Praveen K", room: "G09" },
            { day: "Monday", time: "08:45-09:45", course: "DSA4", faculty: "K V S R", room: "G08" },
            { day: "Monday", time: "08:45-09:45", course: "SS2", faculty: "Satrajit", room: "Lab 103" },
            { day: "Monday", time: "08:45-09:45", course: "OPC3", faculty: "Srinivas B", room: "G07" },
            { day: "Monday", time: "09:45-10:45", course: "SS2", faculty: "Satrajit", room: "Lab 103" },
            { day: "Monday", time: "09:45-10:45", course: "PS3", faculty: "Santhosh C", room: "G08" },
            { day: "Monday", time: "11:00-12:00", course: "CA2", faculty: "Vandana J", room: "G09" },
            { day: "Monday", time: "11:00-12:00", course: "PS1", faculty: "Bhuvan T", room: "G07" },
            { day: "Monday", time: "11:00-12:00", course: "SS3", faculty: "Sujit S", room: "Lab 103" },
            { day: "Monday", time: "12:00-13:00", course: "SS3", faculty: "Sujit S", room: "Lab 103" },
            { day: "Monday", time: "12:00-13:00", course: "PS2", faculty: "K K B", room: "G09" },
            { day: "Monday", time: "12:00-13:00", course: "CA1", faculty: "Monalisa G", room: "G08" },
            { day: "Monday", time: "12:00-13:00", course: "BEC", faculty: "Suneetha K", room: "G07" },
            { day: "Monday", time: "14:15-15:15", course: "SS1", faculty: "Pankaj V", room: "G08" },
            { day: "Monday", time: "14:15-15:15", course: "DSA2", faculty: "Suman Kumar", room: "Lab 103" },
            { day: "Monday", time: "14:15-15:15", course: "SS4", faculty: "Rakesh T", room: "G09" },
            { day: "Monday", time: "15:15-16:15", course: "DSA2", faculty: "Suman Kumar", room: "Lab 103" },
            { day: "Monday", time: "15:15-16:15", course: "OPC4", faculty: "Kishore K", room: "G08" },
            { day: "Monday", time: "16:30-17:30", course: "CA4", faculty: "Dileep", room: "G08" },
            { day: "Monday", time: "16:30-17:30", course: "PS5", faculty: "Ram K", room: "G09" },
            { day: "Monday", time: "16:30-17:30", course: "CA3", faculty: "Prashant K", room: "G07" },
            // Tuesday
            { day: "Tuesday", time: "08:45-09:45", course: "CA4", faculty: "Dileep", room: "Lab 103" },
            { day: "Tuesday", time: "08:45-09:45", course: "BEC", faculty: "Suneetha K", room: "Lab 114/102" },
            { day: "Tuesday", time: "09:45-10:45", course: "BEC", faculty: "Suneetha K", room: "Lab 114/102" },
            { day: "Tuesday", time: "09:45-10:45", course: "CA4", faculty: "Dileep", room: "Lab 103" },
            { day: "Tuesday", time: "11:00-12:00", course: "CA2", faculty: "Vandana J", room: "Lab 103" },
            { day: "Tuesday", time: "11:00-12:00", course: "DSA1", faculty: "Praveen K", room: "G09" },
            { day: "Tuesday", time: "11:00-12:00", course: "DSA3", faculty: "Aakash", room: "G08" },
            { day: "Tuesday", time: "12:00-13:00", course: "CA2", faculty: "Vandana J", room: "Lab 103" },
            { day: "Tuesday", time: "12:00-13:00", course: "SS1", faculty: "Pankaj V", room: "G09" },
            { day: "Tuesday", time: "12:00-13:00", course: "SS3", faculty: "Sujit S", room: "G07" },
            { day: "Tuesday", time: "14:15-15:15", course: "PS2", faculty: "K K B", room: "G09" },
            { day: "Tuesday", time: "14:15-15:15", course: "DSA3", faculty: "Aakash", room: "Lab 103" },
            { day: "Tuesday", time: "14:15-15:15", course: "OPC1", faculty: "Karthik S", room: "G08" },
            { day: "Tuesday", time: "15:15-16:15", course: "DSA2", faculty: "Suman Kumar", room: "G08" },
            { day: "Tuesday", time: "15:15-16:15", course: "DSA3", faculty: "Aakash", room: "Lab 103" },
            { day: "Tuesday", time: "15:15-16:15", course: "PS1", faculty: "Bhuvan T", room: "G09" },
            { day: "Tuesday", time: "16:30-17:30", course: "SS2", faculty: "Satrajit", room: "G09" },
            { day: "Tuesday", time: "16:30-17:30", course: "SS4", faculty: "Rakesh T", room: "G08" },
            { day: "Tuesday", time: "16:30-17:30", course: "CA1", faculty: "Monalisa G", room: "G07" },
            // Wednesday
            { day: "Wednesday", time: "08:45-09:45", course: "DSA1", faculty: "Praveen K", room: "Lab 103" },
            { day: "Wednesday", time: "08:45-09:45", course: "PS2", faculty: "K K B", room: "G09" },
            { day: "Wednesday", time: "08:45-09:45", course: "PS5", faculty: "Ram K", room: "G08" },
            { day: "Wednesday", time: "08:45-09:45", course: "CA3", faculty: "Prashant K", room: "G07" },
            { day: "Wednesday", time: "09:45-10:45", course: "SS2", faculty: "Satrajit", room: "G08" },
            { day: "Wednesday", time: "09:45-10:45", course: "DSA1", faculty: "Praveen K", room: "Lab 103" },
            { day: "Wednesday", time: "11:00-12:00", course: "CA2", faculty: "Vandana J", room: "G08" },
            { day: "Wednesday", time: "11:00-12:00", course: "CA1", faculty: "Monalisa G", room: "G07" },
            { day: "Wednesday", time: "11:00-12:00", course: "DSA4", faculty: "K V S R", room: "Lab 103" },
            { day: "Wednesday", time: "12:00-13:00", course: "DSA4", faculty: "K V S R", room: "Lab 103" },
            { day: "Wednesday", time: "12:00-13:00", course: "PS4", faculty: "Gautam P", room: "G09" },
            { day: "Wednesday", time: "12:00-13:00", course: "PS3", faculty: "Santhosh C", room: "G08" },
            { day: "Wednesday", time: "14:15-15:15", course: "CA3", faculty: "Prashant K", room: "Lab 103" },
            { day: "Wednesday", time: "14:15-15:15", course: "OPC4", faculty: "Kishore K", room: "G08" },
            { day: "Wednesday", time: "14:15-15:15", course: "SS1", faculty: "Pankaj V", room: "G09" },
            { day: "Wednesday", time: "15:15-16:15", course: "DSA2", faculty: "Suman Kumar", room: "G08" },
            { day: "Wednesday", time: "15:15-16:15", course: "CA3", faculty: "Prashant K", room: "Lab 103" },
            { day: "Wednesday", time: "15:15-16:15", course: "PS1", faculty: "Bhuvan T", room: "G09" },
            { day: "Wednesday", time: "16:30-17:30", course: "Faculty meeting", faculty: "-", room: "-" },
            // Thursday
            { day: "Thursday", time: "08:45-09:45", course: "PS4", faculty: "Gautam P", room: "G09" },
            { day: "Thursday", time: "08:45-09:45", course: "PS2", faculty: "K K B", room: "G08" },
            { day: "Thursday", time: "08:45-09:45", course: "CA3", faculty: "Prashant K", room: "G07" },
            { day: "Thursday", time: "09:45-10:45", course: "DSA4", faculty: "K V S R", room: "G09" },
            { day: "Thursday", time: "09:45-10:45", course: "DSA1", faculty: "Praveen K", room: "G08" },
            { day: "Thursday", time: "09:45-10:45", course: "SS3", faculty: "Sujit S", room: "G07" },
            { day: "Thursday", time: "09:45-10:45", course: "OPC2", faculty: "Anurag S", room: "G06" },
            { day: "Thursday", time: "11:00-12:00", course: "CA1", faculty: "Monalisa G", room: "Lab 103" },
            { day: "Thursday", time: "11:00-12:00", course: "CA2", faculty: "Vandana J", room: "G09" },
            { day: "Thursday", time: "11:00-12:00", course: "CA4", faculty: "Dileep", room: "G08" },
            { day: "Thursday", time: "12:00-13:00", course: "CA1", faculty: "Monalisa G", room: "Lab 103" },
            { day: "Thursday", time: "12:00-13:00", course: "PS3", faculty: "Santhosh C", room: "G09" },
            { day: "Thursday", time: "12:00-13:00", course: "PS4", faculty: "Gautam P", room: "G08" },
            { day: "Thursday", time: "12:00-13:00", course: "SS4", faculty: "Rakesh T", room: "G05" },
            { day: "Thursday", time: "14:15-15:15", course: "BEC", faculty: "Suneetha K", room: "G09" },
            { day: "Thursday", time: "14:15-15:15", course: "SS1", faculty: "Pankaj V", room: "Lab 103" },
            { day: "Thursday", time: "15:15-16:15", course: "SS1", faculty: "Pankaj V", room: "Lab 103" },
            { day: "Thursday", time: "15:15-16:15", course: "DSA3", faculty: "Aakash", room: "G08" },
            { day: "Thursday", time: "15:15-16:15", course: "PS5", faculty: "Ram K", room: "G09" },
            { day: "Thursday", time: "16:30-17:30", course: "AIV2", faculty: "Md. Aquib", room: "G08" },
            { day: "Thursday", time: "17:30-18:30", course: "AIV2", faculty: "Md. Aquib", room: "G08" },
            // Friday
            { day: "Friday", time: "08:45-09:45", course: "SS3", faculty: "Sujit S", room: "G09" },
            { day: "Friday", time: "08:45-09:45", course: "SS2", faculty: "Satrajit", room: "G08" },
            { day: "Friday", time: "08:45-09:45", course: "PS5", faculty: "Ram K", room: "G07" },
            { day: "Friday", time: "09:45-10:45", course: "DSA4", faculty: "K V S R", room: "G09" },
            { day: "Friday", time: "09:45-10:45", course: "CA4", faculty: "Dileep", room: "G08" },
            { day: "Friday", time: "11:00-12:00", course: "PS3", faculty: "Santhosh C", room: "G09" },
            { day: "Friday", time: "11:00-12:00", course: "PS4", faculty: "Gautam P", room: "G08" },
            { day: "Friday", time: "11:00-12:00", course: "PS1", faculty: "Bhuvan T", room: "G07" },
            { day: "Friday", time: "12:00-13:00", course: "OPC3", faculty: "Srinivas B", room: "G09" },
            { day: "Friday", time: "12:00-13:00", course: "OPC2", faculty: "Anurag S", room: "B03" },
            { day: "Friday", time: "12:00-13:00", course: "BEC", faculty: "Suneetha K", room: "G08" },
            { day: "Friday", time: "14:15-15:15", course: "DSA3", faculty: "Aakash", room: "G09" },
            { day: "Friday", time: "14:15-15:15", course: "DSA2", faculty: "Suman Kumar", room: "G08" },
            { day: "Friday", time: "14:15-15:15", course: "SS4", faculty: "Rakesh T", room: "Lab 103" },
            { day: "Friday", time: "15:15-16:15", course: "SS4", faculty: "Rakesh T", room: "Lab 103" },
            { day: "Friday", time: "15:15-16:15", course: "OPC1", faculty: "Karthik S", room: "G09" },
            { day: "Friday", time: "16:30-17:30", course: "AIV1", faculty: "Mounika J", room: "G09" },
            { day: "Friday", time: "17:30-18:30", course: "AIV1", faculty: "Mounika J", room: "G09" },
            // Saturday
            { day: "Saturday", time: "08:45-10:45", course: "EDL1", faculty: "Srinath", room: "G09" },
            { day: "Saturday", time: "11:00-13:00", course: "EDL2", faculty: "Soumya", room: "G09" },
        ]
    }
};
