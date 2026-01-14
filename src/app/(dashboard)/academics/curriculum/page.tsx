'use client';
import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const CurriculumForm = ({ course, onSave }: { course?: any; onSave: (data: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    branch: '',
    ugYear: '',
    courseAbbr: '',
    courseName: '',
    courseType: '',
    semester: '',
    credits: '',
    description: '',
  });

  useEffect(() => {
    if (course) {
      setFormData({
        branch: course.branch || '',
        ugYear: course.ugYear ? String(course.ugYear) : '',
        courseAbbr: course.courseAbbr || '',
        courseName: course.courseName || '',
        courseType: course.courseType || '',
        semester: course.semester || '',
        credits: course.credits ? String(course.credits) : '',
        description: course.description || '',
      });
    } else {
        setFormData({ branch: '', ugYear: '', courseAbbr: '', courseName: '', courseType: '', semester: '', credits: '', description: '' });
    }
  }, [course, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      ugYear: parseInt(formData.ugYear, 10),
      credits: parseInt(formData.credits, 10) || 0,
      id: course?.id,
    });
    setIsOpen(false);
  };
  
  const isFormValid = formData.branch && formData.ugYear && formData.courseAbbr && formData.courseName && formData.courseType;


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {course ? (
          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Course</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>{course ? 'Edit Course' : 'Add New Course'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch" className="text-right">Branch</Label>
                <Select value={formData.branch} onValueChange={(value) => handleSelectChange('branch', value)}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="CSE">CSE</SelectItem>
                        <SelectItem value="ECE">ECE</SelectItem>
                        <SelectItem value="AIDS">AIDS</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ugYear" className="text-right">UG Year</Label>
                <Select value={formData.ugYear} onValueChange={(value) => handleSelectChange('ugYear', value)}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Year" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">UG-1</SelectItem>
                        <SelectItem value="2">UG-2</SelectItem>
                        <SelectItem value="3">UG-3</SelectItem>
                        <SelectItem value="4">UG-4</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseAbbr" className="text-right">Course Code</Label>
            <Input id="courseAbbr" value={formData.courseAbbr} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseName" className="text-right">Course Name</Label>
            <Input id="courseName" value={formData.courseName} onChange={handleChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="courseType" className="text-right">Course Type</Label>
            <Select value={formData.courseType} onValueChange={(value) => handleSelectChange('courseType', value)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Institute Core">Institute Core</SelectItem>
                    <SelectItem value="Program Core">Program Core</SelectItem>
                    <SelectItem value="Program Elective">Program Elective</SelectItem>
                    <SelectItem value="SEED">SEED</SelectItem>
                </SelectContent>
            </Select>
           </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="semester" className="text-right">Semester</Label>
            <Input id="semester" value={formData.semester} onChange={handleChange} className="col-span-3" placeholder="e.g. Spring" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="credits" className="text-right">Credits</Label>
            <Input id="credits" type="number" value={formData.credits} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter><Button onClick={handleSubmit} disabled={!isFormValid}>Save changes</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function CurriculumManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [activeBranch, setActiveBranch] = useState('CSE');
  const [activeYear, setActiveYear] = useState('1');

  const curriculumQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'curriculums');
  }, [firestore]);

  const { data: curriculumData, isLoading } = useCollection(curriculumQuery);

  const handleSaveCourse = (courseData: any) => {
    if (!firestore) return;
    const courseId = courseData.id || doc(collection(firestore, 'temp')).id; // Generate ID if new
    const courseRef = doc(firestore, 'curriculums', courseId);
    
    const dataToSave = { ...courseData };
    if (!courseData.id) {
        delete dataToSave.id;
    }

    setDocumentNonBlocking(courseRef, dataToSave, { merge: true });
    toast({ title: 'Success', description: `Course ${courseData.id ? 'updated' : 'added'} successfully.` });
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?') && firestore) {
      const courseRef = doc(firestore, 'curriculums', courseId);
      deleteDocumentNonBlocking(courseRef);
      toast({ title: 'Success', description: 'Course deleted successfully.' });
    }
  };

  const filteredCurriculum = useMemo(() => {
    if (!curriculumData) return [];
    return curriculumData.filter(
      (course) => course.branch === activeBranch && course.ugYear === parseInt(activeYear, 10)
    );
  }, [curriculumData, activeBranch, activeYear]);

  const branches = ['CSE', 'ECE', 'AIDS'];
  const years = ['1', '2', '3', '4'];


  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
            <CardTitle>Curriculum Management</CardTitle>
            <CardDescription>Add, edit, or delete courses for each program.</CardDescription>
        </div>
        <CurriculumForm onSave={handleSaveCourse} />
      </CardHeader>
      <CardContent>
        <Tabs value={activeBranch} onValueChange={setActiveBranch} className="mb-4">
          <TabsList>
            {branches.map(branch => <TabsTrigger key={branch} value={branch}>{branch}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <Tabs value={activeYear} onValueChange={setActiveYear}>
          <TabsList className="grid w-full grid-cols-4">
             {years.map(year => <TabsTrigger key={year} value={year}>UG-{year}</TabsTrigger>)}
          </TabsList>
        </Tabs>

        <div className="mt-6">
            {isLoading ? <p>Loading curriculum...</p> : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredCurriculum.length === 0 && <TableRow><TableCell colSpan={6} className="text-center">No courses found.</TableCell></TableRow>}
                {filteredCurriculum.map((course) => (
                    <TableRow key={course.id}>
                    <TableCell>{course.courseAbbr}</TableCell>
                    <TableCell>{course.courseName}</TableCell>
                    <TableCell>{course.courseType}</TableCell>
                    <TableCell>{course.semester || 'N/A'}</TableCell>
                    <TableCell>{course.credits || 'N/A'}</TableCell>
                    <TableCell className='flex gap-2'>
                        <CurriculumForm course={course} onSave={handleSaveCourse} />
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
