'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore();

export const getStudentSchedule = ai.defineTool(
  {
    name: 'getStudentSchedule',
    description: "Get a student's class schedule for a specific day.",
    inputSchema: z.object({
      studentId: z.string().describe("The student's unique ID"),
      day: z.string().describe('The day of the week (e.g., Monday, Tuesday)'),
    }),
    outputSchema: z.string().describe('A formatted string of the schedule or a message if no classes are scheduled.'),
  },
  async ({ studentId, day }) => {
    // This is a simplified implementation. A real implementation would query
    // the 'students' and 'timetables' collections and compute the schedule.
    return `Schedule for ${studentId} on ${day}: 
    09:00 - 10:00: Data Structures (C-201)
    11:15 - 12:15: Database Systems (Lab 3)`;
  }
);

export const getMedicalLeaveStatus = ai.defineTool(
  {
    name: 'getMedicalLeaveStatus',
    description: "Check the status of a student's medical leave request.",
    inputSchema: z.object({ studentId: z.string() }),
    outputSchema: z.string(),
  },
  async ({ studentId }) => {
    const requestsRef = db.collection('medicalRequests');
    const snapshot = await requestsRef.where('studentId', '==', studentId).limit(1).get();

    if (snapshot.empty) {
      return 'No medical leave request found for this student.';
    }
    const request = snapshot.docs[0].data();
    
    if (request.directorApprovalStatus) {
        return `The final status is: ${request.directorApprovalStatus}.`;
    }
    if (request.doctorVerificationStatus) {
        return `The request has been reviewed by the doctor. The status is: ${request.doctorVerificationStatus}. It is now pending director approval.`;
    }
    return 'The request is pending doctor verification.';
  }
);

export const listFacultyByCourse = ai.defineTool(
    {
        name: 'listFacultyByCourse',
        description: 'List the faculty members who teach a specific course.',
        inputSchema: z.object({
            courseAbbr: z.string().describe('The abbreviation of the course (e.g., DSA, AI, DL).'),
        }),
        outputSchema: z.string(),
    },
    async ({ courseAbbr }) => {
        // In a real app, this would query a 'faculty' collection.
        // Using dummy data for now.
        const faculty = [
            { courseAbbr: 'AI', name: 'Dr. Piyush Joshi' },
            { courseAbbr: 'DL', name: 'Dr. Shaik Mohammad Rafi' },
            { courseAbbr: 'DSA', name: 'Dr. Viswanath Pulabagari' },
        ];
        const teachers = faculty.filter(f => f.courseAbbr.toUpperCase() === courseAbbr.toUpperCase());
        if (teachers.length === 0) {
            return `I could not find any faculty teaching the course ${courseAbbr}.`;
        }
        return `The following faculty teach ${courseAbbr}: ${teachers.map(t => t.name).join(', ')}`;
    }
);

export const getPendingDirectorApprovals = ai.defineTool(
    {
        name: 'getPendingDirectorApprovals',
        description: 'Get a count of medical leave requests pending final approval from the director.',
        inputSchema: z.object({}),
        outputSchema: z.string(),
    },
    async () => {
        const requestsRef = db.collection('medicalRequests');
        const snapshot = await requestsRef
            .where('doctorVerificationStatus', '==', 'Approved')
            .where('directorApprovalStatus', '==', null)
            .get();
        
        if (snapshot.empty) {
            return 'There are no medical leave requests pending your approval.';
        }
        return `There are ${snapshot.size} medical leave requests pending your final approval.`;
    }
);
