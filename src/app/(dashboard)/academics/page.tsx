'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { dummyCourses, dummyFaculty, dummyTimetable } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { TimetableDisplay } from '@/components/dashboard/timetable-display';


// --- Reusable Student Form ---
const StudentForm = ({ student, onSave, branch, ugYear }: { student?: any, onSave: (data: any) => void, branch: string, ugYear: string }) => {
    const [formData, setFormData] = useState({
        id: student?.id || undefined,
        name: student?.name || '',
        email: student?.email || '',
        studentId: student?.studentId || '',
        studentNumber: student?.studentNumber || '',
        enrolledCourses: student?.enrolledCourses || []
    });
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleCourseToggle = (courseId: string) => {
        setFormData(prev => {
            const newCourses = prev.enrolledCourses.includes(courseId)
                ? prev.enrolledCourses.filter((id: string) => id !== courseId)
                : [...prev.enrolledCourses, courseId];
            return { ...prev, enrolledCourses: newCourses };
        });
    };

    const handleSubmit = () => {
        onSave({ ...formData, branch, ugYear });
        setIsOpen(false);
        if (!student) {
             setFormData({ id: undefined, name: '', email: '', studentId: '', studentNumber: '', enrolledCourses: [] });
        }
    };

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
                        <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="studentId" className="text-right">Student ID</Label>
                        <Input id="studentId" value={formData.studentId} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="studentNumber" className="text-right">Student No.</Label>
                        <Input id="studentNumber" value={formData.studentNumber} onChange={handleChange} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Courses</Label>
                        <div className="col-span-3 grid grid-cols-2 gap-2">
                           {dummyCourses.map(course => (
                                <div key={course.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`course-${course.id}`}
                                        checked={formData.enrolledCourses.includes(course.id)}
                                        onCheckedChange={() => handleCourseToggle(course.id)}
                                    />
                                    <label htmlFor={`course-${course.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                       {course.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


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


// --- Main Dashboard Component ---
export default function AcademicsDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- States for Medical Records ---
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // --- Data from dummy file ---
  const [students, setStudents] = useState<any[]>([]); // This would be fetched
  const [faculty, setFaculty] = useState(dummyFaculty);
  const approvedRequests: any[] = []; // This would be fetched
  const rejectedRequests: any[] = []; // This would be fetched
  const loadingApproved = false;
  const loadingRejected = false;
  const loadingStudents = false;
  const loadingFaculty = false;


  // --- Student Management Logic ---
  const handleSaveStudent = (studentData: any) => {
    // This is a placeholder for actual save logic
    toast({ title: "Success", description: `Student ${studentData.id ? 'updated' : 'added'} successfully.` });
  };
  
  const handleDeleteStudent = (studentId: string) => {
    if(window.confirm("Are you sure you want to delete this student?")) {
        // This is a placeholder for actual delete logic
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

  // --- Faculty Management Logic ---
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

  // --- Filtering for Medical Records ---
  const filterRequests = (requests: any[]) => {
    if (!requests) return [];
    return requests.filter(req => {
      const matchesSearch = searchTerm === '' ||
        req.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.ugNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || format(new Date(req.dateRequested), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');
      return matchesSearch && matchesDate;
    });
  };

  const filteredApprovedRequests = useMemo(() => filterRequests(approvedRequests as any[]), [approvedRequests, searchTerm, dateFilter]);
  const filteredRejectedRequests = useMemo(() => filterRequests(rejectedRequests as any[]), [rejectedRequests, searchTerm, dateFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter(undefined);
  };
  
  const branches = ['CSE', 'ECE', 'AIDS'];
  const years = ['1', '2', '3', '4'];


  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="dashboard" className="w-full">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Academic Office Dashboard</h1>
                <p className="text-muted-foreground">Central hub for all academic operations.</p>
            </div>
            <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
                <TabsTrigger value="timetables">Timetables</TabsTrigger>
                <TabsTrigger value="medical-records">Medical Records</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="dashboard">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Academic Office</CardTitle>
                    <CardDescription>Select a tab to manage students, faculty, timetables, or view medical records.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Total Students: {loadingStudents ? '...' : students?.length ?? 0}</p>
                                <p>Total Faculty: {loadingFaculty ? '...' : faculty?.length ?? 0}</p>
                                <p>Pending Approvals: 0</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">No recent activity.</p>
                            </CardContent>
                        </Card>
                   </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="students" id="students">
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
        </TabsContent>

        <TabsContent value="faculty" id="faculty">
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
        </TabsContent>

        <TabsContent value="timetables" id="timetables">
             <Card>
                <CardHeader>
                    <CardTitle>Timetable Management</CardTitle>
                    <CardDescription>View and manage class timetables.</CardDescription>
                </CardHeader>
                <CardContent>
                   <TimetableDisplay timetableData={dummyTimetable} />
                </CardContent>
             </Card>
        </TabsContent>

        <TabsContent value="medical-records" id="medical-records">
             <Card>
                <CardHeader>
                    <CardTitle>Finalized Medical Leave Records</CardTitle>
                    <CardDescription>View and filter all finalized medical leave requests.</CardDescription>
                     <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <Input
                            placeholder="Search by Student Name or UG Number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !dateFilter && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFilter ? format(dateFilter, "PPP") : <span>Filter by date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={dateFilter}
                                onSelect={setDateFilter}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={clearFilters} variant="ghost">Clear Filters</Button>
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                        <CardTitle className="text-green-600">Approved Medical Leaves</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>UG Number</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {loadingApproved && <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>}
                            {filteredApprovedRequests.map((req: any) => (
                                <TableRow key={req.id}>
                                <TableCell>{req.studentName}</TableCell>
                                <TableCell>{req.ugNumber}</TableCell>
                                <TableCell>{new Date(req.dateRequested).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                        <CardTitle className="text-red-600">Rejected Medical Leaves</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>UG Number</TableHead>
                                <TableHead>Reason</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {loadingRejected && <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>}
                            {filteredRejectedRequests.map((req: any) => (
                                <TableRow key={req.id}>
                                <TableCell>{req.studentName}</TableCell>
                                <TableCell>{req.ugNumber}</TableCell>
                                <TableCell>{req.rejectionReason}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
