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
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const bookSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  author: z.string().min(3, "Author must be at least 3 characters."),
  category: z.string().min(2, "Category is required."),
  description: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

const BookForm = ({ book, onSave }: { book?: any; onSave: (data: any, files: { bookFile?: File, coverImage?: File }) => void }) => {
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book?.title || '',
      author: book?.author || '',
      category: book?.category || '',
      description: book?.description || '',
    },
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const onSubmit: SubmitHandler<BookFormValues> = (data) => {
    if (!book && !bookFile) {
      form.setError("root", { message: "A book file (PDF) is required when adding a new book."});
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
             <FormItem>
                <FormLabel>Book File (PDF)</FormLabel>
                <FormControl><Input type="file" accept="application/pdf" onChange={(e) => setBookFile(e.target.files?.[0] || null)} /></FormControl>
                {bookFile && <p className="text-xs text-muted-foreground">{bookFile.name}</p>}
                {!book && <FormMessage>A PDF file is required for new books.</FormMessage>}
            </FormItem>
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
  const booksCollection = collection(firestore, 'books');
  const { data: books, isLoading: loadingBooks } = useCollection(booksCollection);

  const handleSaveBook = async (bookData: any, files: { bookFile?: File, coverImage?: File }) => {
    if (!user) return;
    
    let fileUrl = bookData.fileUrl || '';
    let coverImageUrl = bookData.coverImageUrl || '';

    try {
      const storage = getStorage();
      if (files.bookFile) {
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
      fileUrl,
      coverImageUrl,
      createdAt: bookData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (bookData.id) {
      const docRef = collection(firestore, 'books', bookData.id);
      // setDocument is not available in non-blocking-updates. This should be a blocking call for librarians.
      await setDoc(docRef, dataToSave, { merge: true });
      toast({ title: "Success", description: "Book updated successfully." });
    } else {
      addDocumentNonBlocking(booksCollection, dataToSave);
      toast({ title: "Success", description: "Book added successfully." });
    }
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this book?")) {
      const docRef = collection(firestore, 'books', bookId);
      // deleteDocument is not available in non-blocking-updates. This should be a blocking call for librarians.
      deleteDoc(docRef);
      toast({ title: "Success", description: "Book deleted." });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Librarian Dashboard</CardTitle>
            <CardDescription>Manage the institute's digital library collection.</CardDescription>
          </div>
          <BookForm onSave={handleSaveBook} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingBooks && <TableRow><TableCell colSpan={4} className="text-center">Loading books...</TableCell></TableRow>}
              {!loadingBooks && books?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No books found. Add one to get started.</TableCell></TableRow>}
              {books?.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.category}</TableCell>
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
