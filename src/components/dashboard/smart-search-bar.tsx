'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Image as ImageIcon, Sparkles, PlusCircle, Link as LinkIcon, Trash2, Edit } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { appShortcuts } from '@/lib/data';

const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const ShortcutForm = ({ shortcut, onSave, onCancel }: { shortcut?: any; onSave: (data: any) => void; onCancel: () => void }) => {
    const [name, setName] = useState(shortcut?.name || '');
    const [url, setUrl] = useState(shortcut?.url || '');

    const handleSave = () => {
        if (name && url) {
            onSave({ id: shortcut?.id, name, url });
        }
    };

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., LeetCode" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">URL</Label>
                <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} className="col-span-3" placeholder="https://leetcode.com" />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSave} disabled={!name || !url}>Save</Button>
            </DialogFooter>
        </div>
    );
};

export function SmartSearchBar() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const shortcutsCollection = collection(firestore, `users/${user?.uid}/shortcuts`);
  const { data: userShortcuts, isLoading: loadingShortcuts } = useCollection(shortcutsCollection);

  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<any>(null);


  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // 1. Keyword redirect
    const shortcut = appShortcuts.find(sc => sc.name.toLowerCase() === searchQuery.trim().toLowerCase());
    if (shortcut) {
      window.open(shortcut.url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // 2. URL check
    let urlToOpen = searchQuery.trim();
    if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
        if(urlToOpen.includes('.') && !urlToOpen.includes(' ')) {
             urlToOpen = 'https://' + urlToOpen;
        }
    }

    if (isValidUrl(urlToOpen)) {
        window.open(urlToOpen, '_blank', 'noopener,noreferrer');
        return;
    }

    // 3. Google Search fallback
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Browser Not Supported', description: 'Your browser does not support voice search.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      toast({ variant: 'destructive', title: 'Voice Search Error', description: event.error });
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setQuery(speechResult);
      handleSearch(speechResult);
    };

    recognition.start();
  };
  
  const handleImageSearchClick = () => {
      window.open('https://lens.google.com', '_blank', 'noopener,noreferrer');
  };
  
  const handleShortcutSave = (shortcutData: any) => {
      const docRef = shortcutData.id ? doc(firestore, `users/${user?.uid}/shortcuts`, shortcutData.id) : doc(collection(firestore, `users/${user?.uid}/shortcuts`));
      setDocumentNonBlocking(docRef, { name: shortcutData.name, url: shortcutData.url }, { merge: true });
      toast({ title: 'Shortcut saved!' });
      setIsShortcutModalOpen(false);
      setEditingShortcut(null);
  };

  const handleShortcutDelete = (shortcutId: string) => {
      if (window.confirm('Are you sure you want to delete this shortcut?')) {
          const docRef = doc(firestore, `users/${user?.uid}/shortcuts`, shortcutId);
          deleteDocumentNonBlocking(docRef);
          toast({ title: 'Shortcut deleted.' });
      }
  };


  return (
    <TooltipProvider>
    <div className="relative w-full max-w-xl flex-1 md:grow-0">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search Google or type a URL"
        className="w-full rounded-lg bg-background pl-8"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleVoiceSearch}>
                    <Mic className={`h-4 w-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                </Button>
            </TooltipTrigger>
            <TooltipContent><p>Voice Search</p></TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleImageSearchClick}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent><p>Search with Image (opens Google Lens)</p></TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsAiOpen(true)}>
                    <Sparkles className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent><p>AI Mode</p></TooltipContent>
        </Tooltip>
      </div>

       <div className="mt-2 flex flex-wrap items-center gap-2">
            {!loadingShortcuts && userShortcuts?.map((shortcut) => (
                <Tooltip key={shortcut.id}>
                    <TooltipTrigger asChild>
                        <a href={shortcut.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted text-xs">
                           <LinkIcon className="h-3 w-3 text-muted-foreground"/> {shortcut.name}
                        </a>
                    </TooltipTrigger>
                    <TooltipContent><p>{shortcut.url}</p></TooltipContent>
                </Tooltip>
            ))}
             <Dialog open={isShortcutModalOpen} onOpenChange={setIsShortcutModalOpen}>
                <DialogTrigger asChild>
                     <Button variant="ghost" size="sm" className="text-xs p-1.5 h-auto" onClick={() => { setEditingShortcut(null); setIsShortcutModalOpen(true);}}>
                        <PlusCircle className="mr-1 h-3 w-3" /> Add Shortcut
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingShortcut ? 'Edit Shortcut' : 'Add Shortcut'}</DialogTitle>
                        <DialogDescription>Create a custom shortcut for quick access.</DialogDescription>
                    </DialogHeader>
                    <ShortcutForm 
                        shortcut={editingShortcut}
                        onSave={handleShortcutSave}
                        onCancel={() => { setIsShortcutModalOpen(false); setEditingShortcut(null); }}
                    />
                </DialogContent>
            </Dialog>
        </div>

      {/* This Dialog component is now controlled here */}
      <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
          {/* You would put the AiChat component content here, or pass props to it */}
          {/* For simplicity, let's keep the existing AiChat component as a global floater for now */}
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
