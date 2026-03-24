import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageSquare, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedConv, setSelectedConv] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [newChatPhone, setNewChatPhone] = React.useState(null);

  const { data: convsData, isLoading: convsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiGet("/api/whatsapp/conversations"),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => apiGet("/api/admin/contacts"),
    enabled: !!user,
  });

  const conversations = convsData?.conversations || [];
  const contacts = contactsData || [];

  const isLoading = (convsLoading || contactsLoading) && conversations.length === 0 && contacts.length === 0;
  // Filtered list: show conversations first, then contacts who don't have a conversation yet
  const filteredList = React.useMemo(() => {
    let list = conversations.map(c => ({ ...c, isConv: true }));
    const convPhones = new Set(conversations.map(c => c.phone_number || c.contact_id?.phone_number));
    
    // Add contacts who aren't in conversations
    contacts.forEach(contact => {
      if (!convPhones.has(contact.phone_number)) {
        list.push({ _id: `contact-${contact._id}`, contact_id: contact, phone_number: contact.phone_number, isConv: false });
      }
    });

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(item => 
        (item.contact_id?.name || "").toLowerCase().includes(s) || 
        (item.phone_number || "").includes(s) ||
        (item.last_message || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [conversations, contacts, search]);

  // Handle ?phone= parameter
  React.useEffect(() => {
    const phone = searchParams.get("phone");
    if (phone) {
      const existing = conversations.find(c => (c.contact_id?.phone_number === phone || c.phone_number === phone));
      if (existing) {
        setSelectedConv(existing._id);
        setNewChatPhone(null);
      } else {
        setSelectedConv("new");
        setNewChatPhone(phone);
      }
      // Clear param
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, conversations]);

  const { data: msgsData, isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", selectedConv],
    queryFn: () => {
      if (!selectedConv || selectedConv === "new" || selectedConv.startsWith("contact-")) return { messages: [] };
      return apiGet(`/api/whatsapp/messages/${selectedConv}`);
    },
    enabled: !!selectedConv && selectedConv !== "new" && !selectedConv.startsWith("contact-"),
    refetchInterval: 3000,
  });

  const messages = msgsData?.messages || [];

  const sendMutation = useMutation({
    mutationFn: async () => {
      let to = newChatPhone;
      if (selectedConv && selectedConv !== "new") {
        if (selectedConv.startsWith("contact-")) {
          const c = contacts.find(con => `contact-${con._id}` === selectedConv);
          to = c?.phone_number;
        } else {
          const conv = conversations.find(c => c._id === selectedConv);
          to = conv?.contact_id?.phone_number || conv?.phone_number;
        }
      }
      
      return apiPost("/api/whatsapp", { 
        action: "send_message", 
        to, 
        content: message 
      });
    },
    onSuccess: (data) => {
      setMessage("");
      if (data.conversation_id) setSelectedConv(data.conversation_id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      if (selectedConv === "new" || selectedConv?.startsWith("contact-")) {
        setSelectedConv(null);
      }
    },
    onError: (err) => {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    },
  });

  const selectedConvData = React.useMemo(() => {
    if (selectedConv === "new") return { _id: "new", phone_number: newChatPhone, contact_id: { name: "New Chat", phone_number: newChatPhone } };
    if (selectedConv?.startsWith("contact-")) {
      const c = contacts.find(con => `contact-${con._id}` === selectedConv);
      return { _id: selectedConv, phone_number: c?.phone_number, contact_id: c };
    }
    return conversations.find((c) => c._id === selectedConv);
  }, [selectedConv, conversations, contacts, newChatPhone]);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 rounded-xl overflow-hidden border border-border bg-background">
      {/* Sidebar - conversations list */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${selectedConv ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground mb-3">Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations/contacts..."
              className="pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {convsLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-20" />
              No matches found.
            </div>
          ) : (
            filteredList.map((item) => {
              const displayInfo = item.contact_id || { name: item.phone_number || "Unknown", phone_number: item.phone_number };
              return (
              <button
                key={item._id}
                onClick={() => setSelectedConv(item._id)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors border-b border-border ${
                  selectedConv === item._id ? "bg-secondary" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {displayInfo.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm truncate">{displayInfo.name}</span>
                    {item.isConv && item.unread_count > 0 && (
                      <Badge className="h-5 min-w-[1.25rem] px-1 justify-center rounded-full text-[10px]">{item.unread_count}</Badge>
                    )}
                    {!item.isConv && <Badge variant="outline" className="text-[9px] h-4 px-1 opacity-50">Contact</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.last_message || (item.isConv ? "" : "Start a new chat")}</p>
                </div>
              </button>
              );
            })
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
                  {(selectedConvData.contact_id?.name || selectedConvData.phone_number || "?")?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedConvData.contact_id?.name || selectedConvData.phone_number}</h3>
                  <p className="text-xs text-muted-foreground">{selectedConvData.contact_id?.phone_number || selectedConvData.phone_number}</p>
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
                      <div key={msg._id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
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
