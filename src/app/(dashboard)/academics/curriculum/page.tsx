'use client';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { cseCurriculum, eceCurriculum, aidsCurriculum } from '@/lib/data';

function CurriculumDisplay({ curriculumData }: { curriculumData: any }) {
    if (!curriculumData) return <p>No curriculum data available.</p>;

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

export default function CurriculumManagementPage() {
  const [activeBranch, setActiveBranch] = useState('CSE');
  const branches = ['CSE', 'ECE', 'AIDS'];

  const curriculumMap = {
    CSE: cseCurriculum,
    ECE: eceCurriculum,
    AIDS: aidsCurriculum,
  };

  const curriculumToDisplay = curriculumMap[activeBranch as keyof typeof curriculumMap] || null;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Curriculum Management</CardTitle>
                        <CardDescription>View and manage the official curriculum for each program.</CardDescription>
                    </div>
                     <Button><PlusCircle className="mr-2 h-4 w-4" /> Add/Edit Curriculum</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeBranch} onValueChange={setActiveBranch}>
                  <TabsList>
                    {branches.map(branch => <TabsTrigger key={branch} value={branch}>{branch}</TabsTrigger>)}
                  </TabsList>
                </Tabs>
            </CardContent>
        </Card>

        <CurriculumDisplay curriculumData={curriculumToDisplay} />
    </div>
  );
}
