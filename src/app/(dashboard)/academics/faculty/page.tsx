'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function FacultyManagementPage() {
    const firestore = useFirestore();

    const assignmentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'teachingAssignments');
    }, [firestore]);

    const { data: assignments, isLoading: loadingAssignments } = useCollection(assignmentsQuery);

    const assignmentsByYear = useMemo(() => {
        const groups: { [key: string]: any[] } = {};
        if (!assignments) return groups;
        
        assignments.forEach((assignment: any) => {
            const key = `UG${assignment.ug}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(assignment);
        });
        
        // Sort each group by course code then section
        for (const key in groups) {
            groups[key].sort((a, b) => {
                if (a.courseCode < b.courseCode) return -1;
                if (a.courseCode > b.courseCode) return 1;
                return a.section.localeCompare(b.section);
            });
        }
        return groups;
    }, [assignments]);
    
    const facultyLoad = useMemo(() => {
        const load: { [key: string]: number } = {};
        if (!assignments) return load;
        assignments.forEach((a: any) => {
            if (!load[a.facultyName]) load[a.facultyName] = 0;
            load[a.facultyName]++;
        });
        return load;
    }, [assignments]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Faculty Assignments Overview</CardTitle>
                    <CardDescription>Read-only view of all current teaching assignments. Configuration is managed by the Timetable Administrator.</CardDescription>
                </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Faculty Load Summary</CardTitle>
                        <CardDescription>Number of sections assigned per faculty.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Faculty Name</TableHead>
                                    <TableHead className="text-right">Assigned Sections</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingAssignments && <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>}
                                {Object.keys(facultyLoad).length === 0 && !loadingAssignments && <TableRow><TableCell colSpan={2} className="text-center">No assignments found.</TableCell></TableRow>}
                                {Object.entries(facultyLoad).map(([name, count]) => (
                                    <TableRow key={name}>
                                        <TableCell>{name}</TableCell>
                                        <TableCell className="text-right">{count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['UG1', 'UG2', 'UG3', 'UG4'].map(year => {
                        const groupKey = year;
                        const groupAssignments = assignmentsByYear[groupKey] || [];
                        return (
                            <Card key={groupKey}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{groupKey}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingAssignments ? <p>Loading...</p> : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Section</TableHead>
                                                <TableHead>Faculty</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupAssignments.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No assignments.</TableCell></TableRow>}
                                            {groupAssignments.map((a: any) => (
                                                <TableRow key={a.id}>
                                                    <TableCell>{a.courseCode}</TableCell>
                                                    <TableCell>{a.section}</TableCell>
                                                    <TableCell>{a.facultyName}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
