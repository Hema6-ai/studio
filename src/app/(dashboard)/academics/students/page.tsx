'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// --- Reusable Student Form ---
const StudentForm = ({ student, onSave, branch, ugYear }: { student?: any, onSave: (data: any) => void, branch: string, ugYear: string }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        id: student?.id || undefined,
        name: student?.name || '',
        email: student?.email || '',
        studentId: student?.studentId || student?.id || '',
        enrolledCoursesText: student?.enrolledCourses 
            ? student.enrolledCourses.map((c: any) => typeof c === 'string' ? c : (c.section ? `${c.courseAbbr}-${c.section}` : c.courseAbbr)).join('\n')
            : ''
    });
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        const courseLines = formData.enrolledCoursesText.split('\n').filter(line => line.trim() !== '');
        const enrolledCourses = courseLines.map(line => ({
            courseAbbr: line.trim().toUpperCase(),
            section: 'Common' // Section is no longer parsed from student input
        }));

        const studentData = {
            id: formData.studentId,
            studentId: formData.studentId,
            name: formData.name,
            email: formData.email,
            branch,
            ugYear: parseInt(ugYear, 10),
            enrolledCourses,
        };
        
        onSave(studentData);
        setIsOpen(false);
        if (!student) {
             setFormData({ id: undefined, name: '', email: '', studentId: '', enrolledCoursesText: '' });
        }
    };

    const isFormValid = formData.name && formData.email && formData.studentId;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {student ? (
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                ) : (
                    <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add Student</Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="studentId" className="text-right">Student ID</Label>
                        <Input id="studentId" value={formData.studentId} onChange={handleChange} className="col-span-3" required />
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="enrolledCoursesText" className="text-right pt-2">Enrolled Classes</Label>
                        <div className="col-span-3">
                            <Textarea 
                                id="enrolledCoursesText" 
                                value={formData.enrolledCoursesText} 
                                onChange={handleChange} 
                                className="col-span-3"
                                placeholder="Enter course abbreviations only (one per line). Example: MS, DSY, WBD"
                                rows={5}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Enter course abbreviations only, one per line. Example: MS, DSY, WBD</p>
                         </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!isFormValid}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function StudentManagementPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const studentsQuery = useMemoFirebase(() => {
        if(!firestore) return null;
        return collection(firestore, 'students');
    }, [firestore]);

    const {data: students, isLoading: loadingStudents } = useCollection(studentsQuery);

    const handleSaveStudent = (studentData: any) => {
        if(!firestore) return;
        const studentRef = doc(firestore, 'students', studentData.id);
        const dataToSave = {
            ...studentData,
            createdBy: "academic_office",
            createdAt: serverTimestamp(),
        };
        delete dataToSave.id;

        setDocumentNonBlocking(studentRef, dataToSave, { merge: true });
        toast({ title: "Success", description: `Student ${studentData.id ? 'updated' : 'added'} successfully.` });
    };
    
    const handleDeleteStudent = (studentId: string) => {
        if(window.confirm("Are you sure you want to delete this student?") && firestore) {
            const studentRef = doc(firestore, 'students', studentId);
            deleteDocumentNonBlocking(studentRef);
            toast({ title: "Success", description: "Student deleted successfully." });
        }
    };

    const studentsByGroup = useMemo(() => {
        const groups: { [key: string]: any[] } = {};
        students?.forEach(student => {
            const key = `${student.branch}-UG${student.ugYear}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(student);
        });
        return groups;
    }, [students]);

    const branches = ['CSE', 'ECE', 'AIDS'];
    const years = ['1', '2', '3', '4'];

    return (
        <Card>
           <CardHeader>
               <CardTitle>Student Management</CardTitle>
               <CardDescription>Add, edit, and view student records by branch and year.</CardDescription>
           </CardHeader>
           <CardContent>
               {branches.map(branch => (
                   <div key={branch} className="mb-8">
                       <h3 className="text-xl font-semibold mb-4 border-b pb-2">{branch}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {years.map(year => {
                               const groupKey = `${branch}-UG${year}`;
                               const groupStudents = studentsByGroup[groupKey] || [];
                               return (
                                   <Card key={groupKey}>
                                       <CardHeader className="flex flex-row items-center justify-between">
                                           <CardTitle className="text-lg">UG {year}</CardTitle>
                                           <StudentForm onSave={handleSaveStudent} branch={branch} ugYear={year} />
                                       </CardHeader>
                                       <CardContent>
                                           {loadingStudents ? <p>Loading...</p> : (
                                           <Table>
                                               <TableHeader>
                                                   <TableRow>
                                                       <TableHead>Name</TableHead>
                                                       <TableHead>Student ID</TableHead>
                                                       <TableHead>Actions</TableHead>
                                                   </TableRow>
                                               </TableHeader>
                                               <TableBody>
                                                   {groupStudents.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No students found.</TableCell></TableRow>}
                                                   {groupStudents.map(student => (
                                                       <TableRow key={student.id}>
                                                           <TableCell>{student.name}</TableCell>
                                                           <TableCell>{student.studentId}</TableCell>
                                                           <TableCell className="flex gap-2">
                                                               <StudentForm student={student} onSave={handleSaveStudent} branch={branch} ugYear={year} />
                                                               <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                                           </TableCell>
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
               ))}
           </CardContent>
        </Card>
    );
}
