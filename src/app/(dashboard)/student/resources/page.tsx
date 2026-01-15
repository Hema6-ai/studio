'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PlusCircle, Folder, File as FileIcon, Trash2, Download, BookOpen, Link as LinkIcon, Search, Youtube, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Github } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
    github: Github,
    youtube: Youtube,
    link: LinkIcon,
    default: GraduationCap,
};


// --- Global Resources Section ---
const GlobalResources = () => {
    const firestore = useFirestore();
    const globalResourcesQuery = useMemoFirebase(() => collection(firestore, 'resourceHub/globalResources'), [firestore]);
    const { data: resources, isLoading } = useCollection(globalResourcesQuery);

    const categorizedResources = useMemo(() => {
        if (!resources) return {};
        return resources.reduce((acc, resource) => {
            const category = resource.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(resource);
            return acc;
        }, {} as Record<string, any[]>);
    }, [resources]);

    return (
        <div>
            {isLoading && <p>Loading global resources...</p>}
            {Object.entries(categorizedResources).map(([category, items]) => {
                 const Icon = iconMap[items[0]?.icon] || iconMap.default;
                return (
                    <div key={category} className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                           <Icon className="h-5 w-5" /> {category}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {items.map(item => {
                                const ItemIcon = iconMap[item.icon] || iconMap.default;
                                return (
                                <Card key={item.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <ItemIcon className="h-5 w-5" />
                                            {item.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs line-clamp-2">{item.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="mt-auto">
                                        <Button asChild variant="secondary" size="sm" className="w-full">
                                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                Open Link
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )})}
                        </div>
                    </div>
            )})}
        </div>
    );
};


// --- Student's Personal Resources Section ---
const MyResources = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const myResourcesCollection = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, `resourceHub/students/${user.uid}/resources`);
    }, [user, firestore]);

    const { data: myFiles, isLoading } = useCollection(myResourcesCollection);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentFolder, setCurrentFolder] = useState('root');

    // Modals state
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    // Forms state
    const [newFolderName, setNewFolderName] = useState('');
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [linkData, setLinkData] = useState({ name: '', url: '' });

    const folders = useMemo(() => {
        const folderSet = new Set<string>();
        myFiles?.forEach(file => {
            if (file.folder && file.folder !== 'root') {
                folderSet.add(file.folder);
            }
        });
        return Array.from(folderSet);
    }, [myFiles]);

    const filteredFiles = useMemo(() => {
        return myFiles?.filter(file => {
            const inFolder = file.folder === currentFolder;
            const matchesSearch = searchTerm ? file.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            return inFolder && matchesSearch;
        }) || [];
    }, [myFiles, currentFolder, searchTerm]);


    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        toast({ title: "Folder ready", description: `Any resources you add to '${newFolderName}' will appear in this folder.` });
        setCurrentFolder(newFolderName);
        setIsFolderModalOpen(false);
        setNewFolderName('');
    };
    
    const handleFileUpload = async () => {
        if (!fileToUpload || !user || !myResourcesCollection) return;
        try {
            const storage = getStorage();
            const fileRef = ref(storage, `student-resources/${user.uid}/${currentFolder}/${Date.now()}-${fileToUpload.name}`);
            const snapshot = await uploadBytes(fileRef, fileToUpload);
            const url = await getDownloadURL(snapshot.ref);

            addDocumentNonBlocking(myResourcesCollection, {
                name: fileToUpload.name,
                type: 'pdf',
                url: url,
                folder: currentFolder,
                createdAt: new Date().toISOString()
            });

            toast({ title: "Success", description: "File uploaded to your resources." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload your file." });
        } finally {
            setIsFileModalOpen(false);
            setFileToUpload(null);
        }
    };

    const handleAddLink = () => {
        if (!linkData.name.trim() || !linkData.url.trim() || !user || !myResourcesCollection) return;
         try {
             new URL(linkData.url); // Validate URL
         } catch (_) {
             toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid URL.'});
             return;
         }

         addDocumentNonBlocking(myResourcesCollection, {
            name: linkData.name,
            type: 'link',
            url: linkData.url,
            folder: currentFolder,
            createdAt: new Date().toISOString()
        });
        toast({ title: "Success", description: "Link added to your resources." });
        setIsLinkModalOpen(false);
        setLinkData({ name: '', url: '' });
    }
    
    const handleDeleteFile = (fileId: string) => {
        if (window.confirm("Are you sure you want to delete this resource? This cannot be undone.") && user) {
            const docRef = doc(firestore, `resourceHub/students/${user.uid}/resources`, fileId);
            deleteDocumentNonBlocking(docRef);
            toast({ title: "Resource Deleted" });
        }
    }

    return (
        <Card>
            <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>My Resources</CardTitle>
                    <CardDescription>Your personal, private collection of learning materials.</CardDescription>
                </div>
                <div className="flex gap-2">
                     <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
                        <DialogTrigger asChild><Button variant="outline"><PlusCircle /> New Folder</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
                            <div className="space-y-2 py-4">
                                <Label htmlFor="folder-name">Folder Name</Label>
                                <Input id="folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                            </div>
                            <DialogFooter><Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                         <DialogTrigger asChild><Button variant="outline"><LinkIcon /> Add Link</Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Add Link to '{currentFolder}'</DialogTitle></DialogHeader>
                             <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="link-name">Name</Label>
                                    <Input id="link-name" placeholder="e.g., Striver's DSA Playlist" value={linkData.name} onChange={(e) => setLinkData({...linkData, name: e.target.value})} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="link-url">URL</Label>
                                    <Input id="link-url" placeholder="https://youtube.com/..." value={linkData.url} onChange={(e) => setLinkData({...linkData, url: e.target.value})} />
                                </div>
                            </div>
                            <DialogFooter><Button onClick={handleAddLink} disabled={!linkData.name || !linkData.url}>Add</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isFileModalOpen} onOpenChange={setIsFileModalOpen}>
                         <DialogTrigger asChild><Button><PlusCircle /> Upload PDF</Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Upload PDF to '{currentFolder}'</DialogTitle></DialogHeader>
                             <div className="space-y-2 py-4">
                                <Label htmlFor="file-upload">Select File</Label>
                                <Input id="file-upload" type="file" accept="application/pdf" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} />
                            </div>
                            <DialogFooter><Button onClick={handleFileUpload} disabled={!fileToUpload}>Upload</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4 border-b pb-4">
                   <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search in current folder..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 items-center overflow-x-auto pb-2">
                        <Button variant={currentFolder === 'root' ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentFolder('root')}>
                            <Folder className="mr-2 h-4 w-4" /> Root
                        </Button>
                        {folders.map(folder => (
                            <Button key={folder} variant={currentFolder === folder ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentFolder(folder)} className="whitespace-nowrap">
                                <Folder className="mr-2 h-4 w-4" /> {folder}
                            </Button>
                        ))}
                    </div>
                </div>

                {isLoading && <p>Loading your resources...</p>}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredFiles.map(file => {
                        const Icon = file.type === 'pdf' ? FileIcon : LinkIcon;
                        return (
                        <div key={file.id} className="group relative flex flex-col items-center justify-center gap-2 p-4 border rounded-lg aspect-square text-center">
                            <Icon className="w-10 h-10 text-muted-foreground" />
                            <p className="text-sm font-medium truncate w-full">{file.name}</p>
                            <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button asChild size="icon" variant="ghost"><a href={file.url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a></Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteFile(file.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            </div>
                        </div>
                    )})}
                </div>
                {!isLoading && filteredFiles.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        <p>This folder is empty.</p>
                        <p className="text-xs">Upload a file or add a link to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


export default function ResourceHubPage() {
    return (
        <div className="space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Resource Hub</CardTitle>
                    <CardDescription>Your central place for all learning materials and platforms.</CardDescription>
                </CardHeader>
            </Card>
             <Tabs defaultValue="global">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="global">Global Resources</TabsTrigger>
                    <TabsTrigger value="personal">My Resources</TabsTrigger>
                </TabsList>
                <TabsContent value="global" className="mt-6">
                    <GlobalResources />
                </TabsContent>
                 <TabsContent value="personal" className="mt-6">
                    <MyResources />
                </TabsContent>
            </Tabs>
        </div>
    );
}
