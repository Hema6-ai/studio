export type UserRole = 'student' | 'faculty' | 'doctor' | 'academics' | 'director' | null;

export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  DOCTOR: 'doctor',
  ACADEMICS: 'academics',
  DIRECTOR: 'director',
} as const;


export function getRoleFromEmail(email: string): UserRole {
  if (typeof email !== 'string') {
    return null;
  }
  
  if (!email.endsWith('@iiits.in')) {
    return null;
  }

  if (email.toLowerCase() === 'director@iiits.in') {
    return ROLES.DIRECTOR;
  }

  if (email.toLowerCase().startsWith('academics')) {
    return ROLES.ACADEMICS;
  }

  if (email.toLowerCase().includes('doctor')) {
    return ROLES.DOCTOR;
  }

  const studentRegex = /\.p\d{2}@iiits\.in$/;
  if (studentRegex.test(email.toLowerCase())) {
    return ROLES.STUDENT;
  }

  return ROLES.FACULTY;
}
