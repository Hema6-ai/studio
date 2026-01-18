
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { TimetableDisplay } from '@/components/dashboard/timetable-display';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { dummyTimetable } from '@/lib/data';
import { generateSchedulePlan, type SchedulePlanInput, type SchedulePlanOutput } from '@/ai/flows/ai-schedule-planner';
import { AlertCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const parseEntry = (entry: string) => {
    const match = entry.match(/^([A-Z\d]+)-?([\w\d]+)?\s*(.*)$/);
    if (!match) return { courseAbbr: entry, section: 'Common', room: '' };
    const [, courseAbbr, section, room] = match;
    return { courseAbbrWithSection: section ? `${courseAbbr}-${section}` : courseAbbr, courseAbbr: courseAbbr, section: section || 'Common', room: room.trim() };
}

// --- AI Mode Component ---
const AiPersonalPlanner = ({ instituteSchedule, studentId }: { instituteSchedule: any, studentId: string }) => {
    const { toast } = useToast();
    const [tasks, setTasks] = useState([{ name: '', duration: 1, priority: 'Medium' }]);
    const [aiSchedule, setAiSchedule] = useState<SchedulePlanOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleTaskChange = (index: number, field: string, value: string | number) => {
        const newTasks = [...tasks];
        (newTasks[index] as any)[field] = value;
        setTasks(newTasks);
    };

    const addTask = () => {
        setTasks([...tasks, { name: '', duration: 1, priority: 'Medium' }]);
    };

    const removeTask = (index: number) => {
        const newTasks = tasks.filter((_, i) => i !== index);
        setTasks(newTasks);
    };

    const handleGeneratePlan = async () => {
        const validTasks = tasks.filter(t => t.name.trim() !== '' && t.duration > 0);
        if (validTasks.length === 0) {
            toast({ variant: 'destructive', title: 'No Tasks', description: 'Please add at least one task to generate a plan.' });
            return;
        }

        setIsLoading(true);
        setAiSchedule(null);
        try {
            const input: SchedulePlanInput = {
                studentId,
                instituteTimetable: JSON.stringify(instituteSchedule),
                personalTasks: validTasks.map(t => ({...t, duration: Number(t.duration)}))
            };
            const result = await generateSchedulePlan(input);
            setAiSchedule(result);

            if (result.reasoning.includes("[Fallback Scheduler Used]")) {
                toast({ title: 'Plan Generated', description: 'Used fallback scheduler as AI was busy.' });
            } else {
                toast({ title: 'Plan Generated!', description: 'Your personalized schedule has been created by Gemini.' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'default', title: 'Request Failed', description: 'Could not connect to the scheduling service. Please check your connection and try again.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const isGenerateDisabled = tasks.every(t => t.name.trim() === '') || isLoading;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Your Personal Tasks</CardTitle>
                    <CardDescription>Add study goals, assignments, or personal tasks you want to schedule.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {tasks.map((task, index) => (
                        <div key={index} className="flex gap-2 items-end p-2 border rounded-lg">
                            <div className="grid gap-1.5 flex-grow">
                                <Label htmlFor={`task-name-${index}`}>Task Name</Label>
                                <Input id={`task-name-${index}`} placeholder="e.g., Revise DSA" value={task.name} onChange={(e) => handleTaskChange(index, 'name', e.target.value)} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor={`task-duration-${index}`}>Hours</Label>
                                <Input id={`task-duration-${index}`} type="number" min="1" max="8" className="w-16" value={task.duration} onChange={(e) => handleTaskChange(index, 'duration', e.target.value)} />
                            </div>
                             <div className="grid gap-1.5">
                                <Label htmlFor={`task-priority-${index}`}>Priority</Label>
                                <Select value={task.priority} onValueChange={(value) => handleTaskChange(index, 'priority', value)}>
                                    <SelectTrigger className="w-[110px]">
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Low">Low</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeTask(index)} disabled={tasks.length === 1}>
                                <Trash2 className="h-4 w-4 text-red-500"/>
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addTask}><PlusCircle className="mr-2"/>Add Task</Button>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGeneratePlan} disabled={isGenerateDisabled} className="w-full">
                        {isLoading ? 'Generating Plan...' : 'Generate AI Schedule'}
                    </Button>
                </CardFooter>
            </Card>

            <div className="lg:col-span-2 space-y-6">
                 {aiSchedule?.reasoning && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>AI Scheduling Analysis</AlertTitle>
                        <AlertDescription className="whitespace-pre-wrap">
                            {aiSchedule.reasoning}
                        </AlertDescription>
                    </Alert>
                 )}
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Personalized AI Schedule</CardTitle>
                        <CardDescription>Here is your week, combining institute classes with your personal tasks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {aiSchedule?.schedule ? (
                            <TimetableDisplay timetableData={aiSchedule.schedule} />
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>{isLoading ? 'AI is planning your week...' : 'Your generated schedule will appear here.'}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// --- Main Page ---
export default function AiSchedulePlannerPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const studentQuery = useMemoFirebase(() => {
        if (!firestore || !user?.email) return null;
        return query(collection(firestore, 'students'), where('email', '==', user.email));
    }, [firestore, user]);

    const { data: studentData, isLoading: studentLoading } = useCollection(studentQuery);
    const student = studentData?.[0];

    const instituteSchedule = useMemo(() => {
        if (!student || !dummyTimetable) return null;
        const ugYearKey = `UG${student.ugYear}`;
        const yearTimetable = (dummyTimetable as any)[ugYearKey]?.timetable;
        if (!yearTimetable) return null;

        const enrolledCoursesSet = new Set(student.enrolledCourses.map((c: any) => c.section !== 'Common' ? `${c.courseAbbr}-${c.section}` : c.courseAbbr));
        
        const scheduleByDay: { [key: string]: any[] } = {};

        Object.keys(yearTimetable).forEach((day) => {
            scheduleByDay[day] = [];
            const daySchedule = yearTimetable[day];
            daySchedule.forEach((slot: any) => {
                 const classEntries = slot.entries.map(parseEntry).filter((entry: any) => {
                    const isEnrolled = enrolledCoursesSet.has(entry.courseAbbrWithSection) || enrolledCoursesSet.has(entry.courseAbbr);
                    return isEnrolled && entry.courseAbbr !== 'BREAK' && entry.courseAbbr !== 'LUNCH';
                });
                
                if (classEntries.length > 0) {
                     scheduleByDay[day].push({
                        taskName: `${classEntries[0].courseAbbr} (${classEntries[0].room})`,
                        time: slot.time,
                        isClass: true
                    });
                }
            });
        });
        return scheduleByDay;
    }, [student]);

    if(studentLoading) return <p>Loading your schedule data...</p>

    if(!student) return <p>Could not find student profile. Please ensure your profile is set up by the Academic Office.</p>

    if(!instituteSchedule) return <p>Could not load institute timetable for your year/branch.</p>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Schedule Planner</CardTitle>
                    <CardDescription>View your official schedule and use AI to plan your personal study time around it.</CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="institute-schedule">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="institute-schedule">Institute Schedule (Read-Only)</TabsTrigger>
                    <TabsTrigger value="ai-planner">AI Personal Planner</TabsTrigger>
                </TabsList>
                <TabsContent value="institute-schedule" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Official Weekly Timetable</CardTitle>
                            <CardDescription>This is your fixed schedule based on your enrolled courses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <TimetableDisplay timetableData={instituteSchedule} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="ai-planner" className="mt-6">
                    <AiPersonalPlanner instituteSchedule={instituteSchedule} studentId={student.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
