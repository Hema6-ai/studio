
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

  const lowerCaseEmail = email.toLowerCase();

  if (lowerCaseEmail === 'director@iiits.in') {
    return ROLES.DIRECTOR;
  }
  
  if (lowerCaseEmail.startsWith('academics')) {
    return ROLES.ACADEMICS;
  }

  if (lowerCaseEmail.includes('doctor')) {
    return ROLES.DOCTOR;
  }

  const studentRegex = /\.p\d{2}@iiits\.in$/;
  if (studentRegex.test(lowerCaseEmail)) {
    return ROLES.STUDENT;
  }

  // If it's none of the above, it's faculty by default
  return ROLES.FACULTY;
}
