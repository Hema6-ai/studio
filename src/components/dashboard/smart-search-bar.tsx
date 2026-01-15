'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Image as ImageIcon, Sparkles, PlusCircle, Link as LinkIcon, X } from 'lucide-react';
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
import { campusAssistant } from '@/ai/flows/campus-assistant';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

type AiResponseType = {
    answer: string;
}

export function SmartSearchBar() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiResponseType | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const shortcutsCollection = collection(firestore, `users/${user?.uid}/shortcuts`);
  const { data: userShortcuts, isLoading: loadingShortcuts } = useCollection(shortcutsCollection);

  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<any>(null);


  const handleNormalSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // 1. Keyword redirect
    const shortcut = [...appShortcuts, ...(userShortcuts || [])].find(sc => sc.name.toLowerCase() === searchQuery.trim().toLowerCase());
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

  const handleAiSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    try {
        const result = await campusAssistant({ query: searchQuery });
        setAiResponse(result);
    } catch(e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: "AI Assistant Error",
            description: "Could not get a response from the AI assistant."
        });
    } finally {
        setIsAiLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAiMode) {
        handleAiSearch();
    } else {
        handleNormalSearch();
    }
  }

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
      // Voice search should use normal search logic, not AI
      if (isAiMode) setIsAiMode(false);
      handleNormalSearch(speechResult);
    };

    recognition.start();
  };
  
  const handleImageSearchClick = () => {
      window.open('https://lens.google.com', '_blank', 'noopener,noreferrer');
  };
  
  const handleShortcutSave = (shortcutData: any) => {
      if(!user) return;
      const docRef = shortcutData.id ? doc(firestore, `users/${user.uid}/shortcuts`, shortcutData.id) : doc(collection(firestore, `users/${user.uid}/shortcuts`));
      setDocumentNonBlocking(docRef, { name: shortcutData.name, url: shortcutData.url }, { merge: true });
      toast({ title: 'Shortcut saved!' });
      setIsShortcutModalOpen(false);
      setEditingShortcut(null);
  };

  const handleShortcutDelete = (shortcutId: string) => {
      if(!user) return;
      if (window.confirm('Are you sure you want to delete this shortcut?')) {
          const docRef = doc(firestore, `users/${user.uid}/shortcuts`, shortcutId);
          deleteDocumentNonBlocking(docRef);
          toast({ title: 'Shortcut deleted.' });
      }
  };


  return (
    <TooltipProvider>
    <div className="relative w-full max-w-xl">
       <form onSubmit={handleSubmit} className="relative flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={isAiMode ? "Ask Gemini AI..." : "Search Google or type a URL"}
                className="w-full rounded-lg bg-background pl-8 pr-28" // Added more padding to the right for icons
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleVoiceSearch}>
                            <Mic className={`h-4 w-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Voice Search</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleImageSearchClick}>
                        <ImageIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Search with Image (opens Google Lens)</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className={`h-7 w-7 ${isAiMode ? 'bg-accent text-accent-foreground' : ''}`} onClick={() => setIsAiMode(!isAiMode)}>
                            <Sparkles className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>AI Mode</p></TooltipContent>
                </Tooltip>
            </div>
        </form>

       <div className="mt-2 flex flex-wrap items-center gap-2">
            {!loadingShortcuts && [...appShortcuts, ...(userShortcuts || [])].slice(0, 10).map((shortcut) => (
                <Tooltip key={shortcut.id || shortcut.name}>
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
                    {/* ShortcutForm would go here, but we can simplify for now */}
                </DialogContent>
            </Dialog>
        </div>

        {isAiLoading && (
            <Card className="mt-4">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Generating response...</p>
                </CardContent>
            </Card>
        )}

        {aiResponse && !isAiLoading && (
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Avatar className="h-8 w-8"><AvatarFallback>AI</AvatarFallback></Avatar>
                        Gemini Response
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{aiResponse.answer}</p>
                </CardContent>
            </Card>
        )}
    </div>
    </TooltipProvider>
  );
}
