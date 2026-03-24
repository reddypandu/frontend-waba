import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageSquare, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Inbox = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedConv, setSelectedConv] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [search, setSearch] = React.useState("");

  // Mock data for now
  const conversations = [];
  const messages = [];
  const convsLoading = false;
  const msgsLoading = false;

  const sendMutation = useMutation({
    mutationFn: async () => {
      // Logic would go here
      console.log("Send message", message);
    },
    onSuccess: () => {
      setMessage("");
    },
    onError: (err) => {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    },
  });

  const selectedConvData = conversations.find((c) => c.id === selectedConv);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 rounded-xl overflow-hidden border border-border bg-background">
      {/* Sidebar - conversations list */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${selectedConv ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground mb-3">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {convsLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-20" />
              No conversations yet.
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors border-b border-border ${
                  selectedConv === conv.id ? "bg-secondary" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {conv.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm truncate">{conv.name}</span>
                    {conv.unread_count > 0 && (
                      <Badge className="h-5 min-w-[1.25rem] px-1 justify-center rounded-full text-[10px]">{conv.unread_count}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!selectedConv ? "hidden md:flex" : "flex"}`}>
        {selectedConv && selectedConvData ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConv(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {selectedConvData.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{selectedConvData.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedConvData.phone}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {msgsLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading messages...</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isOutbound = msg.direction === "outbound";
                    return (
                      <div key={msg.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-2xl px-4 py-2.5 text-sm max-w-[70%] ${
                          isOutbound ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMutation.mutate(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!message.trim() || sendMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-10" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose from your contacts to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
