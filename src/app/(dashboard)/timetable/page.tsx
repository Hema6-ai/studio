'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Settings, Save, PlusCircle, Trash2, Edit, GraduationCap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, doc, serverTimestamp, query, where, writeBatch } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

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


// --- Main Page Component ---
export default function TimetableAdminPage() {
    const { user, isUserLoading } = useUser();
    
    if (isUserLoading) {
        return <Skeleton className="h-screen w-full" />;
    }

    if (!user || user.email !== 'tt@iiits.in') {
        return (
            <Card className="max-w-2xl mx-auto"><CardHeader><CardTitle className="text-destructive">Access Denied</CardTitle></CardHeader><CardContent><p>This dashboard is restricted to the Academic Office Timetable Administrator (tt@iiits.in) only.</p></CardContent></Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Academic Office – Timetable Control Panel</CardTitle>
                    <CardDescription>Define, configure, and generate the university timetable.</CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="structure" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="policy">Phase 1: Policies</TabsTrigger>
                    <TabsTrigger value="structure">Phase 2: Structure</TabsTrigger>
                    <TabsTrigger value="faculty">Phase 3: Faculty</TabsTrigger>
                    <TabsTrigger value="enrollment" disabled>Phase 4: Enrollment</TabsTrigger>
                    <TabsTrigger value="generate" disabled>Phase 5: Generate</TabsTrigger>
                </TabsList>
                
                <TabsContent value="policy" className="mt-6">
                    {/* Policy content from previous step would go here */}
                     <Alert variant="default">
                        <Settings className="h-4 w-4" />
                        <AlertTitle>Phase 1: Policy Definition</AlertTitle>
                        <AlertDescription>
                            Define the high-level rules for each semester. This is a prerequisite for all other steps.
                        </AlertDescription>
                    </Alert>
                </TabsContent>
                
                <TabsContent value="structure" className="mt-6">
                     <Alert variant="default">
                        <Settings className="h-4 w-4" />
                        <AlertTitle>Phase 2: Academic Structure Definition</AlertTitle>
                        <AlertDescription>
                            Define the courses, sections, elective bins, and rooms for each undergraduate year. This data is the foundation for timetable generation.
                        </AlertDescription>
                    </Alert>
                     {/* Structure content from previous step would go here */}
                </TabsContent>
                
                 <TabsContent value="faculty" className="mt-6">
                     <div className="space-y-6">
                        <Alert>
                           <GraduationCap className="h-4 w-4" />
                           <AlertTitle>Phase 3: Faculty & Teaching Assignments</AlertTitle>
                           <AlertDescription>
                               First, create a master list of all faculty members. Then, assign a specific faculty member to each course section that will be taught this semester.
                           </AlertDescription>
                       </Alert>
                       <FacultyManager user={user} />
                       <AssignmentManager user={user} />
                     </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}
