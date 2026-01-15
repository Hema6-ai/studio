'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Mic, Image as ImageIcon, Sparkles, PlusCircle, Link as LinkIcon, X, Paperclip } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { appShortcuts } from '@/lib/data';
import { campusAssistant } from '@/ai/flows/campus-assistant';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';

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

type Attachment = {
  name: string;
  type: 'image' | 'file';
  dataUri: string;
  fileType: string;
};


export function SmartSearchBar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Search and AI State
  const [query, setQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiResponseType | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Attachment State
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Search State and Ref
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // User Shortcuts State
  const shortcutsCollection = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return collection(firestore, `users/${user.uid}/shortcuts`);
  }, [user?.uid, firestore]);
  const { data: userShortcuts, isLoading: loadingShortcuts } = useCollection(shortcutsCollection);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<any>(null);


  // --- Voice Search Initialization ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition is not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
         toast({ variant: 'destructive', title: 'Voice Search Error', description: `Error: ${event.error}. Please ensure microphone access is allowed.` });
      }
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setQuery(speechResult);
      if(isAiMode) {
        handleAiSearch(speechResult);
      } else {
        handleNormalSearch(speechResult);
      }
    };
    
    recognitionRef.current = recognition;

  }, [isAiMode]); // Re-create if AI mode changes to update the onresult handler

  const handleVoiceSearch = () => {
    if (isListening || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch(e) {
      console.error("Error starting speech recognition:", e);
    }
  };


  // --- Search Logic ---
  const handleNormalSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // 1. Keyword redirect
    const allShortcuts = [...appShortcuts, ...(userShortcuts || [])];
    const shortcut = allShortcuts.find(sc => sc.name.toLowerCase() === searchQuery.trim().toLowerCase());
    if (shortcut) {
      window.open(shortcut.url, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // 2. URL check
    let urlToOpen = searchQuery.trim();
    const isDomain = urlToOpen.includes('.') && !urlToOpen.includes(' ');
    if (isDomain && !urlToOpen.startsWith('http')) {
        urlToOpen = 'https://' + urlToOpen;
    }

    if (isValidUrl(urlToOpen)) {
        window.open(urlToOpen, '_blank', 'noopener,noreferrer');
        return;
    }

    // 3. Google Search fallback
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAiSearch = async (searchQuery = query, searchAttachment = attachment) => {
    if (!searchQuery.trim() && !searchAttachment) return;

    setIsAiLoading(true);
    setAiResponse(null);
    try {
      // In a real implementation, the flow would handle the attachment data URI.
      const result = await campusAssistant({ query: searchQuery });
      setAiResponse(result);
    } catch(e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: "AI Assistant Error",
            description: "The AI assistant is temporarily unavailable. Please try again later."
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


  // --- File/Image Handling ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        dataUri: reader.result as string,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleImageButtonClick = () => {
    if (isAiMode) {
      fileInputRef.current?.click(); // Open file picker for AI mode
    } else {
      window.open('https://lens.google.com', '_blank', 'noopener,noreferrer'); // Redirect for normal mode
    }
  };


  // --- UI Toggles and Resets ---
  const toggleAiMode = () => {
    setIsAiMode(!isAiMode);
    setAiResponse(null); // Clear AI response when toggling
    setAttachment(null); // Clear attachment when toggling
    setQuery(''); // Clear query when toggling
  };

  return (
    <TooltipProvider>
    <div className="relative w-full max-w-2xl mx-auto">
       <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder={isAiMode ? "Ask Gemini AI about courses, schedules, or upload a file..." : "Search Google or type a URL"}
                  className="w-full h-12 rounded-full bg-background pl-10 pr-36 text-base"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isAiLoading}
              />
            </div>
            <div className="absolute inset-y-0 right-3 flex items-center">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={handleVoiceSearch} disabled={isListening || isAiLoading}>
                            <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Search by voice</p></TooltipContent>
                </Tooltip>
                
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={handleImageButtonClick} disabled={isAiLoading}>
                            <ImageIcon className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{isAiMode ? 'Upload image' : 'Search with Google Lens'}</p></TooltipContent>
                </Tooltip>

                {isAiMode && (
                   <Tooltip>
                        <TooltipTrigger asChild>
                             <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => fileInputRef.current?.click()} disabled={isAiLoading}>
                                <Paperclip className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Upload a file (PDF, DOC, TXT)</p></TooltipContent>
                    </Tooltip>
                )}
                
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className={`h-9 w-9 ${isAiMode ? 'bg-accent text-accent-foreground' : ''}`} onClick={toggleAiMode} disabled={isAiLoading}>
                            <Sparkles className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{isAiMode ? 'Switch to Normal Search' : 'Switch to AI Mode'}</p></TooltipContent>
                </Tooltip>
            </div>
             <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,application/pdf,.doc,.docx,.txt,.csv,.ppt,.pptx"
            />
        </form>

        <div className="mt-2 flex flex-wrap items-center gap-2 px-2">
          {attachment && (
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm">
                {attachment.type === 'image' ? <ImageIcon className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
                <span className="truncate max-w-xs">{attachment.name}</span>
                 <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setAttachment(null)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
          )}
        </div>

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
                        <PlusCircle className="mr-1 h-3 w-3" /> Add/Manage
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingShortcut ? 'Edit Shortcut' : 'Add Shortcut'}</DialogTitle>
                    </DialogHeader>
                    {/* ShortcutForm goes here */}
                </DialogContent>
            </Dialog>
        </div>

        {isAiLoading && (
            <Card className="mt-4">
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground text-center animate-pulse">Gemini is thinking...</p>
                </CardContent>
            </Card>
        )}

        {aiResponse && !isAiLoading && (
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                        <Avatar className="h-8 w-8 bg-primary/20 text-primary"><AvatarFallback>AI</AvatarFallback></Avatar>
                        Gemini Response
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap text-foreground/90">{aiResponse.answer}</p>
                </CardContent>
            </Card>
        )}
    </div>
    </TooltipProvider>
  );
}
