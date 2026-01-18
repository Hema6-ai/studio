'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const bookSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  author: z.string().min(3, "Author must be at least 3 characters."),
  category: z.string().min(2, "Category is required."),
  description: z.string().optional(),
  isPhysical: z.boolean().default(false),
  totalCopies: z.coerce.number().optional(),
  copiesAvailable: z.coerce.number().optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

const BookForm = ({ book, onSave }: { book?: any; onSave: (data: any, files: { bookFile?: File, coverImage?: File }) => void }) => {
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: book ? {
        ...book,
        isPhysical: book.isPhysical || false,
    } : {
      title: '',
      author: '',
      category: '',
      description: '',
      isPhysical: false,
      totalCopies: 0,
      copiesAvailable: 0,
    },
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const isPhysical = form.watch('isPhysical');

  const onSubmit: SubmitHandler<BookFormValues> = (data) => {
    if (!data.isPhysical && !book && !bookFile) {
      form.setError("root", { message: "A book file (PDF) is required for digital books."});
      return;
    }
    onSave({ id: book?.id, ...data }, { bookFile: bookFile!, coverImage: coverImage! });
    setIsOpen(false);
    form.reset();
    setBookFile(null);
    setCoverImage(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {book ? (
          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Book</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{book ? "Edit Book" : "Add New Book"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="author" render={({ field }) => (
              <FormItem><FormLabel>Author</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} placeholder="e.g., DSA, AI, General" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField
                control={form.control}
                name="isPhysical"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Physical Book</FormLabel>
                        <FormMessage />
                    </div>
                    <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    </FormItem>
                )}
            />
            {isPhysical ? (
                <div className='grid grid-cols-2 gap-4'>
                    <FormField control={form.control} name="totalCopies" render={({ field }) => (
                        <FormItem><FormLabel>Total Copies</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="copiesAvailable" render={({ field }) => (
                        <FormItem><FormLabel>Copies Available</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            ) : (
                 <FormItem>
                    <FormLabel>Book File (PDF)</FormLabel>
                    <FormControl><Input type="file" accept="application/pdf" onChange={(e) => setBookFile(e.target.files?.[0] || null)} /></FormControl>
                    {bookFile && <p className="text-xs text-muted-foreground">{bookFile.name}</p>}
                    {!book && <FormMessage>A PDF file is required for new digital books.</FormMessage>}
                </FormItem>
            )}
            <FormItem>
                <FormLabel>Cover Image (Optional)</FormLabel>
                <FormControl><Input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} /></FormControl>
                 {coverImage && <p className="text-xs text-muted-foreground">{coverImage.name}</p>}
            </FormItem>
             {form.formState.errors.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Book"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


export default function LibrarianDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const booksCollection = useMemoFirebase(() => firestore ? collection(firestore, 'books') : null, [firestore]);
  const availabilityRef = useMemoFirebase(() => firestore && user ? doc(firestore, 'availability', `librarian-${user.uid}`) : null, [firestore, user]);
  
  const { data: books, isLoading: loadingBooks } = useCollection(booksCollection);
  const { data: availabilityData, isLoading: loadingAvailability } = useDoc(availabilityRef);

  const isAvailable = availabilityData?.availabilityStatus === 'YES';

  const handleAvailabilityChange = (checked: boolean) => {
    if (!availabilityRef || !user) return;
    setDocumentNonBlocking(availabilityRef, { 
        availabilityStatus: checked ? 'YES' : 'NO',
        librarianId: user.uid
    }, { merge: true });
    toast({ title: 'Availability Updated', description: `You are now ${checked ? 'available' : 'unavailable'}.`});
  };

  const handleSaveBook = async (bookData: any, files: { bookFile?: File, coverImage?: File }) => {
    if (!user || !booksCollection) return;
    
    let fileUrl = bookData.fileUrl || '';
    let coverImageUrl = bookData.coverImageUrl || '';

    try {
      const storage = getStorage();
      if (files.bookFile && !bookData.isPhysical) {
        const bookRef = ref(storage, `library/books/${Date.now()}-${files.bookFile.name}`);
        const snapshot = await uploadBytes(bookRef, files.bookFile);
        fileUrl = await getDownloadURL(snapshot.ref);
      }
      if (files.coverImage) {
        const coverRef = ref(storage, `library/covers/${Date.now()}-${files.coverImage.name}`);
        const snapshot = await uploadBytes(coverRef, files.coverImage);
        coverImageUrl = await getDownloadURL(snapshot.ref);
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload book files." });
      return;
    }

    const dataToSave = {
      ...bookData,
      fileUrl: bookData.isPhysical ? '' : fileUrl,
      coverImageUrl,
      createdAt: bookData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (bookData.id) {
      const docRef = doc(firestore, 'books', bookData.id);
      setDocumentNonBlocking(docRef, dataToSave, { merge: true });
      toast({ title: "Success", description: "Book updated successfully." });
    } else {
      addDocumentNonBlocking(booksCollection, dataToSave);
      toast({ title: "Success", description: "Book added successfully." });
    }
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this book?") && firestore) {
      const docRef = doc(firestore, 'books', bookId);
      deleteDocumentNonBlocking(docRef);
      toast({ title: "Success", description: "Book deleted." });
    }
  };

  return (
    <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Librarian Dashboard</CardTitle>
                    <CardDescription>Manage the institute's digital library collection.</CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>My Availability</CardTitle>
                    <CardDescription>Set your status for students.</CardDescription>
                </CardHeader>
                <CardContent>
                {loadingAvailability ? <p>Loading status...</p> : (
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">Librarian Availability</p>
                        </div>
                        <Switch
                            checked={isAvailable}
                            onCheckedChange={handleAvailabilityChange}
                        />
                    </div>
                )}
                </CardContent>
                 <CardFooter>
                    <div className="flex items-center w-full">
                        {isAvailable ? 
                                <span className="flex items-center text-sm text-green-600"><CheckCircle className="h-4 w-4 mr-2" /> You are currently available.</span> :
                                <span className="flex items-center text-sm text-red-600"><XCircle className="h-4 w-4 mr-2" /> You are currently unavailable.</span>
                            }
                    </div>
                </CardFooter>
            </Card>
        </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Book Collection</CardTitle>
            <CardDescription>Manage all physical and digital books.</CardDescription>
          </div>
          <BookForm onSave={handleSaveBook} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingBooks && <TableRow><TableCell colSpan={5} className="text-center">Loading books...</TableCell></TableRow>}
              {!loadingBooks && books?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No books found. Add one to get started.</TableCell></TableRow>}
              {books?.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                      <Badge variant={book.isPhysical ? 'secondary' : 'outline'}>
                        {book.isPhysical ? 'Physical' : 'Digital'}
                      </Badge>
                  </TableCell>
                  <TableCell>
                      {book.isPhysical ? `${book.copiesAvailable} / ${book.totalCopies} Copies` : 'Online'}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <BookForm book={book} onSave={handleSaveBook} />
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBook(book.id)}>
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
