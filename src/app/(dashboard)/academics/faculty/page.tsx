'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { dummyFaculty } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

// --- Reusable Faculty Form ---
const FacultyForm = ({ faculty, onSave, ugYear }: { faculty?: any, onSave: (data: any) => void, ugYear: string }) => {
    const [formData, setFormData] = useState({
        id: faculty?.id || undefined,
        name: faculty?.name || '',
        email: faculty?.email || '',
        courseAbbr: faculty?.courseAbbr || '',
        courseName: faculty?.courseName || '',
        branch: faculty?.branch || '',
        section: faculty?.section || ''
    });
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        onSave({ ...formData, ugYear: [ugYear.replace('UG','')] });
        setIsOpen(false);
        if (!faculty) {
             setFormData({ id: undefined, name: '', email: '', courseAbbr: '', courseName: '', branch: '', section: '' });
        }
    };
    
    const isFormValid = formData.name && formData.email && formData.courseAbbr && formData.courseName && formData.branch && formData.section;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {faculty ? (
                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                ) : (
                    <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add Faculty</Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{faculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" required/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="courseAbbr" className="text-right">Course Abbr</Label>
                        <Input id="courseAbbr" value={formData.courseAbbr} onChange={handleChange} className="col-span-3" placeholder="e.g. DSA, CA" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="courseName" className="text-right">Course Name</Label>
                        <Input id="courseName" value={formData.courseName} onChange={handleChange} className="col-span-3" placeholder="e.g. Data Structures" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="branch" className="text-right">Branch</Label>
                        <Input id="branch" value={formData.branch} onChange={handleChange} className="col-span-3" placeholder="e.g. CSE,ECE,AIDS" required/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="section" className="text-right">Section</Label>
                        <Input id="section" value={formData.section} onChange={handleChange} className="col-span-3" placeholder="e.g. 1, 2, Common" required/>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!isFormValid}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function FacultyManagementPage() {
    const { toast } = useToast();
    const [faculty, setFaculty] = useState(dummyFaculty);
    const loadingFaculty = false;

    const handleSaveFaculty = (facultyData: any) => {
        const newFaculty = { ...facultyData, id: facultyData.id || `faculty-${Date.now()}` };
        if (facultyData.id) {
            setFaculty(faculty.map(f => f.id === facultyData.id ? newFaculty : f));
        } else {
            setFaculty([...faculty, newFaculty]);
        }
        toast({ title: "Success", description: `Faculty ${facultyData.id ? 'updated' : 'added'} successfully.` });
    };

    const handleDeleteFaculty = (facultyId: string) => {
        if (window.confirm("Are you sure you want to delete this faculty member?")) {
            setFaculty(faculty.filter(f => f.id !== facultyId));
            toast({ title: "Success", description: "Faculty member deleted successfully." });
        }
    };

    const facultyByYear = useMemo(() => {
        const groups: { [key: string]: any[] } = {};
        faculty?.forEach(f => {
            const years = f.ugYear; 
            if (Array.isArray(years)) {
                years.forEach((year: string) => {
                    const key = `UG${year}`;
                    if (!groups[key]) groups[key] = [];
                    if (!groups[key].find(existing => existing.id === f.id)) {
                        groups[key].push(f);
                    }
                });
            }
        });
        return groups;
    }, [faculty]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Faculty Management</CardTitle>
                <CardDescription>View and manage faculty assignments by year.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['UG1', 'UG2', 'UG3', 'UG4'].map(year => {
                        const groupKey = year;
                        const groupFaculty = facultyByYear[groupKey] || [];
                        return (
                            <Card key={groupKey}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">{groupKey}</CardTitle>
                                    <FacultyForm onSave={handleSaveFaculty} ugYear={groupKey} />
                                </CardHeader>
                                <CardContent>
                                    {loadingFaculty ? <p>Loading...</p> : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupFaculty.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No faculty found.</TableCell></TableRow>}
                                            {groupFaculty.map((f:any) => (
                                                <TableRow key={f.id}>
                                                    <TableCell>{f.name}</TableCell>
                                                    <TableCell>{f.email}</TableCell>
                                                    <TableCell>{f.courseName} ({f.courseAbbr})</TableCell>
                                                    <TableCell className="flex gap-2">
                                                        <FacultyForm faculty={f} onSave={handleSaveFaculty} ugYear={groupKey} />
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteFaculty(f.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
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
            </CardContent>
        </Card>
    )
}
