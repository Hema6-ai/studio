'use client';

export type UserRole = 'student' | 'faculty' | 'doctor' | 'academics' | 'director' | 'librarian' | 'slc' | 'sdc' | null;

export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  DOCTOR: 'doctor',
  ACADEMICS: 'academics',
  DIRECTOR: 'director',
  LIBRARIAN: 'librarian',
  SLC: 'slc',
  SDC: 'sdc',
} as const;


export function getRoleFromEmail(email: string): UserRole {
  if (typeof email !== 'string') {
    return null; // Not a valid institutional email
  }

  const lowerCaseEmail = email.toLowerCase();
  
  if (!email.endsWith('@iiits.in')) {
    return null; // Not a valid institutional email
  }

  // Rule 1: Director
  if (lowerCaseEmail === 'director@iiits.in') {
    return ROLES.DIRECTOR;
  }
  
  // Rule for Librarian
  if (lowerCaseEmail === 'library@iiits.in') {
    return ROLES.LIBRARIAN;
  }

  // Rule for SLC
  if (lowerCaseEmail.includes('slc')) {
      return ROLES.SLC;
  }

  // Rule for SDC
  if (lowerCaseEmail.includes('sdc')) {
      return ROLES.SDC;
  }

  // Rule 2: Academic Office
  if (lowerCaseEmail.includes('academic') || lowerCaseEmail.includes('academics')) {
    return ROLES.ACADEMICS;
  }

  // Rule 3: Doctor
  if (lowerCaseEmail.includes('doctor')) {
    return ROLES.DOCTOR;
  }

  // Rule 4: Student
  const studentRegex = /\.p\d{2}@iiits\.in$/;
  if (studentRegex.test(lowerCaseEmail)) {
    return ROLES.STUDENT;
  }

  // Rule 5: Faculty (as the default for any other @iiits.in email)
  return ROLES.FACULTY;
}
