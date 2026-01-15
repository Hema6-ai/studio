'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BotMessageSquare, Paperclip, Send, X } from 'lucide-react';
import { useUser } from '@/firebase';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { campusAssistant } from '@/ai/flows/campus-assistant';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';

type MediaAttachment = {
    type: 'image';
    dataUri: string;
};

type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
  attachment?: MediaAttachment;
};

export function AiChat() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'ai', content: "Hello! As your CampusOS assistant, I can access real-time data to help you. Ask me about your schedule, course availability, or attach an image to ask a visual question." },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [attachment, setAttachment] = useState<MediaAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChatSubmit = async () => {
    if ((!chatInput.trim() && !attachment) || isAiLoading || !user) return;

    const userMessage: ChatMessage = { 
        role: 'user', 
        content: chatInput,
        ...(attachment && { attachment })
    };
    
    const newHistory: ChatMessage[] = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    const currentInput = chatInput;
    const currentAttachment = attachment;
    
    setChatInput('');
    setAttachment(null);
    setIsAiLoading(true);

    try {
      // In a real scenario, you'd pass the attachment to the flow
      const result = await campusAssistant({ query: currentInput });
      setChatHistory([...newHistory, { role: 'ai', content: result.answer }]);
    } catch (error) {
      console.error("AI assistant error:", error);
      setChatHistory([...newHistory, { role: 'ai', content: "Sorry, I'm having trouble connecting or accessing data right now. Please try again later." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({ type: 'image', dataUri: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (!user) {
    return null; // Don't render the chat button if user is not logged in
  }

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <BotMessageSquare className="h-7 w-7" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl grid-rows-[auto_1fr_auto] h-full max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <BotMessageSquare /> Gemini AI Assistant
            </DialogTitle>
            <DialogDescription>
              Your AI-powered assistant for all things CampusOS. You can also attach images.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'ai' && <Avatar className="h-8 w-8"><AvatarFallback>AI</AvatarFallback></Avatar>}
                    <div className={`p-3 rounded-lg max-w-[85%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {msg.attachment?.type === 'image' && (
                        <Image src={msg.attachment.dataUri} alt="User attachment" width={200} height={200} className="rounded-md mb-2" />
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && <Avatar className="h-8 w-8"><AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback></Avatar>}
                  </div>
                ))}
                 {isAiLoading && (
                  <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback>AI</AvatarFallback></Avatar>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                      </div>
                  </div>
                )}
            </div>
           </ScrollArea>
          
          <DialogFooter className="flex-col gap-2">
            {attachment && (
                <div className="relative w-fit">
                    <Image src={attachment.dataUri} alt="Attachment preview" width={64} height={64} className="rounded-md" />
                    <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground" onClick={() => setAttachment(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
             <div className="flex w-full items-start space-x-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isAiLoading}>
                    <Paperclip className="h-5 w-5" />
                </Button>
              <Textarea 
                placeholder="Ask me about your schedule, medical leave status, or attach an image..." 
                className="min-h-0"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit();
                  }
                }}
                disabled={isAiLoading}
                rows={1}
              />
              <Button type="submit" size="icon" onClick={handleChatSubmit} disabled={isAiLoading || (!chatInput.trim() && !attachment)}>
                <Send className="h-4 w-4"/>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
