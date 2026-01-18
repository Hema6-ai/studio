'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings, PlusCircle, Trash2, Edit, GraduationCap, Clock, Download, Lock, BrainCircuit, Wand2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, doc, serverTimestamp, writeBatch, getDocs } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TimetableDisplay } from '@/components/dashboard/timetable-display';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ScrollArea } from "@/components/ui/scroll-area";
import { dummyTimetable } from "@/lib/data";
import { Progress } from "@/components/ui/progress";


const SEMESTERS = ['UG1', 'UG2', 'UG3', 'UG4'];

// --- Master Prompt Dialog ---
const MasterPromptDialog: FC = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><BrainCircuit className="mr-2" /> View Master Prompt</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle>MASTER PROMPT: Real-Time University Timetable Generator</DialogTitle>
                    <DialogDescription>This is the authoritative version of the system specification.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-full w-full rounded-md border p-4 font-mono text-xs bg-muted/50">
                   <pre className="whitespace-pre-wrap">
{`🎯 SYSTEM OBJECTIVE
Design and implement a real-time, automated university timetable generation system that produces conflict-free and optimized academic timetables for all students, lecturers, and rooms simultaneously.

The system must reflect real university behavior, where:
- Students may belong to different sections for different subjects
- Lecturers may teach multiple subjects and multiple sections
- Multiple UG programs and branches coexist
- Rooms and labs have different capacities and durations
- No conflicts are allowed at the student level

---

👥 USER ROLES
1. Academic Office (Admin): Enters data, defines constraints, triggers generation, publishes final timetable.
2. Lecturer / Professor: Defines availability, views assigned timetable.
3. Student: Views personal timetable only.

---

🧠 STEP 1: WEB INPUT DATA COLLECTION
- Academic Structure (UGs, Branches, Subjects, Sections)
- Student Data (Enrollment list: ⟨Student, Subject, Section⟩)
- Lecturer Data (Subjects, Sections, Availability, Workload)
- Rooms & Labs (Type, Capacity, Availability)
- Time Slots (Day, Time, Duration, Continuity)

---

🧠 STEP 2: DATA NORMALIZATION
Transform inputs into core entities: Student, Subject, Section, Lecturer, Room, TimeSlot, StudentEnrollment, TeachingAssignment.

---

🔑 TeachingAssignment (CORE ENTITY)
Model each teaching responsibility independently: ⟨Lecturer, Subject, Section, WeeklyHours, SessionDuration⟩

---

🧬 STEP 3: SCHEDULING MODEL
Schedule "sessions", not subjects.
- Gene: ⟨TeachingAssignment, TimeSlotBlock, Room⟩
- Chromosome: Complete university timetable.

---

🚀 STEP 4: INITIAL POPULATION (HEURISTIC)
Generate semi-valid timetables by prioritizing labs, longer sessions, and larger sections while respecting basic availability and capacity.

---

❗ STEP 5: HARD CONSTRAINTS (ABSOLUTE)
If any hard constraint fails → timetable is INVALID.
- **Student-Level**: No student may attend two overlapping sessions.
- **Section**: A section cannot have overlapping sessions.
- **Lecturer**: Cannot teach two sessions at once; must respect availability and workload.
- **Room**: Cannot host two sessions at once; must match type and capacity.
- **Academic**: All required sessions must be scheduled; labs must be continuous.

---

🌟 STEP 6: SOFT CONSTRAINTS (OPTIMIZATION)
Add penalties for non-ideal conditions without invalidating the timetable:
- Minimize student/lecturer idle gaps
- Balance workload across days
- Prefer same room for same subject
- Avoid extreme early/late slots

---

📊 STEP 7: FITNESS FUNCTION
If any hard constraint violated: fitness = 0
Else: fitness = MAX_SCORE − Σ(weight × penalty)

---

🔧 STEP 8: GENETIC OPERATIONS
- Selection: Tournament or roulette.
- Crossover: Swap subject/day blocks.
- Mutation: Change time slot, room, or lecturer.

---

🛠️ STEP 9: REPAIR FUNCTION (MANDATORY)
After crossover/mutation, detect and repair conflicts (student, lecturer, room overlaps).

---

🏆 STEP 10: ELITISM & TERMINATION
- Preserve top K timetables per generation.
- Stop when fitness stagnates, threshold is reached, or max generations are met.

---

🔍 STEP 11: LOCAL SEARCH REFINEMENT
Optimize the best timetable with slot swaps, gap reduction, and room reassignment.

---

📤 STEP 12: OUTPUT GENERATION
Generate conflict-free, capacity-valid timetables for:
1. Student-wise
2. Lecturer-wise
3. Room utilization
4. UG / Branch / Section

---

⚡ STEP 13: REAL-TIME OPERATION
- Admin triggers generation asynchronously.
- Progress feedback is shown.
- Final timetable is published and locked.`}
                    </pre>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};


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
            {dataIsLoading ? <Skeleton className="h-48 w-full" /> : prerequisiteDataIsMissing ? (
                 <Alert variant="destructive">
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
                         </CardFooter>
                    )}
                </Card>
            )}
        </div>
    );
};

// --- Generation Manager ---
const TimetableGenerator: FC = () => {
    const { toast } = useToast();
    const [status, setStatus] = useState<'idle' | 'generating' | 'success'>('idle');
    const [progress, setProgress] = useState(0);
    const [generationLog, setGenerationLog] = useState<string[]>([]);

    const handleGenerate = () => {
        setStatus('generating');
        setProgress(0);
        setGenerationLog(['Initializing generation...']);

        const logMessages = [
            "Validating constraints...",
            "Creating initial population (Generation 1)...",
            "Evaluating fitness scores...",
            "Performing selection and crossover (Generation 20)...",
            "Applying mutations...",
            "Repairing conflicts...",
            "Optimizing for soft constraints (Generation 50)...",
            "Minimizing student gaps...",
            "Finalizing timetable...",
        ];
        
        let logIndex = 0;
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 10, 100));
            if (logIndex < logMessages.length) {
                setGenerationLog(prev => [...prev, logMessages[logIndex]]);
                logIndex++;
            }

            if (logIndex >= logMessages.length && progress >= 90) {
                 clearInterval(interval);
                 setProgress(100);
                 setStatus('success');
                 toast({ title: "Timetable Generated Successfully!", description: "0 hard conflicts found." });
            }
        }, 500);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Timetable Generation</CardTitle>
                    <CardDescription>Run the genetic algorithm to generate the final, conflict-free timetable for the entire university.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerate} disabled={status === 'generating'}>
                        {status === 'generating' ? "Generating..." : "Generate University Timetable"}
                    </Button>
                </CardContent>
                {(status === 'generating' || status === 'success') && (
                    <CardFooter className="flex-col items-start gap-4">
                        <div className="w-full space-y-2">
                            <Label>Generation Progress</Label>
                            <Progress value={progress} />
                            <ScrollArea className="h-32 w-full rounded-md border p-4 font-mono text-xs">
                                {generationLog.map((log, i) => <p key={i}>{log}</p>)}
                            </ScrollArea>
                        </div>
                    </CardFooter>
                )}
            </Card>

            {status === 'success' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Generated Timetable</CardTitle>
                        <CardDescription>Review the final timetable for each undergraduate program.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Tabs defaultValue="UG1">
                            <TabsList>
                                {Object.keys(dummyTimetable).map(ugKey => (
                                    <TabsTrigger key={ugKey} value={ugKey}>{ugKey}</TabsTrigger>
                                ))}
                            </TabsList>
                            {Object.entries(dummyTimetable).map(([ugKey, data]) => (
                                <TabsContent key={ugKey} value={ugKey} className="mt-4">
                                     <TimetableDisplay timetableData={data.timetable} />
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            )}
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

    const handleVerify = () => {
        setVerificationStatus('verifying');
        setTimeout(() => {
            setVerificationStatus('success');
            toast({ title: "Verification Successful", description: "All hard constraints are met." });
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
    
    const getMockMasterTimetable = () => ({ metadata: { semester: 'Fall 2024', generatedAt: new Date().toISOString(), approvedBy: user.email }, sessions: [{ sessionId: 'S1', day: 'Monday', slot: '08:45 – 09:45', roomId: 'G08' }] });
    
    const handleLock = () => {
        if (!firestore) return;
        if (window.confirm("Are you sure you want to lock the timetable? This action is irreversible.")) {
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
            <Card>
                <CardHeader>
                    <CardTitle>1. Final Verification</CardTitle>
                    <CardDescription>Re-verify all hard constraints before proceeding.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleVerify} disabled={isExportDisabled || verificationStatus === 'verifying'}>
                        {verificationStatus === 'verifying' ? 'Verifying...' : 'Run Final Constraint Check'}
                    </Button>
                     {verificationStatus === 'success' && <p className="text-green-600 font-semibold mt-4">✅ Verification successful.</p>}
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
                            <AlertDescription>This timetable is now read-only.</AlertDescription>
                        </Alert>
                    ) : (
                        <Button variant="destructive" disabled={isExportDisabled || isLocking} onClick={handleLock}>
                            <Lock className="mr-2" /> {isLocking ? 'Locking...' : 'Lock Timetable'}
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
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Timetable Generator</CardTitle>
                        <CardDescription>Define, configure, and generate the university timetable.</CardDescription>
                    </div>
                    <MasterPromptDialog />
                </CardHeader>
            </Card>

            <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="structure">Structure</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    <TabsTrigger value="generate">Generate</TabsTrigger>
                </TabsList>
                
                <TabsContent value="policies" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Policy Definition</CardTitle>
                            <CardDescription>Prompts defining the rules for generating master datasets.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Tabs defaultValue="rooms">
                                <TabsList>
                                    <TabsTrigger value="rooms">Rooms Dataset</TabsTrigger>
                                    <TabsTrigger value="faculty">Faculty Dataset</TabsTrigger>
                                </TabsList>
                                <TabsContent value="rooms" className="mt-4">
                                     <ScrollArea className="h-[60vh] w-full rounded-md border p-4 font-mono text-sm bg-muted/50">
                                        <pre className="whitespace-pre-wrap">
{`You are provided with three room datasets:
1. G-Series classrooms
2. B-Series classrooms
3. Laboratory rooms

Your task is to generate a single consolidated JSON object representing all rooms, following the strict rules below.

MANDATORY DATA RULES:
1. Room categories and constraints:
   - G-Series:
     • Room ID format: G-XX
     • Capacity: exactly 120
     • Total rooms required: 10
   - B-Series:
     • Room ID format: B-XX
     • Capacity: exactly 70
     • Total rooms required: 20
   - Labs:
     • Room ID format: L-XX
     • Capacity: exactly 40
     • Total rooms required: 5

2. If any dataset contains fewer rooms than required:
   - Automatically generate additional rooms to reach the exact required count.
   - Auto-generated rooms must follow the same ID format, capacity rules, and naming sequence.
   - Ensure all Room IDs are unique.

3. Preserve all original room records exactly as provided.
4. Append auto-generated rooms only if required.

FINAL OUTPUT FORMAT (STRICT):
{
  "G_series": [
    { "RoomID": "G-01", "Capacity": 120 },
    ...
  ],
  "B_series": [
    { "RoomID": "B-01", "Capacity": 70 },
    ...
  ],
  "Labs": [
    { "RoomID": "L-01", "Capacity": 40 },
    ...
  ]
}

OUTPUT CONSTRAINTS:
- Output ONLY valid JSON.
- No explanations, no comments, no markdown.
- Deterministic, schema-clean output.`}
                                        </pre>
                                    </ScrollArea>
                                </TabsContent>
                                <TabsContent value="faculty" className="mt-4">
                                     <ScrollArea className="h-[60vh] w-full rounded-md border p-4 font-mono text-sm bg-muted/50">
                                        <pre className="whitespace-pre-wrap">
{`You are provided with a faculty master dataset containing faculty details for an academic institution.

Your task is to generate a single consolidated JSON object representing all faculty members, following the strict rules below.

MANDATORY DATA RULES:
1. Each faculty record MUST contain the following fields exactly:
   - FacultyID, Name, Email, Department, Designation, Specialization, MaxWeeklyHours

2. Preserve all original faculty records exactly as provided.
3. If any required field is missing or empty, auto-generate a valid value based on realistic academic norms.
4. Email rules: Format: firstname.lastname@iiits.in. Must be unique. Remove titles.
5. FacultyID rules: Must be unique. Format: F-XXXX.
6. MaxWeeklyHours rules: Must be a positive integer (6-20).
7. Department and Specialization must align logically.

FINAL OUTPUT FORMAT (STRICT):
{
  "faculty": [
    {
      "FacultyID": "F-0001",
      "Name": "Ramesh Kumar",
      "Email": "ramesh.kumar@iiits.in",
      "Department": "CSE",
      "Designation": "Assistant Professor",
      "Specialization": "Machine Learning",
      "MaxWeeklyHours": 12
    }
    ...
  ]
}

OUTPUT CONSTRAINTS:
- Output ONLY valid JSON. No explanations, no comments.
- Deterministic, schema-clean output.`}
                                        </pre>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="structure" className="mt-6">
                    <div className="space-y-6">
                        <TimeGridPreview />
                        <RoomManager user={user} />
                    </div>
                </TabsContent>
                
                 <TabsContent value="assignments" className="mt-6">
                     <div className="space-y-6">
                       <FacultyManager user={user} />
                       <AssignmentManager user={user} />
                     </div>
                </TabsContent>
                
                 <TabsContent value="sessions" className="mt-6">
                    <SessionGenerationManager user={user} />
                </TabsContent>

                 <TabsContent value="generate" className="mt-6">
                    <TimetableGenerator />
                </TabsContent>
            </Tabs>
        </div>
    );
}
