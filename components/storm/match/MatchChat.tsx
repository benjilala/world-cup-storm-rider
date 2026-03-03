"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import type { ChatMessage } from "@/lib/types/storm";
import { useAuthStore } from "@/store/authStore";

export function MatchChat({ messages: initialMessages, matchId }: { messages: ChatMessage[]; matchId: string }) {
  const { isAuthenticated, session, openAuthDialog } = useAuthStore();
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || !isAuthenticated || !session) return;
    const msg: ChatMessage = {
      id: `c-${Date.now()}`,
      matchId,
      userId: session.user.id,
      username: session.user.username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  return (
    <div className="flex flex-col h-[300px]">
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <Avatar className="h-6 w-6 mt-0.5">
                <AvatarFallback className="text-[9px]">{msg.username.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium">{msg.username}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2 p-2 border-t">
        {isAuthenticated ? (
          <>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Send a message..."
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => openAuthDialog()}
          >
            Sign in to chat
          </Button>
        )}
      </div>
    </div>
  );
}
