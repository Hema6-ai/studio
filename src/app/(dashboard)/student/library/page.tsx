'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PlusCircle, Folder, File as FileIcon, Trash2, Download, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const placeholderCover = "https://picsum.photos/seed/book/300/400";


// --- Institute Library Section ---
const InstituteLibrary = () => {
    const firestore = useFirestore();
    const booksCollection = collection(firestore, 'books');
    const { data: books, isLoading } = useCollection(booksCollection);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Institute Library</CardTitle>
                <CardDescription>Browse and read books from the official institute collection.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <p>Loading books...</p>}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {books?.map(book => (
                        <Card key={book.id} className="overflow-hidden flex flex-col">
                            <div className="aspect-[3/4] bg-muted relative">
                                {book.isPhysical && book.copiesAvailable === 0 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Badge variant="destructive">Out of Stock</Badge>
                                    </div>
                                )}
                                <Image 
                                    src={book.coverImageUrl || placeholderCover} 
                                    alt={book.title}
                                    width={300}
                                    height={400}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-semibold truncate">{book.title}</h3>
                                <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                                <div className='mt-2 flex-grow'>
                                    {book.isPhysical ? (
                                        <Badge variant={book.copiesAvailable > 0 ? "default" : "secondary"} className={book.copiesAvailable > 0 ? "bg-green-600" : ""}>
                                            {book.copiesAvailable > 0 ? `In Stock (${book.copiesAvailable} left)` : 'Out of Stock'}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Digital</Badge>
                                    )}
                                </div>
                                {!book.isPhysical && (
                                     <Button asChild variant="secondary" size="sm" className="mt-2 w-full">
                                        <Link href={book.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <BookOpen className="mr-2 h-4 w-4" /> Read Online
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
                 {!isLoading && books?.length === 0 && <p className="text-muted-foreground text-center">The library is currently empty.</p>}
            </CardContent>
        </Card>
    );
}

// --- Student's Personal Library Section ---
const MyLibrary = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const myLibraryCollection = collection(firestore, `students/${user?.uid}/library`);
    const { data: myFiles, isLoading } = useCollection(myLibraryCollection);

    const [currentFolder, setCurrentFolder] = useState('root');
    const [newFolderName, setNewFolderName] = useState('');
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    const folders = useMemo(() => {
        const folderSet = new Set<string>();
        myFiles?.forEach(file => {
            if (file.folder && file.folder !== 'root') {
                folderSet.add(file.folder);
            }
        });
        return Array.from(folderSet);
    }, [myFiles]);

    const filesInCurrentFolder = useMemo(() => {
        return myFiles?.filter(file => file.folder === currentFolder) || [];
    }, [myFiles, currentFolder]);

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        // In a real app, you might create a placeholder document for an empty folder
        // For now, folders are just metadata on files.
        toast({ title: "Folder ready", description: `Any files you upload to '${newFolderName}' will create the folder.` });
        setCurrentFolder(newFolderName);
        setIsFolderModalOpen(false);
        setNewFolderName('');
    };
    
    const handleFileUpload = async () => {
        if (!fileToUpload || !user) return;

        try {
            const storage = getStorage();
            const fileRef = ref(storage, `student-library/${user.uid}/${currentFolder}/${Date.now()}-${fileToUpload.name}`);
            const snapshot = await uploadBytes(fileRef, fileToUpload);
            const url = await getDownloadURL(snapshot.ref);

            addDocumentNonBlocking(myLibraryCollection, {
                name: fileToUpload.name,
                type: fileToUpload.type,
                url: url,
                folder: currentFolder,
                uploadedAt: new Date().toISOString()
            });

            toast({ title: "Success", description: "File uploaded to your library." });
            setIsFileModalOpen(false);
            setFileToUpload(null);

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload your file." });
        }
    };
    
    const handleDeleteFile = (fileId: string) => {
        if (window.confirm("Are you sure you want to delete this file from your library?") && user) {
            const docRef = doc(firestore, `students/${user.uid}/library`, fileId);
            deleteDocumentNonBlocking(docRef);
            toast({ title: "File Deleted" });
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Library</CardTitle>
                    <CardDescription>Your personal collection of notes and documents.</CardDescription>
                </div>
                <div className="flex gap-2">
                     <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
                        <DialogTrigger asChild><Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> New Folder</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
                            <div className="space-y-2">
                                <Label htmlFor="folder-name">Folder Name</Label>
                                <Input id="folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                            </div>
                            <DialogFooter><Button onClick={handleCreateFolder}>Create</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isFileModalOpen} onOpenChange={setIsFileModalOpen}>
                         <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Upload File</Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Upload File to '{currentFolder}'</DialogTitle></DialogHeader>
                             <div className="space-y-2">
                                <Label htmlFor="file-upload">Select File</Label>
                                <Input id="file-upload" type="file" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} />
                            </div>
                            <DialogFooter><Button onClick={handleFileUpload} disabled={!fileToUpload}>Upload</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4 border-b pb-2">
                    <Button variant={currentFolder === 'root' ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentFolder('root')}>
                        <Folder className="mr-2 h-4 w-4" /> Root
                    </Button>
                    {folders.map(folder => (
                        <Button key={folder} variant={currentFolder === folder ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentFolder(folder)}>
                            <Folder className="mr-2 h-4 w-4" /> {folder}
                        </Button>
                    ))}
                </div>
                {isLoading && <p>Loading your files...</p>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filesInCurrentFolder.map(file => (
                        <div key={file.id} className="group relative flex flex-col items-center justify-center gap-2 p-4 border rounded-lg aspect-square text-center">
                            <FileIcon className="w-12 h-12 text-muted-foreground" />
                            <p className="text-sm font-medium truncate w-full">{file.name}</p>
                            <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button asChild size="icon" variant="ghost"><Link href={file.url} target="_blank"><Download className="h-4 w-4" /></Link></Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteFile(file.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
                {!isLoading && filesInCurrentFolder.length === 0 && <p className="text-center text-muted-foreground py-8">This folder is empty. Upload a file to get started.</p>}
            </CardContent>
        </Card>
    );
}


export default function LibraryPage() {
    return (
        <div className="space-y-8">
            <InstituteLibrary />
            <MyLibrary />
        </div>
    );
}

    