'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cseCurriculum } from '@/lib/data'; // Using static data for now
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';


function CurriculumDisplay({ curriculumData }: { curriculumData: any }) {
    if (!curriculumData) return <p>No curriculum data available for your branch.</p>;

    const { branchFullName, infoLink, curriculum } = curriculumData;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{branchFullName}</CardTitle>
                        <CardDescription>Official B.Tech Curriculum</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={infoLink} target="_blank">
                            More Info <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {curriculum.map((semester: any) => (
                        <div key={semester.semester}>
                            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Semester {semester.semester}</h3>
                            {semester.note && (
                                <p className="text-sm text-muted-foreground mb-4 italic">{semester.note}</p>
                            )}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course Code</TableHead>
                                        <TableHead>Course Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Credits</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {semester.courses.map((course: any) => (
                                        <TableRow key={course.courseAbbr}>
                                            <TableCell>{course.courseAbbr}</TableCell>
                                            <TableCell>{course.courseName}</TableCell>
                                            <TableCell>{course.type}</TableCell>
                                            <TableCell className="text-right">{course.credits}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function StudentCurriculumPage() {
  const { user } = useUser();
  // This is a placeholder for fetching student profile.
  // In a real app, you would fetch the student's branch from Firestore.
  const studentBranch = 'CSE'; // Assume CSE for now

  const curriculumToDisplay = studentBranch === 'CSE' ? cseCurriculum : null;

  return (
    <div>
        <CurriculumDisplay curriculumData={curriculumToDisplay} />
    </div>
  );
}
