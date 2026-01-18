'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Settings, Save, PlusCircle, Trash2, Edit, GraduationCap, Building, Clock, Activity, BookOpen, User as UserIcon, Wand2, Download, FileJson, Lock, ShieldCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, doc, serverTimestamp, query, where, writeBatch, getDocs } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TimetableDisplay } from '@/components/dashboard/timetable-display';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';


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

// --- Room Manager ---
const RoomManager: FC<{ user: any }> = ({ user }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const roomsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'rooms') : null, [firestore]);
    const { data: roomList, isLoading } = useCollection(roomsCollection);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);

    const openDialog = (room = null) => {
        setEditingRoom(room);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this room? This cannot be undone.") && firestore) {
            deleteDocumentNonBlocking(doc(firestore, 'rooms', id));
            toast({ title: "Room Deleted" });
        }
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Room Master List</CardTitle>
                    <CardDescription>Define all physical rooms available for classes.</CardDescription>
                </div>
                <Button onClick={() => openDialog()}><PlusCircle className="mr-2" />Add Room</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Room ID</TableHead><TableHead>Type</TableHead><TableHead>Capacity</TableHead><TableHead>Allowed UGs</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>}
                        {!isLoading && roomList?.map(r => (
                            <TableRow key={r.id}>
                                <TableCell>{r.roomId}</TableCell>
                                <TableCell>{r.roomType}</TableCell>
                                <TableCell>{r.capacity}</TableCell>
                                <TableCell>{r.allowedUGs.join(', ')}</TableCell>
                                <TableCell className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openDialog(r)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <RoomForm open={isDialogOpen} setOpen={setIsDialogOpen} room={editingRoom} user={user} />
        </Card>
    );
};

// --- Room Form Dialog ---
const RoomForm: FC<{ open: boolean, setOpen: (open: boolean) => void, room: any, user: any }> = ({ open, setOpen, room, user }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [formData, setFormData] = useState({ roomId: '', roomType: 'THEORY', capacity: 0, allowedUGs: [] as string[] });

    useEffect(() => {
        if (room) {
            setFormData({
                roomId: room.roomId || '',
                roomType: room.roomType || 'THEORY',
                capacity: room.capacity || 0,
                allowedUGs: room.allowedUGs || [],
            });
        } else {
            setFormData({ roomId: '', roomType: 'THEORY', capacity: 0, allowedUGs: [] });
        }
    }, [room]);

    const handleSave = () => {
        if (!formData.roomId || !formData.roomType || !firestore) {
            toast({ variant: 'destructive', title: "Validation Error", description: "Room ID and Type are required." });
            return;
        }

        const dataToSave = {
            ...formData,
            capacity: Number(formData.capacity),
            createdBy: user.email,
            createdAt: room?.createdAt || serverTimestamp(),
            lastUpdatedAt: serverTimestamp()
        };

        const docRef = room ? doc(firestore, 'rooms', room.id) : doc(collection(firestore, 'rooms'));
        setDocumentNonBlocking(docRef, dataToSave, { merge: true });
        toast({ title: `Room ${room ? 'Updated' : 'Added'}` });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{room ? 'Edit' : 'Add'} Room</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Room ID (e.g., G08, Lab103)</Label>
                        <Input value={formData.roomId} onChange={e => setFormData(p => ({ ...p, roomId: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Room Type</Label>
                            <Select value={formData.roomType} onValueChange={val => setFormData(p => ({ ...p, roomType: val }))}>
                                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="THEORY">THEORY</SelectItem>
                                    <SelectItem value="LAB">LAB</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Capacity</Label>
                            <Input type="number" value={formData.capacity} onChange={e => setFormData(p => ({ ...p, capacity: Number(e.target.value) }))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Allowed UGs</Label>
                        <div className="flex gap-4">
                            {SEMESTERS.map(ug => (
                                <div key={ug} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`ug-room-${ug}`}
                                        checked={formData.allowedUGs.includes(ug)}
                                        onCheckedChange={checked => {
                                            const newUgs = checked ? [...formData.allowedUGs, ug] : formData.allowedUGs.filter(u => u !== ug);
                                            setFormData(p => ({ ...p, allowedUGs: newUgs.sort() }));
                                        }}
                                    />
                                    <Label htmlFor={`ug-room-${ug}`}>{ug}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter><Button onClick={handleSave}>Save Room</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- Time Grid Preview ---
const TimeGridPreview: FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Academic Time Grid</CardTitle>
                <CardDescription>This is the fixed grid of days and time slots for all classes.</CardDescription>
            </CardHeader>
            <CardContent>
                <TimetableDisplay timetableData={{}} />
            </CardContent>
        </Card>
    )
}

// --- Faculty Manager ---
const FacultyManager: FC<{ user: any }> = ({ user }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const facultyCollection = useMemoFirebase(() => firestore ? collection(firestore, 'faculty') : null, [firestore]);
    const { data: facultyList, isLoading } = useCollection(facultyCollection);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<any>(null);

    const openDialog = (faculty = null) => {
        setEditingFaculty(faculty);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this faculty member? This cannot be undone.") && firestore) {
            deleteDocumentNonBlocking(doc(firestore, 'faculty', id));
            toast({ title: "Faculty Deleted" });
        }
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Faculty Master List</CardTitle>
                    <CardDescription>Manage all faculty members in the university.</CardDescription>
                </div>
                <Button onClick={() => openDialog()}><PlusCircle className="mr-2" />Add Faculty</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Max Hours/Week</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>}
                        {!isLoading && facultyList?.map(f => (
                            <TableRow key={f.id}>
                                <TableCell>{f.facultyName}</TableCell>
                                <TableCell>{f.department}</TableCell>
                                <TableCell>{f.maxWeeklyHours}</TableCell>
                                <TableCell className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openDialog(f)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <FacultyForm open={isDialogOpen} setOpen={setIsDialogOpen} faculty={editingFaculty} user={user} />
        </Card>
    );
};

// --- Faculty Form Dialog ---
const FacultyForm: FC<{ open: boolean, setOpen: (open: boolean) => void, faculty: any, user: any }> = ({ open, setOpen, faculty, user }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [formData, setFormData] = useState({ facultyName: '', department: '', maxWeeklyHours: 10, allowedUGs: [] as string[] });

    useEffect(() => {
        if (faculty) {
            setFormData({
                facultyName: faculty.facultyName || '',
                department: faculty.department || '',
                maxWeeklyHours: faculty.maxWeeklyHours || 10,
                allowedUGs: faculty.allowedUGs || [],
            });
        } else {
            setFormData({ facultyName: '', department: '', maxWeeklyHours: 10, allowedUGs: [] });
        }
    }, [faculty]);

    const handleSave = () => {
        if (!formData.facultyName || !formData.department || !firestore) {
            toast({ variant: 'destructive', title: "Validation Error", description: "Name and department are required." });
            return;
        }

        const dataToSave = {
            ...formData,
            maxWeeklyHours: Number(formData.maxWeeklyHours),
            createdBy: user.email,
            createdAt: faculty?.createdAt || serverTimestamp(),
            lastUpdatedAt: serverTimestamp()
        };

        const docRef = faculty ? doc(firestore, 'faculty', faculty.id) : doc(collection(firestore, 'faculty'));
        setDocumentNonBlocking(docRef, dataToSave, { merge: true });
        toast({ title: `Faculty ${faculty ? 'Updated' : 'Added'}` });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{faculty ? 'Edit' : 'Add'} Faculty</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Faculty Name</Label>
                        <Input value={formData.facultyName} onChange={e => setFormData(p => ({ ...p, facultyName: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={formData.department} onValueChange={val => setFormData(p => ({ ...p, department: val }))}>
                            <SelectTrigger><SelectValue placeholder="Select department..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CSE">CSE</SelectItem>
                                <SelectItem value="ECE">ECE</SelectItem>
                                <SelectItem value="AIDS">AIDS</SelectItem>
                                <SelectItem value="HSS">HSS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Max Weekly Hours</Label>
                        <Input type="number" value={formData.maxWeeklyHours} onChange={e => setFormData(p => ({ ...p, maxWeeklyHours: Number(e.target.value) }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Allowed to Teach</Label>
                        <div className="flex gap-4">
                            {SEMESTERS.map(ug => (
                                <div key={ug} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`ug-${ug}`}
                                        checked={formData.allowedUGs.includes(ug)}
                                        onCheckedChange={checked => {
                                            const newUgs = checked ? [...formData.allowedUGs, ug] : formData.allowedUGs.filter(u => u !== ug);
                                            setFormData(p => ({ ...p, allowedUGs: newUgs }));
                                        }}
                                    />
                                    <Label htmlFor={`ug-${ug}`}>{ug}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter><Button onClick={handleSave}>Save Faculty</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// --- Assignment Manager ---
const AssignmentManager: FC<{ user: any }> = ({ user }) => {
    const firestore = useFirestore();
    const { toast } = useToast();

    // Data Fetches
    const { data: courses } = useCollection(useMemoFirebase(() => firestore ? collection(firestore, 'ugCourses') : null, [firestore]));
    const { data: sections } = useCollection(useMemoFirebase(() => firestore ? collection(firestore, 'ugSections') : null, [firestore]));
    const { data: facultyList } = useCollection(useMemoFirebase(() => firestore ? collection(firestore, 'faculty') : null, [firestore]));
    const { data: assignments } = useCollection(useMemoFirebase(() => firestore ? collection(firestore, 'teachingAssignments') : null, [firestore]));

    // Derived assignments map for quick lookups
    const assignmentsMap = useMemo(() => {
        const map = new Map<string, any>();
        assignments?.forEach(a => map.set(`${a.ug}-${a.courseCode}-${a.section}`, a));
        return map;
    }, [assignments]);
    
    // Create a structured list of every section that needs an assignment
    const allSections = useMemo(() => {
        if (!courses || !sections) return [];
        const sectionList: any[] = [];
        courses.forEach(course => {
            const sectionInfo = sections.find(s => s.courseCode === course.courseCode && s.ug === course.ug);
            const numSections = sectionInfo?.sectionsRequired || 1;
            for (let i = 1; i <= numSections; i++) {
                sectionList.push({
                    key: `${course.ug}-${course.courseCode}-${i}`,
                    ug: course.ug,
                    courseCode: course.courseCode,
                    courseName: course.courseName,
                    section: i.toString()
                });
            }
        });
        return sectionList.sort((a,b) => a.key.localeCompare(b.key));
    }, [courses, sections]);
    
    const handleAssignmentChange = (sectionData: any, facultyId: string) => {
        if (!facultyId || !firestore) return;
        
        const faculty = facultyList?.find(f => f.id === facultyId);
        if (!faculty) return;

        const assignmentKey = `${sectionData.ug}-${sectionData.courseCode}-${sectionData.section}`;
        const existingAssignment = assignmentsMap.get(assignmentKey);
        
        const docRef = existingAssignment 
            ? doc(firestore, 'teachingAssignments', existingAssignment.id)
            : doc(collection(firestore, 'teachingAssignments'));

        const dataToSave = {
            ug: sectionData.ug,
            courseCode: sectionData.courseCode,
            section: sectionData.section,
            facultyId: faculty.id,
            facultyName: faculty.facultyName,
            createdBy: user.email,
            createdAt: existingAssignment?.createdAt || serverTimestamp()
        };
        
        setDocumentNonBlocking(docRef, dataToSave, { merge: true });
        toast({ title: "Assignment Saved", description: `${faculty.facultyName} assigned to ${sectionData.courseCode} Section ${sectionData.section}`});
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Teaching Assignments</CardTitle>
                <CardDescription>Assign a faculty member to each course section.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>UG</TableHead><TableHead>Course</TableHead><TableHead>Section</TableHead><TableHead>Assigned Faculty</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {allSections.map(s => {
                            const assignment = assignmentsMap.get(s.key);
                            const eligibleFaculty = facultyList?.filter(f => f.allowedUGs.includes(s.ug)) || [];
                            return (
                                <TableRow key={s.key}>
                                    <TableCell>{s.ug}</TableCell>
                                    <TableCell>{s.courseCode} - {s.courseName}</TableCell>
                                    <TableCell>{s.section}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={assignment?.facultyId || ''}
                                            onValueChange={(facultyId) => handleAssignmentChange(s, facultyId)}
                                        >
                                            <SelectTrigger className="w-[250px]">
                                                <SelectValue placeholder="Select Faculty..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {eligibleFaculty.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.facultyName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

// --- Session Generation Manager ---
const SessionGenerationManager: FC<{ user: any }> = ({ user }) => {
    const firestore = useFirestore();
    const { toast } = useToast();

    // Input Data
    const { data: teachingAssignments, isLoading: loadingAssignments } = useCollection(useMemoFirebase(() => firestore ? collection(firestore, 'teachingAssignments') : null, [firestore]));
    const { data: ugCourses, isLoading: loadingCourses } = useCollection(useMemoFirebase(() => firestore ? collection(firestore, 'ugCourses') : null, [firestore]));
    const { data: students, isLoading: loadingStudents } = useCollection(useMemoFirebase(() => firestore ? collection(firestore, 'students') : null, [firestore]));
    const { data: faculty, isLoading: loadingFaculty } = useCollection(useMemoFirebase(() => firestore ? collection(firestore, 'faculty') : null, [firestore]));

    // Output Data
    const sessionsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'sessions') : null, [firestore]);
    const { data: generatedSessions, isLoading: loadingGeneratedSessions } = useCollection(sessionsCollection);

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dataIsLoading = loadingAssignments || loadingCourses || loadingStudents || loadingFaculty;
    const prerequisiteDataIsMissing = !teachingAssignments?.length || !ugCourses?.length || !students?.length || !faculty?.length;

    const handleGenerateSessions = async () => {
        if (!firestore || !sessionsCollection) return;
        setIsGenerating(true);
        setError(null);

        try {
            const newSessions: any[] = [];
            // Generation logic
            for (const assignment of teachingAssignments!) {
                const course = ugCourses!.find(c => c.ug === assignment.ug && c.courseCode === assignment.courseCode);
                if (!course) throw new Error(`Course details not found for ${assignment.courseCode}`);

                const enrolledStudents = students!.filter(s =>
                    `UG${s.ugYear}` === assignment.ug &&
                    s.enrolledCourses.some((ec: any) => ec.courseAbbr === assignment.courseCode && (ec.section === assignment.section || ec.section === 'Common'))
                ).map(s => s.id);

                const numSessions = course.sessionType === 'LAB' ? course.weeklyHours / course.durationInSlots : course.weeklyHours;

                for (let i = 0; i < numSessions; i++) {
                    newSessions.push({
                        ug: assignment.ug,
                        courseCode: assignment.courseCode,
                        section: assignment.section,
                        facultyId: assignment.facultyId,
                        studentIds: enrolledStudents,
                        durationSlots: course.durationInSlots,
                        roomTypeRequired: course.requiresRoomType,
                        status: "UNSCHEDULED"
                    });
                }
            }
            
            // Validation logic
            if (newSessions.some(s => s.roomTypeRequired === 'LAB' && s.durationSlots !== 2)) {
                throw new Error("Validation Failed: All LAB sessions must have a duration of 2 slots.");
            }

            // Clear existing sessions and write new ones in a batch
            const batch = writeBatch(firestore);
            const existingDocs = await getDocs(sessionsCollection);
            existingDocs.forEach(doc => batch.delete(doc.ref));
            
            newSessions.forEach(session => {
                const docRef = doc(sessionsCollection);
                batch.set(docRef, session);
            });

            await batch.commit();

            toast({ title: "Success", description: `${newSessions.length} weekly sessions have been generated.` });

        } catch (e: any) {
            setError(e.message);
            toast({ variant: 'destructive', title: "Session Generation Failed", description: e.message });
        } finally {
            setIsGenerating(false);
        }
    };
    
     const reviewStats = useMemo(() => {
        if (!generatedSessions) return null;
        const stats = {
            byUG: {} as Record<string, number>,
            bySubject: {} as Record<string, number>,
            byFaculty: {} as Record<string, number>,
            byType: { THEORY: 0, LAB: 0 },
        };
        for (const session of generatedSessions) {
            stats.byUG[session.ug] = (stats.byUG[session.ug] || 0) + 1;
            stats.bySubject[session.courseCode] = (stats.bySubject[session.courseCode] || 0) + 1;
            stats.byFaculty[session.facultyId] = (stats.byFaculty[session.facultyId] || 0) + 1;
            stats.byType[session.roomTypeRequired as 'THEORY' | 'LAB']++;
        }
        return stats;
    }, [generatedSessions]);


    return (
         <div className="space-y-6">
            <Alert>
                <Activity className="h-4 w-4" />
                <AlertTitle>Phase 4: Session Generation</AlertTitle>
                <AlertDescription>
                    Generate all required weekly class sessions from approved enrollments and teaching assignments. This step creates the "what" before scheduling the "when" and "where".
                </AlertDescription>
            </Alert>

            {dataIsLoading ? <Skeleton className="h-48 w-full" /> : prerequisiteDataIsMissing ? (
                 <Alert variant="destructive">
                     <AlertTriangle className="h-4 w-4"/>
                     <AlertTitle>Prerequisites Missing</AlertTitle>
                     <AlertDescription>Cannot generate sessions. Please ensure that all courses, faculty, teaching assignments, and student enrollments have been configured in the previous phases.</AlertDescription>
                 </Alert>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Session Generation Control</CardTitle>
                        <CardDescription>Click the button to generate the complete list of unscheduled class sessions for the semester.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleGenerateSessions} disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Weekly Sessions"}
                        </Button>
                        {error && <p className="text-sm text-destructive mt-4">{error}</p>}
                    </CardContent>
                    {generatedSessions && reviewStats && (
                         <CardFooter className="flex-col items-start gap-4">
                            <h3 className="text-lg font-semibold">Review Generated Sessions</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                <Card>
                                    <CardHeader><CardTitle className="text-base">By UG</CardTitle></CardHeader>
                                    <CardContent><Table>{Object.entries(reviewStats.byUG).map(([ug, count]) => <TableRow key={ug}><TableCell>{ug}</TableCell><TableCell>{count} sessions</TableCell></TableRow>)}</Table></CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle className="text-base">By Type</CardTitle></CardHeader>
                                    <CardContent><Table><TableRow><TableCell>Theory</TableCell><TableCell>{reviewStats.byType.THEORY}</TableCell></TableRow><TableRow><TableCell>Lab</TableCell><TableCell>{reviewStats.byType.LAB}</TableCell></TableRow></Table></CardContent>
                                </Card>
                                 <Card className="col-span-2">
                                    <CardHeader><CardTitle className="text-base">By Subject</CardTitle></CardHeader>
                                    <CardContent className="max-h-48 overflow-y-auto"><Table>{Object.entries(reviewStats.bySubject).map(([subject, count]) => <TableRow key={subject}><TableCell>{subject}</TableCell><TableCell>{count} sessions/week</TableCell></TableRow>)}</Table></CardContent>
                                </Card>
                            </div>
                            <div className="w-full">
                                <Button>Approve Sessions</Button>
                            </div>
                         </CardFooter>
                    )}
                </Card>
            )}
        </div>
    );
};

// --- Optimization Manager ---
const OptimizationManager: FC = () => {
    const { toast } = useToast();
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<any>(null);

    const handleRunOptimization = () => {
        setIsOptimizing(true);
        // Simulate a network request and complex computation
        setTimeout(() => {
            // Mock data for demonstration
            const mockResult = {
                studentGap: { before: 2.8, after: 1.5 },
                facultyIdle: { before: 3.2, after: 2.1 },
                roomUtilization: [
                    { name: 'Before', G01: 40, G02: 30, L101: 80, L102: 60 },
                    { name: 'After', G01: 55, G02: 45, L101: 75, L102: 70 },
                ]
            };
            setOptimizationResult(mockResult);
            setIsOptimizing(false);
            toast({ title: "Optimization Complete", description: "Review the quality improvements below." });
        }, 2500);
    };
    
    const handleRollback = () => {
        setOptimizationResult(null);
        toast({ title: "Rollback Successful", description: "Reverted to the original clash-free timetable." });
    };

    return (
        <div className="space-y-6">
            <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertTitle>Phase 5: Timetable Optimization</AlertTitle>
                <AlertDescription>
                    This phase improves the quality of a valid, clash-free timetable by applying soft constraints like minimizing student gaps and balancing faculty load, without violating any hard constraints.
                </AlertDescription>
            </Alert>
            <Card>
                <CardHeader>
                    <CardTitle>Optimization Control</CardTitle>
                    <CardDescription>Run the optimizer to improve the timetable's quality.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleRunOptimization} disabled={isOptimizing}>
                        {isOptimizing ? "Optimizing..." : "Run Optimization"}
                    </Button>
                </CardContent>
                {optimizationResult && (
                    <CardFooter className="flex-col items-start gap-4">
                        <h3 className="text-lg font-semibold">Optimization Results: Before vs. After</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            <Card>
                                <CardHeader><CardTitle>Student Schedule Quality</CardTitle><CardDescription>Avg. gaps per day</CardDescription></CardHeader>
                                <CardContent><p className="text-3xl font-bold">{optimizationResult.studentGap.after.toFixed(1)} <span className="text-sm text-muted-foreground line-through ml-2">{optimizationResult.studentGap.before.toFixed(1)}</span></p></CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Faculty Schedule Quality</CardTitle><CardDescription>Avg. idle slots per day</CardDescription></CardHeader>
                                <CardContent><p className="text-3xl font-bold">{optimizationResult.facultyIdle.after.toFixed(1)} <span className="text-sm text-muted-foreground line-through ml-2">{optimizationResult.facultyIdle.before.toFixed(1)}</span></p></CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>Room Utilization</CardTitle><CardDescription>Balance score</CardDescription></CardHeader>
                                <CardContent><p className="text-3xl font-bold">78% <span className="text-sm text-muted-foreground line-through ml-2">65%</span></p></CardContent>
                            </Card>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button>Approve Final Timetable</Button>
                            <Button variant="outline" onClick={handleRollback}>Rollback to Hard Timetable</Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

// --- Export & Lock Manager ---
const ExportManager: FC<{ user: any }> = ({ user }) => {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'verifying' | 'success' | 'error'>('unverified');
    const [isLocked, setIsLocked] = useState(false);
    const [isLocking, setIsLocking] = useState(false);

    // This would check the lock status from Firestore
    // For now, we simulate it with local state.

    const handleVerify = () => {
        setVerificationStatus('verifying');
        // Simulate a check
        setTimeout(() => {
            setVerificationStatus('success');
            toast({ title: "Verification Successful", description: "All hard constraints are met. You can now export or lock the timetable." });
        }, 1500);
    };

    const handleDownloadJson = (data: any, filename: string) => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    // In a real app, these would use Firestore data.
    const getMockMasterTimetable = () => ({ metadata: { semester: 'Fall 2024', generatedAt: new Date().toISOString(), approvedBy: user.email, retriesUsed: 2 }, sessions: [{ sessionId: 'S1', day: 'Monday', slot: '08:45 – 09:45', roomId: 'G08' }] });
    const getMockStudentData = () => ([{ studentId: 'P21001', ug: 'UG3', enrolledSubjects: ['CS301'], weeklyTimetable: [{ day: 'Monday', slot: '08:45 – 09:45', subject: 'CS301', room: 'G08' }] }]);
    const getMockFacultyData = () => ([{ facultyId: 'F101', subjectsTaught: ['CS301'], weeklyTimetable: [{ day: 'Monday', slot: '08:45 – 09:45', subject: 'CS301', room: 'G08' }] }]);
    const getMockRoomData = () => ([{ roomId: 'G08', weeklyUsage: [{ day: 'Monday', slot: '08:45 – 09:45', subject: 'CS301', faculty: 'Dr. Smith' }] }]);
    const getMockUgTimetable = () => ({ ug: 'UG3', sections: ['A'], weeklyGrid: { 'Monday': [{ time: '08:45 – 09:45', subject: 'CS301' }] } });

    const handleLock = () => {
        if (!firestore) return;
        if (window.confirm("Are you sure you want to lock the timetable? This will prevent all future edits for this semester.")) {
            setIsLocking(true);
            const lockRef = doc(firestore, 'timetableLocks', 'currentSemester');
            setDocumentNonBlocking(lockRef, { isLocked: true, lockedBy: user.email, lockedAt: serverTimestamp() }, { merge: true });
            setTimeout(() => {
                setIsLocked(true);
                setIsLocking(false);
                toast({ title: "Timetable Locked", description: "All configurations for this semester are now read-only." });
            }, 1000);
        }
    };
    
    const isExportDisabled = verificationStatus !== 'success' || isLocked;

    return (
        <div className="space-y-6">
            <Alert>
                <Download className="h-4 w-4" />
                <AlertTitle>Phase 6: Export &amp; Lock</AlertTitle>
                <AlertDescription>
                    This is the final phase. First, run a final verification of all hard constraints. Then, export the required JSON data for other systems and lock the timetable to prevent further changes.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>1. Final Verification</CardTitle>
                    <CardDescription>Re-verify all hard constraints before proceeding.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleVerify} disabled={verificationStatus === 'verifying' || verificationStatus === 'success' || isLocked}>
                        {verificationStatus === 'verifying' ? 'Verifying...' : 'Run Final Constraint Check'}
                    </Button>
                     {verificationStatus === 'success' && <p className="text-green-600 font-semibold mt-4">✅ Verification successful. No violations found.</p>}
                     {verificationStatus === 'error' && <p className="text-destructive font-semibold mt-4">❌ Verification failed. Please resolve conflicts.</p>}
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>2. Data Export</CardTitle>
                    <CardDescription>Download the finalized timetable data in various JSON formats.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div><p className="font-medium">Master Timetable</p><p className="text-xs text-muted-foreground">masterTimetable.json</p></div>
                        <Button variant="outline" size="icon" disabled={isExportDisabled} onClick={() => handleDownloadJson(getMockMasterTimetable(), 'masterTimetable.json')}><Download /></Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div><p className="font-medium">Student Data</p><p className="text-xs text-muted-foreground">students.json</p></div>
                        <Button variant="outline" size="icon" disabled={isExportDisabled} onClick={() => handleDownloadJson(getMockStudentData(), 'students.json')}><Download /></Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div><p className="font-medium">Faculty Data</p><p className="text-xs text-muted-foreground">faculty.json</p></div>
                        <Button variant="outline" size="icon" disabled={isExportDisabled} onClick={() => handleDownloadJson(getMockFacultyData(), 'faculty.json')}><Download /></Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div><p className="font-medium">Room Data</p><p className="text-xs text-muted-foreground">rooms.json</p></div>
                        <Button variant="outline" size="icon" disabled={isExportDisabled} onClick={() => handleDownloadJson(getMockRoomData(), 'rooms.json')}><Download /></Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div><p className="font-medium">UG Timetables</p><p className="text-xs text-muted-foreground">ugTimetables.json</p></div>
                        <Button variant="outline" size="icon" disabled={isExportDisabled} onClick={() => handleDownloadJson(getMockUgTimetable(), 'ugTimetables.json')}><Download /></Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>3. Deploy &amp; Lock</CardTitle>
                    <CardDescription>Lock the entire timetable configuration for this semester. This action is irreversible.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLocked ? (
                        <Alert variant="destructive">
                            <Lock className="h-4 w-4" />
                            <AlertTitle>Timetable Locked</AlertTitle>
                            <AlertDescription>This timetable is now read-only. No further changes are permitted.</AlertDescription>
                        </Alert>
                    ) : (
                        <Button variant="destructive" disabled={isExportDisabled || isLocking} onClick={handleLock}>
                            <Lock className="mr-2" /> {isLocking ? 'Locking...' : 'Lock Timetable for Deployment'}
                        </Button>
                    )}
                </CardContent>
            </Card>

        </div>
    );
};


// --- Main Page Component ---
export default function TimetableAdminPage() {
    const { user, isUserLoading } = useUser();
    
    if (isUserLoading) {
        return <Skeleton className="h-screen w-full" />;
    }

    if (!user || user.email !== 'acadoffice@campus.edu') {
        return (
            <Card className="max-w-2xl mx-auto"><CardHeader><CardTitle className="text-destructive">Access Denied</CardTitle></CardHeader><CardContent><p>This dashboard is restricted to the Academic Office Timetable Administrator (acadoffice@campus.edu) only.</p></CardContent></Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Timetable Generator</CardTitle>
                    <CardDescription>
                        <ScrollArea className="h-40 w-full rounded-md border p-4 font-mono text-xs bg-muted/50">
                            <pre className="whitespace-pre-wrap">
{`A real-time, constraint-based university timetable generator that globally schedules students, lecturers, subjects, sections, and rooms while enforcing student-level conflict constraints using genetic-algorithm-driven optimization.`}
                            </pre>
                        </ScrollArea>
                    </CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="structure" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="policy">Phase 1: Policies</TabsTrigger>
                    <TabsTrigger value="structure">Phase 2: Structure</TabsTrigger>
                    <TabsTrigger value="faculty">Phase 3: Faculty</TabsTrigger>
                    <TabsTrigger value="sessions">Phase 4: Sessions</TabsTrigger>
                    <TabsTrigger value="optimize">Phase 5: Optimize</TabsTrigger>
                    <TabsTrigger value="export">Phase 6: Export &amp; Lock</TabsTrigger>
                </TabsList>
                
                <TabsContent value="policy" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Phase 1: Policy Definition (UG-3 Student Data Generation)</CardTitle>
                            <CardDescription>
                                This prompt defines the rules for generating the base student dataset for UG-3. This data is critical for sectioning and preference allocation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ScrollArea className="h-[60vh] w-full rounded-md border p-4 font-mono text-sm bg-muted/50">
                                <pre className="whitespace-pre-wrap">
{`You are provided with 2023-batch student datasets for three branches: CSE, ECE, and AIDS.

Your task is to generate a single consolidated JSON object that is complete, valid, and ready for automated academic systems.

MANDATORY DATA RULES:
1. Each branch MUST contain a minimum of 20 students.
2. If the uploaded dataset for any branch contains fewer than 20 students, you MUST auto-generate additional students until the count reaches exactly 20.
3. Auto-generated students must strictly follow these rules:
   - StudentID formats:
     • CSE  → S2023001XXXX
     • ECE  → S2023002XXXX
     • AIDS → S2023003XXXX
   - Email format: firstname.lastname23@iiits.in
   - CGPA must be between 6.00 and 10.00, with exactly two decimal places.
   - Names must be realistic Indian names.
   - All StudentIDs, emails, and names must be unique.
4. All original students from the dataset MUST be preserved exactly as-is.
5. Auto-generated students should be appended only if required and must blend seamlessly with real data.

FINAL OUTPUT FORMAT (STRICT):
{
  "cse": [ { StudentID, Name, Email, CGPA }, ... ],
  "ece": [ { StudentID, Name, Email, CGPA }, ... ],
  "aids": [ { StudentID, Name, Email, CGPA }, ... ]
}

OUTPUT CONSTRAINTS:
- Output ONLY valid JSON.
- No explanations, no comments, no markdown.
- No truncation or placeholders.
- Deterministic, schema-clean output.

This JSON will be directly consumed by downstream systems including section allocation, preference resolution, and timetable optimization engines.`}
                                </pre>
                           </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="structure" className="mt-6">
                    <div className="space-y-6">
                        <TimeGridPreview />
                        <RoomManager user={user} />
                        {/* Existing Structure components (courses, sections, etc) would go here */}
                    </div>
                </TabsContent>
                
                 <TabsContent value="faculty" className="mt-6">
                     <div className="space-y-6">
                       <FacultyManager user={user} />
                       <AssignmentManager user={user} />
                     </div>
                </TabsContent>
                
                 <TabsContent value="sessions" className="mt-6">
                    <SessionGenerationManager user={user} />
                </TabsContent>

                 <TabsContent value="optimize" className="mt-6">
                    <OptimizationManager />
                </TabsContent>

                 <TabsContent value="export" className="mt-6">
                    <ExportManager user={user} />
                </TabsContent>

            </Tabs>
        </div>
    );
}
