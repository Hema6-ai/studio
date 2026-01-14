'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BotMessageSquare, Send } from 'lucide-react';
import { useUser } from '@/firebase';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { campusAssistant } from '@/ai/flows/campus-assistant';
import { ScrollArea } from '../ui/scroll-area';

type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
};

export function AiChat() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'ai', content: "Hello! As your CampusOS assistant, I can access real-time data to help you. Ask me about your schedule, course availability, and more." },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isAiLoading || !user) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newHistory);
    const currentInput = chatInput;
    setChatInput('');
    setIsAiLoading(true);

    try {
      const result = await campusAssistant({ query: currentInput });
      setChatHistory([...newHistory, { role: 'ai', content: result.answer }]);
    } catch (error) {
      console.error("AI assistant error:", error);
      setChatHistory([...newHistory, { role: 'ai', content: "Sorry, I'm having trouble connecting or accessing data right now. Please try again later." }]);
    } finally {
      setIsAiLoading(false);
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
              Your AI-powered assistant for all things CampusOS.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'ai' && <Avatar className="h-8 w-8"><AvatarFallback>AI</AvatarFallback></Avatar>}
                    <div className={`p-3 rounded-lg max-w-[85%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
          
          <DialogFooter>
             <div className="flex w-full items-center space-x-2">
              <Textarea 
                placeholder="Ask me about your schedule, medical leave status, or faculty availability..." 
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
              <Button type="submit" size="icon" onClick={handleChatSubmit} disabled={isAiLoading || !chatInput.trim()}>
                <Send className="h-4 w-4"/>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
