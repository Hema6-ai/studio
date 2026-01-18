'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PlusCircle, Edit, Trash2, CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const eventSchema = z.object({
  title: z.string().min(3, "Title is required."),
  organizer: z.string().min(2, "Organizer is required."),
  description: z.string().min(10, "Description is required."),
  eventDate: z.date({ required_error: "Event date is required."}),
  venue: z.string().min(2, "Venue is required."),
  eventType: z.string({ required_error: "Event type is required."}),
  registrationLink: z.string().url().optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventSchema>;

const EventForm = ({ event, onSave }: { event?: any; onSave: (data: any, file?: File) => void }) => {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      ...event,
      eventDate: new Date(event.eventDate),
    } : {
      title: '',
      organizer: '',
      description: '',
      venue: '',
      registrationLink: '',
    },
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [posterImage, setPosterImage] = useState<File | null>(null);

  const onSubmit: SubmitHandler<EventFormValues> = (data) => {
    onSave({ id: event?.id, createdAt: event?.createdAt, posterImageUrl: event?.posterImageUrl, ...data }, posterImage || undefined);
    setIsOpen(false);
    form.reset();
    setPosterImage(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {event ? (
          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Event</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="organizer" render={({ field }) => (
              <FormItem><FormLabel>Club / Organizer</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="eventDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Event Date & Time</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="venue" render={({ field }) => (
                    <FormItem><FormLabel>Venue</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="eventType" render={({ field }) => (
                <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Hackathon">Hackathon</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField control={form.control} name="registrationLink" render={({ field }) => (
                    <FormItem><FormLabel>Registration Link (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
             </div>
             <FormItem>
                <FormLabel>Poster Image (Optional)</FormLabel>
                <FormControl><Input type="file" accept="image/*" onChange={(e) => setPosterImage(e.target.files?.[0] || null)} /></FormControl>
                {posterImage && <p className="text-xs text-muted-foreground">{posterImage.name}</p>}
            </FormItem>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


export default function SdcDashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const eventsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'events') : null, [firestore]);
  const { data: events, isLoading: loadingEvents } = useCollection(eventsCollection);

  const handleSaveEvent = async (eventData: any, posterFile?: File) => {
    if (!firestore) return;
    let posterImageUrl = eventData.posterImageUrl || '';

    if (posterFile) {
        try {
            const storage = getStorage();
            const posterRef = ref(storage, `events/${Date.now()}-${posterFile.name}`);
            const snapshot = await uploadBytes(posterRef, posterFile);
            posterImageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("Poster upload error:", error);
            toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload event poster." });
            return;
        }
    }

    const dataToSave = {
      ...eventData,
      posterImageUrl,
      eventDate: eventData.eventDate.toISOString(),
      status: 'Active',
      createdAt: eventData.id ? eventData.createdAt : new Date().toISOString(),
    };
    
    if (eventData.id) {
      const docRef = doc(firestore, 'events', eventData.id);
      setDocumentNonBlocking(docRef, dataToSave, { merge: true });
      toast({ title: "Success", description: "Event updated successfully." });
    } else {
      if (eventsCollection) {
        addDocumentNonBlocking(eventsCollection, dataToSave);
        toast({ title: "Success", description: "Event created successfully." });
      }
    }
  };

  const handleArchiveEvent = async (eventId: string) => {
    if (!firestore) return;
    if (window.confirm("Are you sure you want to archive this event?")) {
      const docRef = doc(firestore, 'events', eventId);
      setDocumentNonBlocking(docRef, { status: 'Archived' }, { merge: true });
      toast({ title: "Success", description: "Event archived." });
    }
  };

  const activeEvents = events?.filter((e:any) => e.status === 'Active') || [];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>SDC Dashboard</CardTitle>
            <CardDescription>Manage all campus events and activities.</CardDescription>
          </div>
          <EventForm onSave={handleSaveEvent} />
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Active Events</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEvents && <TableRow><TableCell colSpan={4} className="text-center">Loading events...</TableCell></TableRow>}
              {!loadingEvents && activeEvents.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No active events.</TableCell></TableRow>}
              {activeEvents.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.organizer}</TableCell>
                  <TableCell>{format(new Date(event.eventDate), 'PP')}</TableCell>
                  <TableCell className="flex gap-2">
                    <EventForm event={event} onSave={handleSaveEvent} />
                    <Button variant="ghost" size="icon" onClick={() => handleArchiveEvent(event.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
