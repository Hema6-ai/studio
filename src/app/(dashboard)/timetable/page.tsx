'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Settings, Save, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SemesterPolicy {
    id: string;
    semesterId: string;
    hasElectives: boolean;
    usesStudentPreferences: boolean;
    usesCGPA: boolean;
    numberOfElectiveBins: number;
    maxTimetableRetries: number;
}

const SEMESTERS = ['UG1', 'UG2', 'UG3', 'UG4'];

const defaultPolicies: Record<string, Omit<SemesterPolicy, 'id'>> = {
    UG1: { semesterId: 'UG1', hasElectives: false, usesStudentPreferences: false, usesCGPA: false, numberOfElectiveBins: 0, maxTimetableRetries: 3 },
    UG2: { semesterId: 'UG2', hasElectives: false, usesStudentPreferences: false, usesCGPA: false, numberOfElectiveBins: 0, maxTimetableRetries: 3 },
    UG3: { semesterId: 'UG3', hasElectives: true, usesStudentPreferences: true, usesCGPA: true, numberOfElectiveBins: 5, maxTimetableRetries: 3 },
    UG4: { semesterId: 'UG4', hasElectives: true, usesStudentPreferences: true, usesCGPA: true, numberOfElectiveBins: 5, maxTimetableRetries: 3 },
};

// --- Course Manager Component ---
const CourseManager: FC<{ ug: string; user: any; isReadOnly: boolean }> = ({ ug, user, isReadOnly }) => {
    const firestore = useFirestore();
    const { toast } = useToast();

    const coursesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'ugCourses'), where('ug', '==', ug)) : null, [firestore, ug]);
    const sectionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'ugSections'), where('ug', '==', ug)) : null, [firestore, ug]);

    const { data: courses, isLoading: loadingCourses } = useCollection(coursesQuery);
    const { data: sections, isLoading: loadingSections } = useCollection(sectionsQuery);

    const isLoading = loadingCourses || loadingSections;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Definitions</CardTitle>
                <CardDescription>Define all courses and their section rules for {ug}.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Add Course Dialog would go here */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Session</TableHead>
                            <TableHead>Sections</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5} className="text-center"><Skeleton className="h-8 w-full" /></TableCell></TableRow>}
                         {!isLoading && courses?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No courses defined for {ug}.</TableCell></TableRow>}
                        {courses?.map(course => (
                            <TableRow key={course.id}>
                                <TableCell>{course.courseCode}</TableCell>
                                <TableCell>{course.courseName}</TableCell>
                                <TableCell>{course.sessionType}</TableCell>
                                <TableCell>{sections?.find(s => s.courseCode === course.courseCode)?.sectionsRequired || 1}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" disabled><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" disabled><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                 <Button disabled><PlusCircle className="mr-2" />Add Course</Button>
            </CardFooter>
        </Card>
    );
};

// --- Elective Bin Manager ---
const ElectiveBinManager: FC<{ ug: string; user: any; policy: SemesterPolicy; courses: any[] | null }> = ({ ug, user, policy, courses }) => {
    if (!policy.hasElectives || policy.numberOfElectiveBins === 0) return null;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Elective Bin Mapping</CardTitle>
                <CardDescription>Assign elective courses to one of the {policy.numberOfElectiveBins} available bins for {ug}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: policy.numberOfElectiveBins }, (_, i) => (
                    <div key={i}>
                        <h4 className="font-semibold mb-2 border-b pb-1">Bin {i + 1}</h4>
                        <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
                    </div>
                ))}
            </CardContent>
             <CardFooter>
                 <Button disabled><Save className="mr-2" />Save Bin Configuration</Button>
            </CardFooter>
        </Card>
    );
}

// --- Room Manager ---
const RoomManager: FC<{ ug: string; user: any }> = ({ ug, user }) => {
    const firestore = useFirestore();
    const roomsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'ugRooms'), where('ug', '==', ug)) : null, [firestore, ug]);
    const { data: rooms, isLoading } = useCollection(roomsQuery);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Room Pool</CardTitle>
                <CardDescription>Manage the list of rooms available for {ug} classes.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Room ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={4} className="text-center"><Skeleton className="h-8 w-full" /></TableCell></TableRow>}
                         {!isLoading && rooms?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No rooms defined for {ug}.</TableCell></TableRow>}
                        {rooms?.map(room => (
                            <TableRow key={room.id}>
                                <TableCell>{room.roomId}</TableCell>
                                <TableCell>{room.roomType}</TableCell>
                                <TableCell>{room.capacity}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" disabled><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" disabled><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
                 <Button disabled><PlusCircle className="mr-2" />Add Room</Button>
            </CardFooter>
        </Card>
    );
}


// --- Main Tab Content ---
const UGConfigTab: FC<{ ug: string; policy: SemesterPolicy; user: any }> = ({ ug, policy, user }) => {
    const firestore = useFirestore();
    const coursesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'ugCourses'), where('ug', '==', ug)) : null, [firestore, ug]);
    const { data: courses, isLoading: loadingCourses } = useCollection(coursesQuery);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 <CourseManager ug={ug} user={user} isReadOnly={false} />
                 <ElectiveBinManager ug={ug} user={user} policy={policy} courses={courses} />
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Policy Overview</CardTitle>
                        <CardDescription>Read-only summary of the rules for {ug}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Has Electives:</strong> {policy.hasElectives ? 'Yes' : 'No'}</p>
                        <p><strong>Elective Bins:</strong> {policy.numberOfElectiveBins}</p>
                    </CardContent>
                </Card>
                 <RoomManager ug={ug} user={user} />
            </div>
        </div>
    );
};


export default function TimetableAdminPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const policiesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'semesterPolicies') : null, [firestore]);
    const { data: fetchedPolicies, isLoading: loadingPolicies } = useCollection(policiesQuery);

    const policiesMap = useMemo(() => {
        const map = new Map<string, SemesterPolicy>();
        fetchedPolicies?.forEach(policy => {
            map.set(policy.id, policy as SemesterPolicy);
        });
        SEMESTERS.forEach(sem => {
            if (!map.has(sem)) {
                map.set(sem, { id: sem, ...defaultPolicies[sem] });
            }
        });
        return map;
    }, [fetchedPolicies]);

    if (isUserLoading || loadingPolicies) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (!user || user.email !== 'tt@iiits.in') {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-destructive">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This dashboard is restricted to the Academic Office Timetable Administrator (tt@iiits.in) only.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Academic Office – Timetable Control Panel</CardTitle>
                    <CardDescription>Phase 3: Academic Structure Definition</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="default">
                        <Settings className="h-4 w-4" />
                        <AlertTitle>Current Phase</AlertTitle>
                        <AlertDescription>
                            Define the courses, sections, elective bins, and rooms for each undergraduate year. This data is the foundation for timetable generation.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Tabs defaultValue="UG1" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    {SEMESTERS.map(ug => (
                        <TabsTrigger key={ug} value={ug}>{ug}</TabsTrigger>
                    ))}
                </TabsList>
                {SEMESTERS.map(ug => {
                    const policy = policiesMap.get(ug);
                    if (!policy) return null;
                    return (
                        <TabsContent key={ug} value={ug} className="mt-6">
                            <UGConfigTab ug={ug} policy={policy} user={user} />
                        </TabsContent>
                    )
                })}
            </Tabs>

             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Next Phases</CardTitle>
                     <CardDescription>These sections will be enabled once the academic structure is finalized.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-base text-muted-foreground">Faculty Configuration</CardTitle></CardHeader>
                        <CardContent><Button variant="secondary" disabled>Assign Faculty to Courses</Button></CardContent>
                    </Card>
                     <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-base text-muted-foreground">Student Enrollment</CardTitle></CardHeader>
                        <CardContent><Button variant="secondary" disabled>Run Enrollment Process</Button></CardContent>
                    </Card>
                     <Card className="bg-muted/50">
                        <CardHeader><CardTitle className="text-base text-muted-foreground">Scheduling</CardTitle></CardHeader>
                        <CardContent><Button variant="secondary" disabled>Generate Master Timetable</Button></CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}
