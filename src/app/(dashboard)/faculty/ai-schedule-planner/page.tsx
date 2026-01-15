'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TimetableDisplay } from '@/components/dashboard/timetable-display';
import { useUser } from '@/firebase';
import { dummyTimetable, dummyFaculty } from '@/lib/data';
import { generateSchedulePlan, type SchedulePlanInput, type SchedulePlanOutput } from '@/ai/flows/ai-schedule-planner';
import { AlertCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const normalizeName = (name: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/dr\.?|mrs\.?|mr\.?/g, '')
      .replace(/\s+/g, '')
      .trim();
};

const parseEntry = (entry: string) => {
    const match = entry.match(/^([A-Z\d]+)-?([\w\d]+)?\s*(.*)$/);
    if (!match) return { courseAbbr: entry, section: 'Common', room: '' };
    const [, courseAbbr, section, room] = match;
    return { courseAbbr, section: section || 'Common', room: room.trim() };
};


// --- AI Mode Component for Faculty ---
const AiPersonalPlanner = ({ instituteSchedule, facultyId }: { instituteSchedule: any, facultyId: string }) => {
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
                studentId: facultyId, // Using facultyId as the identifier
                instituteTimetable: JSON.stringify(instituteSchedule),
                personalTasks: validTasks.map(t => ({...t, duration: Number(t.duration)}))
            };
            const result = await generateSchedulePlan(input);
            setAiSchedule(result);
            toast({ title: 'Plan Generated!', description: 'Your personalized schedule has been created.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate the schedule plan. Please try again.' });
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
                    <CardDescription>Add meetings, research blocks, or personal tasks to schedule.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {tasks.map((task, index) => (
                        <div key={index} className="flex gap-2 items-end p-2 border rounded-lg">
                            <div className="grid gap-1.5 flex-grow">
                                <Label htmlFor={`task-name-${index}`}>Task Name</Label>
                                <Input id={`task-name-${index}`} placeholder="e.g., Research Paper" value={task.name} onChange={(e) => handleTaskChange(index, 'name', e.target.value)} />
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
                        <CardDescription>Here is your week, combining teaching duties with your personal tasks.</CardDescription>
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

// --- Main Page for Faculty Planner ---
export default function FacultyAiSchedulePlannerPage() {
    const { user } = useUser();

     const facultyNameFromEmail = useMemo(() => {
        if (!user?.email) return '';
        return normalizeName(user.email.split('@')[0]);
    }, [user?.email]);

    const facultyDetails = useMemo(() => {
        if (!facultyNameFromEmail) return [];
        return dummyFaculty.filter(f => normalizeName(f.name) === facultyNameFromEmail);
    }, [facultyNameFromEmail]);


    const instituteSchedule = useMemo(() => {
        if (facultyDetails.length === 0 || !dummyTimetable) return null;

        const scheduleByDay: { [key: string]: any[] } = {};

        facultyDetails.forEach(facultyCourse => {
            const ugKeys = facultyCourse.ugYear.map(year => `UG${year}`);

            ugKeys.forEach(ugKey => {
                const yearTimetable = (dummyTimetable as any)[ugKey]?.timetable;
                if (!yearTimetable) return;

                Object.entries(yearTimetable).forEach(([day, slots]: [string, any]) => {
                     if (!scheduleByDay[day]) scheduleByDay[day] = [];

                    slots.forEach((slot: any) => {
                        slot.entries.forEach((entryStr: string) => {
                            const entry = parseEntry(entryStr);
                             const courseSection = facultyCourse.section === 'Common' ? entry.section : facultyCourse.section;

                            if (entry.courseAbbr === facultyCourse.courseAbbr && (entry.section === courseSection || facultyCourse.section === 'Common')) {
                                scheduleByDay[day].push({
                                    taskName: `${entry.courseAbbr} (${entry.room})`,
                                    time: slot.time,
                                    isClass: true
                                });
                            }
                        });
                    });
                });
            });
        });
        
        // De-duplicate entries
        Object.keys(scheduleByDay).forEach(day => {
            scheduleByDay[day] = scheduleByDay[day].filter((item, index, self) =>
                index === self.findIndex((t) => (t.time === item.time && t.taskName === item.taskName))
            );
             scheduleByDay[day].sort((a,b) => a.time.localeCompare(b.time));
        });

        return scheduleByDay;
    }, [facultyDetails]);
    

    if(!user) return <p>Loading user data...</p>

    if(facultyDetails.length === 0) return <p>Could not find your faculty profile. Please contact the Academic Office.</p>

    if(!instituteSchedule) return <p>Could not load institute timetable for your assigned courses.</p>

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI Schedule Planner</CardTitle>
                    <CardDescription>View your official teaching schedule and use AI to plan your personal time around it.</CardDescription>
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
                            <CardTitle>Your Official Weekly Teaching Timetable</CardTitle>
                            <CardDescription>This is your fixed schedule based on your assigned courses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <TimetableDisplay timetableData={instituteSchedule} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="ai-planner" className="mt-6">
                    <AiPersonalPlanner instituteSchedule={instituteSchedule} facultyId={user.uid} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
