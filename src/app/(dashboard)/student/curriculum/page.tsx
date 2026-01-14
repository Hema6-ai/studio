'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StudentCurriculumPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  // 1. Fetch student profile to get branch and ugYear
  const studentProfileQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return query(collection(firestore, 'students'), where('email', '==', user.email));
  }, [firestore, user]);

  const { data: studentProfileData, isLoading: isLoadingProfile } = useCollection(studentProfileQuery);
  const studentProfile = studentProfileData?.[0];

  // 2. Fetch curriculum based on student's branch and ugYear
  const curriculumQuery = useMemoFirebase(() => {
    if (!firestore || !studentProfile) return null;
    return query(
      collection(firestore, 'curriculums'),
      where('branch', '==', studentProfile.branch),
      where('ugYear', '==', studentProfile.ugYear)
    );
  }, [firestore, studentProfile]);

  const { data: curriculumData, isLoading: isLoadingCurriculum } = useCollection(curriculumQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Curriculum</CardTitle>
        {isLoadingProfile ? (
            <CardDescription>Loading your profile...</CardDescription>
        ) : studentProfile ? (
            <CardDescription>
                Showing curriculum for {studentProfile.branch} - UG {studentProfile.ugYear}
            </CardDescription>
        ) : (
             <CardDescription>Could not find your student profile.</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isLoadingProfile || isLoadingCurriculum ? (
          <p>Loading curriculum...</p>
        ) : curriculumData && curriculumData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Course Type</TableHead>
                <TableHead>Semester</TableHead>
                 <TableHead>Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {curriculumData.map((course: any) => (
                <TableRow key={course.id}>
                  <TableCell>{course.courseAbbr}</TableCell>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>{course.courseType}</TableCell>
                  <TableCell>{course.semester || 'N/A'}</TableCell>
                  <TableCell>{course.credits || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No curriculum found for your branch and year.</p>
        )}
      </CardContent>
    </Card>
  );
}
