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
  } from "lucide-react";
  import { dummySchedule, dummyAnnouncements } from "@/lib/data";
  import Image from "next/image";
  import Link from "next/link";
  import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
  import { collection } from "firebase/firestore";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { cn } from "@/lib/utils";
  import { PlaceHolderImages } from "@/lib/placeholder-images";
  
  const availabilityColors: Record<string, string> = {
      available: 'ring-green-500',
      'not-available': 'ring-red-500',
      'nurse-available': 'ring-orange-500',
      'on-leave': 'ring-yellow-500',
  }
  
  export default function StudentDashboard() {
    const firestore = useFirestore();
    const avatarImage = PlaceHolderImages.find(img => img.id === 'avatar-1');

    const staffAvailabilityQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'doctorAvailability');
    }, [firestore]);

    const { data: staffAvailability, isLoading } = useCollection(staffAvailabilityQuery);

    const getAvailabilityStatus = (s: any) => {
        if (!s) return { text: "Unknown", variant: "secondary", className: "" };
        switch (s.availabilityStatus) {
            case "available":
                return { text: "Available", variant: "default", className: "bg-green-600" };
            case "not-available":
                return { text: "Unavailable", variant: "destructive" };
            case "nurse-available":
                 return { text: "Nurse Available", variant: "secondary", className: "bg-orange-500" };
            case "on-leave":
                return { text: "On Leave", variant: "secondary", className: "bg-yellow-500 text-black" };
            default:
                return { text: "Unknown", variant: "secondary" };
        }
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Welcome back, Hema!</CardTitle>
            <CardDescription>
              Ready to conquer the day? Your personalized dashboard is all set.
            </CardDescription>
          </CardHeader>
        </Card>
  
        <Card className="lg:col-span-2" id="schedule">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Here’s what your day looks like. Stay on track!</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Venue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummySchedule.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>{item.venue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" id="burnout">
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5"/>
                Burnout Detection
              </CardTitle>
              <CardDescription>Continuous study for 4 hours detected. Remember to take a break!</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="p-6 bg-accent/20 rounded-lg text-center">
                  <p className="font-medium">"The mind is a garden; it needs its seasons of rest."</p>
                  <Button variant="link" className="mt-2">Stretch your legs</Button>
              </div>
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
          <CardContent>
             <ul className="space-y-3">
                {isLoading && <li>Loading availability...</li>}
                {staffAvailability?.map(staff => {
                    const status = getAvailabilityStatus(staff);
                    const availability = staff?.availabilityStatus || 'not-available';
                    return (
                        <li key={staff.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <Avatar className={cn("h-10 w-10", `ring-2 ring-offset-2 ring-offset-background ${availabilityColors[availability]}`)}>
                                    {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt="User avatar" data-ai-hint={avatarImage.imageHint} />}
                                    <AvatarFallback>{staff.doctorName?.charAt(0).toUpperCase() || 'D'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{staff.doctorName || `Dr. ${staff.id.slice(0,5)}`}</p>
                                    <p className="text-xs text-muted-foreground">Campus Doctor</p>
                                </div>
                            </div>
                            <Badge variant={status.variant} className={cn('text-xs', status.className)}>
                                {status.text}
                            </Badge>
                        </li>
                    )
                })}
             </ul>
          </CardContent>
        </Card>
  
        <Card className="lg:col-span-2" id="doubt-clearing">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BotMessageSquare /> Gemini AI Assistant</CardTitle>
            <CardDescription>Have a doubt? Ask our AI assistant for help.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 overflow-y-auto p-4 border rounded-lg bg-muted/50 mb-4">
              <p className="text-sm text-muted-foreground">AI: Hello Hema! How can I help you with your studies today?</p>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center space-x-2">
              <Textarea placeholder="Type your question here..." className="min-h-0"/>
              <Button type="submit" size="icon"><Send className="h-4 w-4"/></Button>
            </div>
          </CardFooter>
        </Card>
  
      </div>
    );
  }
  