'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Image as ImageIcon, Sparkles, PlusCircle, Link as LinkIcon, X, Paperclip } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { appShortcuts } from '@/lib/data';
import { campusAssistant } from '@/ai/flows/campus-assistant';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';


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
  }, [user, firestore]);

  const { data: userShortcuts, isLoading: loadingShortcuts } = useCollection(shortcutsCollection);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<any>(null);


  // --- Voice Search Initialization ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setQuery(speechResult);
        // Automatically submit after voice input
        if(isAiMode) {
            handleAiSearch(speechResult);
        } else {
            handleNormalSearch(speechResult);
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          toast({ variant: 'destructive', title: 'Voice Search Error', description: `Could not start voice search. Please ensure microphone access is allowed.` });
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [toast, isAiMode]); // Re-run if isAiMode changes to update submit logic


  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    
    if (!recognitionRef.current) {
        toast({ variant: 'destructive', title: 'Voice Search Error', description: 'Speech recognition is not supported in this browser.'});
        return;
    };
    
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Error starting speech recognition:", e);
      setIsListening(false);
      toast({ variant: 'destructive', title: 'Voice Search Error', description: 'Could not start voice search.'});
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

  const handleAiSearch = async (searchQuery = query) => {
    if (!searchQuery.trim() && !attachment) return;

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

    if (isAiMode) {
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
    } else {
        // In normal mode, redirect to Google Lens/Images
        window.open('https://lens.google.com/', '_blank', 'noopener,noreferrer');
    }
  };


  // --- UI Toggles and Resets ---
  const toggleAiMode = () => {
    const newAiMode = !isAiMode;
    setIsAiMode(newAiMode);
    
    // Clear state when toggling
    setAiResponse(null);
    setAttachment(null);
    setQuery('');
  };

  const handleShortcutAdd = (name: string, url: string) => {
    if (!user || !shortcutsCollection) return;
    addDocumentNonBlocking(shortcutsCollection, { name, url });
    toast({ title: 'Shortcut Added' });
    setIsShortcutModalOpen(false);
  };
  
  const handleShortcutDelete = (id: string) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/shortcuts`, id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Shortcut Deleted' });
  };

  return (
    <TooltipProvider>
    <div className="relative w-full max-w-2xl mx-auto">
       <form onSubmit={handleSubmit} className="w-full">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder={isAiMode ? "Ask Gemini AI about courses, schedules, or upload a file..." : "Search Google or type a URL"}
                  className="w-full h-12 rounded-full bg-background pl-10 pr-40 text-base"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isAiLoading}
              />
              <div className="absolute inset-y-0 right-3 flex items-center space-x-1">
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={handleVoiceSearch} disabled={isAiLoading}>
                              <Mic className={cn("h-5 w-5", isListening && 'text-red-500 animate-pulse')} />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Search by voice</p></TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                      <TooltipTrigger asChild>
                           <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => fileInputRef.current?.click()} disabled={isAiLoading}>
                              <ImageIcon className="h-5 w-5" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{isAiMode ? 'Upload image' : 'Search with image'}</p></TooltipContent>
                  </Tooltip>

                  <Tooltip>
                        <TooltipTrigger asChild>
                             <Button type="button" variant="ghost" size="icon" className={cn("h-9 w-9", isAiMode && 'hidden')}>
                                <Paperclip className="h-5 w-5 text-muted-foreground/50" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Enable AI mode to upload files</p></TooltipContent>
                  </Tooltip>
                  
                   <Tooltip>
                        <TooltipTrigger asChild>
                             <Button type="button" variant="ghost" size="icon" className={cn("h-9 w-9", !isAiMode && 'hidden')} onClick={() => fileInputRef.current?.click()} disabled={isAiLoading}>
                                <Paperclip className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Upload a file</p></TooltipContent>
                    </Tooltip>

                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className={cn('h-9 w-9', isAiMode && 'bg-accent text-accent-foreground')} onClick={toggleAiMode} disabled={isAiLoading}>
                              <Sparkles className="h-5 w-5" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{isAiMode ? 'Switch to Normal Search' : 'Switch to AI Mode'}</p></TooltipContent>
                  </Tooltip>
              </div>
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
