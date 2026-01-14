'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
  } from "@/components/ui/card";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
  import { Button } from "@/components/ui/button";
  import { Textarea } from "@/components/ui/textarea";
  import { Input } from "@/components/ui/input";
  import { Badge } from "@/components/ui/badge";
  import {
    BotMessageSquare,
    FileUp,
    Github,
    BookOpen,
    GraduationCap,
    Clock,
    Search,
    Send,
    User,
    CheckCircle,
    XCircle,
    Users2,
  } from "lucide-react";
  import { dummyAnnouncements, dummyTimetable } from "@/lib/data";
  import Image from "next/image";
  import Link from "next/link";
  import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
  import { collection, query, where } from "firebase/firestore";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { cn } from "@/lib/utils";
  import { PlaceHolderImages } from "@/lib/placeholder-images";
  import { useMemo, useState } from "react";
  import { campusAssistant } from "@/ai/flows/campus-assistant";
  
  const parseEntry = (entry: string) => {
      const match = entry.match(/^([A-Z\d]+)-?([\w\d]+)?\s*(.*)$/);
      if(!match) return { courseAbbr: entry, section: 'Common', room: ''};
      const [, courseAbbr, section, room] = match;
      return { courseAbbr, section: section || 'Common', room: room.trim() };
  }

  type ChatMessage = {
    role: 'user' | 'ai';
    content: string;
  };
  
  export default function StudentDashboard() {
    const firestore = useFirestore();
    const { user } = useUser();

    const studentQuery = useMemoFirebase(() => {
        if (!firestore || !user?.email) return null;
        return query(collection(firestore, 'students'), where('email', '==', user.email));
    }, [firestore, user]);

    const {data: studentData, isLoading: studentLoading} = useCollection(studentQuery);
    const student = studentData?.[0];

    const studentSchedule = useMemo(() => {
        if(!student || !dummyTimetable) return [];
        
        const ugYearKey = `UG${student.ugYear}`;
        const yearTimetable = (dummyTimetable as any)[ugYearKey]?.timetable;
        if(!yearTimetable) return [];

        const enrolledCoursesSet = new Set(student.enrolledCourses.map((c: any) => {
            return c.section ? `${c.courseAbbr}-${c.section}` : c.courseAbbr;
        }));
        
        const scheduleByDay: { [key: string]: any[] } = {};

        Object.entries(yearTimetable).forEach(([day, slots]: [string, any]) => {
            scheduleByDay[day] = [];
            slots.forEach((slot: any) => {
                const todaysClasses = slot.entries.map(parseEntry).filter((entry: any) => {
                    const courseKeyWithSection = `${entry.courseAbbr}-${entry.section}`;
                    const courseKeyWithoutSection = entry.courseAbbr;
                    return enrolledCoursesSet.has(courseKeyWithSection) || enrolledCoursesSet.has(courseKeyWithoutSection);
                });
                
                if (todaysClasses.length > 0) {
                     scheduleByDay[day].push({
                        time: slot.time,
                        subject: todaysClasses[0].courseAbbr,
                        venue: todaysClasses[0].room
                    });
                }
            });
        });

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        return scheduleByDay[today] || [];

    }, [student]);

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Welcome back, {studentLoading ? '...' : student?.name || 'Student'}!</CardTitle>
            <CardDescription>
              Ready to conquer the day? Your personalized dashboard is all set.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Student Profile
                </CardTitle>
                <CardDescription>Your academic information at a glance.</CardDescription>
            </CardHeader>
            <CardContent>
                {studentLoading ? <p>Loading profile...</p> : student ? (
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{student.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Student ID:</span>
                            <span className="font-medium">{student.studentId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Branch:</span>
                            <span className="font-medium">{student.branch}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Year:</span>
                            <span className="font-medium">UG-{student.ugYear}</span>
                        </div>
                    </div>
                ) : <p>Could not load student profile.</p>}
            </CardContent>
        </Card>
  
        <Card className="lg:col-span-2" id="schedule">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Here’s what your day looks like. Stay on track!</CardDescription>
          </CardHeader>
          <CardContent>
            {studentLoading ? <p>Loading schedule...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Venue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentSchedule.length > 0 ? studentSchedule.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>{item.venue}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No classes scheduled for today.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4" id="schedule-planner">
          <CardHeader>
            <CardTitle>AI Schedule Planner</CardTitle>
            <CardDescription>
              Let our AI organize your academic life.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="day">
              <TabsList>
                <TabsTrigger value="day">Day Plan</TabsTrigger>
                <TabsTrigger value="month">Month Plan</TabsTrigger>
                <TabsTrigger value="semester">Semester Plan</TabsTrigger>
                <TabsTrigger value="year">Year Plan</TabsTrigger>
              </TabsList>
              <TabsContent value="day" className="mt-4 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm">AI-generated daily schedule will appear here, optimized for your classes and study goals.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
  
        <Card className="lg:col-span-4" id="feed">
          <CardHeader>
            <CardTitle>Campus Intelligence Feed</CardTitle>
            <CardDescription>The latest buzz around campus. Don't miss out!</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel opts={{ align: "start", loop: true, }}>
              <CarouselContent>
                {dummyAnnouncements.map((ann, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <Card>
                      <CardHeader className="p-0">
                        <Image
                          src={ann.image.imageUrl}
                          alt={ann.image.description}
                          width={600}
                          height={400}
                          className="rounded-t-lg object-cover aspect-video"
                          data-ai-hint={ann.image.imageHint}
                        />
                      </CardHeader>
                      <CardContent className="p-4">
                        <Badge variant="secondary" className="mb-2">{ann.category}</Badge>
                        <h3 className="font-semibold">{ann.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{ann.date}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-12" />
              <CarouselNext className="mr-12"/>
            </Carousel>
          </CardContent>
        </Card>
  
        <Card className="lg:col-span-2" id="resources">
          <CardHeader>
            <CardTitle>Resource Hub</CardTitle>
            <CardDescription>Your academic browser. Find anything you need.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search syllabus, topics, resources..." className="pl-8"/>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <Link href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"><Github className="h-5 w-5" /> GitHub Repos</Link>
                <Link href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"><BookOpen className="h-5 w-5" /> LMS</Link>
                <Link href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"><FileUp className="h-5 w-5" /> Academic Docs</Link>
                <Link href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"><GraduationCap className="h-5 w-5" /> Placements Portal</Link>
            </div>
          </CardContent>
        </Card>
  
        <Card className="lg:col-span-2" id="documents">
          <CardHeader>
            <CardTitle>Document Submission</CardTitle>
            <CardDescription>Submit medical leave, fee receipts, and other forms.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
             <Link href="/student/medical-leave">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 cursor-pointer hover:bg-muted/50">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">Submit a Medical Leave Request</p>
                </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" id="availability">
          <CardHeader>
            <CardTitle>Staff & Doctor Availability</CardTitle>
            <CardDescription>Check who's available before you visit.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
             <Link href="/student/availability/faculty">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 cursor-pointer hover:bg-muted/50">
                <Users2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">Check Staff Availability</p>
                </div>
            </Link>
          </CardContent>
        </Card>
  
        <Card className="lg:col-span-2" id="doubt-clearing">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BotMessageSquare /> Gemini AI Assistant</CardTitle>
            <CardDescription>Have a doubt? Ask our AI assistant for help.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              <p>Your AI Assistant is now available globally!</p>
              <p className="text-sm">Click the chat bubble at the bottom-right to start.</p>
            </div>
          </CardContent>
        </Card>
  
      </div>
    );
  }
