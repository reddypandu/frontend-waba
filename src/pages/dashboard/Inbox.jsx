import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Search,
  MessageSquare,
  ArrowLeft,
  Paperclip,
  LayoutTemplate,
  Check,
  Info,
  RefreshCw,
  ExternalLink,
  Phone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const messagesEndRef = React.useRef(null);

  const [activeTemplate, setActiveTemplate] = React.useState(null);
  const [templateMappings, setTemplateMappings] = React.useState({});
  const [sendingTemplate, setSendingTemplate] = React.useState(false);

  const [newChatPhone, setNewChatPhone] = React.useState(null);
  const scrollStateRef = React.useRef({
    conversationId: null,
    messageCount: 0,
  });

  const { data: convsData, isLoading: convsLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => apiGet("/api/whatsapp/conversations"),
    enabled: !!user,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: async () => {
      const data = await apiGet("/api/contacts");
      return data.contacts || [];
    },
    enabled: !!user,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const conversations = convsData?.conversations || [];
  const contacts = contactsData || [];

  const getCurrentTargetPhone = React.useCallback(() => {
    let to = newChatPhone;
    if (selectedConv && selectedConv !== "new") {
      if (selectedConv.startsWith("contact-")) {
        const c = contacts.find((con) => `contact-${con._id}` === selectedConv);
        to = c?.phone_number;
      } else {
        const conv = conversations.find((c) => c._id === selectedConv);
        to = conv?.contact_id?.phone_number || conv?.phone_number;
      }
    }
    return to;
  }, [selectedConv, newChatPhone, contacts, conversations]);

  const appendMessagesCache = React.useCallback(
    (conversationId, incoming) => {
      if (!conversationId || !incoming) return;
      queryClient.setQueryData(
        ["messages", user?.id, String(conversationId)],
        (old) => {
          const existing = old?.messages || [];
          if (existing.some((msg) => msg._id === incoming._id)) {
            return old || { messages: existing };
          }
          return { ...old, messages: [...existing, incoming] };
        },
      );
    },
    [queryClient, user?.id],
  );

  const isLoading =
    (convsLoading || contactsLoading) &&
    conversations.length === 0 &&
    contacts.length === 0;

  const { data: templates = [] } = useQuery({
    queryKey: ["templates-inbox", user?.id],
    queryFn: async () => {
      const ts = [];
      // Try to sync from Meta (optional)
      try {
        const metaRes = await apiPost("/api/whatsapp", {
          action: "sync_templates",
        });
        if (metaRes?.templates) ts.push(...metaRes.templates);
      } catch (e) {
        console.error("Meta sync failed", e);
      }

      // Always get local templates
      try {
        const localRes = await apiGet("/api/whatsapp/templates/all");
        const localTemplates = localRes?.templates || [];
        localTemplates.forEach((t) => {
          if (!ts.some((existing) => existing.name === t.name)) {
            ts.push(t);
          }
        });
      } catch (e) {
        console.error("Local fetch failed", e);
      }
      return ts;
    },
    enabled: !!user,
  });

  // Filtered list: show conversations first, then contacts who don't have a conversation yet
  const filteredList = React.useMemo(() => {
    let list = conversations.map((c) => ({ ...c, isConv: true }));
    const convPhones = new Set(
      conversations.map((c) => c.phone_number || c.contact_id?.phone_number),
    );

    // Add contacts who aren't in conversations
    contacts.forEach((contact) => {
      if (!convPhones.has(contact.phone_number)) {
        list.push({
          _id: `contact-${contact._id}`,
          contact_id: contact,
          phone_number: contact.phone_number,
          isConv: false,
        });
      }
    });

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (item) =>
          (item.contact_id?.name || "").toLowerCase().includes(s) ||
          (item.phone_number || "").includes(s) ||
          (item.last_message || "").toLowerCase().includes(s),
      );
    }
    return list;
  }, [conversations, contacts, search]);

  // Handle ?phone= parameter
  React.useEffect(() => {
    const phone = searchParams.get("phone");
    if (phone) {
      const existing = conversations.find(
        (c) => c.contact_id?.phone_number === phone || c.phone_number === phone,
      );
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

  const selectedConvData = React.useMemo(() => {
    if (selectedConv === "new")
      return {
        _id: "new",
        phone_number: newChatPhone,
        contact_id: { name: "New Chat", phone_number: newChatPhone },
      };
    if (selectedConv?.startsWith("contact-")) {
      const c = contacts.find((con) => `contact-${con._id}` === selectedConv);
      return {
        _id: selectedConv,
        phone_number: c?.phone_number,
        contact_id: c,
      };
    }
    return conversations.find((c) => c._id === selectedConv);
  }, [selectedConv, conversations, contacts, newChatPhone]);

  const selectedConversationId = React.useMemo(() => {
    if (!selectedConv || selectedConv === "new") return null;
    if (selectedConv.startsWith("contact-")) {
      const contactId = selectedConv.replace("contact-", "");
      const matched = conversations.find(
        (conv) =>
          String(conv.contact_id?._id) === contactId ||
          conv.phone_number === selectedConvData?.phone_number,
      );
      return matched?._id || null;
    }
    return selectedConv;
  }, [selectedConv, conversations, selectedConvData?.phone_number]);

  const { data: msgsData, isLoading: msgsLoading } = useQuery({
    queryKey: ["messages", user?.id, selectedConversationId],
    queryFn: () => apiGet(`/api/whatsapp/messages/${selectedConversationId}`),
    enabled: !!user && !!selectedConversationId,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const messages = msgsData?.messages || [];

  React.useLayoutEffect(() => {
    if (!selectedConv || msgsLoading) return;

    const previous = scrollStateRef.current;
    const isSameConversation = previous.conversationId === selectedConv;
    const hasNewMessage = messages.length > previous.messageCount;

    messagesEndRef.current?.scrollIntoView({
      behavior: isSameConversation && hasNewMessage ? "smooth" : "auto",
      block: "end",
    });

    scrollStateRef.current = {
      conversationId: selectedConv,
      messageCount: messages.length,
    };
  }, [messages.length, msgsLoading, selectedConv]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const to = getCurrentTargetPhone();
      return apiPost("/api/whatsapp", {
        action: "send_message",
        to,
        content: message,
      });
    },
    onSuccess: (data) => {
      const to = getCurrentTargetPhone();
      const outgoing = {
        _id: data.message_id || `temp-${Date.now()}`,
        conversation_id: data.conversation_id,
        direction: "outbound",
        message_type: "text",
        content: message,
        phone_number: to,
        status: "sent",
        createdAt: new Date().toISOString(),
      };

      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
      if (data.conversation_id) {
        appendMessagesCache(data.conversation_id, outgoing);
        queryClient.invalidateQueries({
          queryKey: ["messages", user?.id, data.conversation_id],
        });
        setSelectedConv(data.conversation_id);
      }
    },
    onError: (err) => {
      toast({
        title: "Send failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (!selectedConv || !conversations.length) return;

    if (selectedConv === "new" && newChatPhone) {
      const matched = conversations.find(
        (conv) =>
          conv.phone_number === newChatPhone ||
          conv.contact_id?.phone_number === newChatPhone,
      );
      if (matched) {
        setSelectedConv(matched._id);
        setNewChatPhone(null);
      }
      return;
    }

    if (selectedConv?.startsWith("contact-")) {
      const contactId = selectedConv.replace("contact-", "");
      const matched = conversations.find(
        (conv) =>
          String(conv.contact_id?._id) === contactId ||
          conv.phone_number === selectedConvData?.phone_number,
      );
      if (matched) {
        setSelectedConv(matched._id);
      }
    }
  }, [
    conversations,
    selectedConv,
    newChatPhone,
    selectedConvData?.phone_number,
  ]);

  React.useEffect(() => {
    if (
      !user ||
      !selectedConv ||
      selectedConv === "new" ||
      selectedConversationId
    ) {
      return;
    }

    if (selectedConv.startsWith("contact-")) {
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    }
  }, [user, selectedConv, selectedConversationId, queryClient, user?.id]);

  const handleSendTemplate = (tpl, mappings = {}) => {
    setSendingTemplate(true);
    let to = newChatPhone;
    if (selectedConv && selectedConv !== "new") {
      if (selectedConv.startsWith("contact-")) {
        const c = contacts.find((con) => `contact-${con._id}` === selectedConv);
        to = c?.phone_number;
      } else {
        const conv = conversations.find((c) => c._id === selectedConv);
        to = conv?.contact_id?.phone_number || conv?.phone_number;
      }
    }

    const vars = tpl.vars || [];
    const components = [];

    // Add header parameters if required
    if (tpl.headerFormat) {
      const mediaFormats = ["IMAGE", "VIDEO", "DOCUMENT"];
      const isMediaHeader = mediaFormats.includes(tpl.headerFormat);

      if (isMediaHeader) {
        const mediaType = tpl.headerFormat.toLowerCase();
        components.push({
          type: "header",
          parameters: [
            {
              type: mediaType,
              [mediaType]: { link: mappings.header_url || "" },
            },
          ],
        });
      } else if (
        tpl.headerFormat === "TEXT" &&
        (tpl.headerVars || []).length > 0
      ) {
        components.push({
          type: "header",
          parameters: tpl.headerVars.map((v) => ({
            type: "text",
            text: mappings[`h${v}`] || "",
          })),
        });
      }
    }

    // Add body parameters
    if (vars.length > 0) {
      components.push({
        type: "body",
        parameters: vars.map((v) => ({
          type: "text",
          text: mappings[v] || "",
        })),
      });
    }

    apiPost("/api/whatsapp", {
      action: "send_template",
      to,
      template_name: tpl.name,
      components,
      // Pass full template data and variable values to backend for storage
      template_full_data: {
        name: tpl.name,
        bodyText: tpl.bodyText,
        headerText: tpl.headerText,
        headerFormat: tpl.headerFormat,
        headerVars: tpl.headerVars,
        vars: tpl.vars,
        isMediaHeader: tpl.isMediaHeader,
      },
      template_variable_values: mappings,
      // Only set media_url if it's a media header, for consistent storage
      ...(tpl.isMediaHeader &&
        mappings.header_url && { media_url: mappings.header_url }),
    })
      .then((res) => {
        const outgoing = {
          _id: res.message_id || `temp-${Date.now()}`,
          conversation_id: res.conversation_id,
          direction: "outbound",
          message_type: "template",
          content: res.content || `[Template: ${tpl.name}]`,
          template_name: tpl.name,
          phone_number: to,
          template_snapshot: res.template_snapshot,
          media_url: res.media_url,
          // Store the full template data and variable values for rich display
          template_full_data: {
            name: tpl.name,
            bodyText: tpl.bodyText,
            headerText: tpl.headerText,
            headerFormat: tpl.headerFormat,
            headerVars: tpl.headerVars,
            vars: tpl.vars,
            isMediaHeader: tpl.isMediaHeader,
          },
          template_variable_values: mappings,
          status: "sent",
          createdAt: new Date().toISOString(),
        };

        queryClient.invalidateQueries({
          queryKey: ["conversations", user?.id],
        });
        if (res.conversation_id) {
          appendMessagesCache(res.conversation_id, outgoing);
          queryClient.invalidateQueries({
            queryKey: ["messages", user?.id, res.conversation_id],
          });
          setSelectedConv(res.conversation_id);
        }
        toast({ title: "Template sent!" });
        setActiveTemplate(null);
      })
      .catch((err) =>
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        }),
      )
      .finally(() => setSendingTemplate(false));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 rounded-xl overflow-hidden border border-border bg-background">
      {activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl border-primary/20 overflow-hidden text-card-foreground">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-base flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-primary" />
                Template Variables: {activeTemplate.name}
              </h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase mb-2">
                  Message Preview
                </p>
                {activeTemplate.isMediaHeader && (
                  <div className="w-full aspect-video rounded-lg bg-muted border border-border flex items-center justify-center mb-3 overflow-hidden">
                    {templateMappings.header_url ? (
                      activeTemplate.headerFormat === "IMAGE" ? (
                        <img
                          src={templateMappings.header_url}
                          className="w-full h-full object-cover"
                          alt="Header"
                        />
                      ) : activeTemplate.headerFormat === "VIDEO" ? (
                        <video
                          src={templateMappings.header_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 opacity-40">
                          <Paperclip className="w-6 h-6" />
                          <p className="text-[8px]">DOCUMENT</p>
                        </div>
                      )
                    ) : (
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        {activeTemplate.headerFormat} placeholder
                      </p>
                    )}
                  </div>
                )}
                {activeTemplate.headerFormat === "TEXT" &&
                  activeTemplate.headerText && (
                    <p className="text-xs font-bold text-foreground/90 border-b border-border pb-2 mb-2">
                      {activeTemplate.headerText.replace(
                        /\{\{(\d+)\}\}/g,
                        (match, p1) => {
                          return templateMappings[`h${p1}`]
                            ? `[${templateMappings[`h${p1}`]}]`
                            : match;
                        },
                      )}
                    </p>
                  )}
                <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {activeTemplate.bodyText.replace(
                    /\{\{(\d+)\}\}/g,
                    (match, p1) => {
                      return templateMappings[p1]
                        ? `[${templateMappings[p1]}]`
                        : match;
                    },
                  )}
                </p>
              </div>

              <div className="space-y-4">
                {activeTemplate.isMediaHeader && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary flex items-center gap-2 uppercase">
                      <Paperclip className="w-3 h-3" />
                      Header {activeTemplate.headerFormat} URL
                    </Label>
                    <Input
                      placeholder={`https://example.com/file.${activeTemplate.headerFormat.toLowerCase() === "image" ? "jpg" : activeTemplate.headerFormat.toLowerCase() === "video" ? "mp4" : "pdf"}`}
                      value={templateMappings.header_url || ""}
                      onChange={(e) =>
                        setTemplateMappings((prev) => ({
                          ...prev,
                          header_url: e.target.value,
                        }))
                      }
                      className="h-10 rounded-xl border-primary/20 focus:border-primary"
                    />
                  </div>
                )}
                {activeTemplate.headerFormat === "TEXT" &&
                  (activeTemplate.headerVars || []).map((v) => (
                    <div key={`h${v}`} className="space-y-1.5">
                      <Label className="text-xs font-bold text-primary">
                        Header Variable {"{{"}
                        {v}
                        {"}}"}
                      </Label>
                      <Input
                        placeholder={`Value for header variable ${v}...`}
                        value={templateMappings[`h${v}`] || ""}
                        onChange={(e) =>
                          setTemplateMappings((prev) => ({
                            ...prev,
                            [`h${v}`]: e.target.value,
                          }))
                        }
                        className="h-10 rounded-xl"
                      />
                    </div>
                  ))}
                {activeTemplate.vars.map((v) => (
                  <div key={v} className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      Body Variable {"{{"}
                      {v}
                      {"}}"}
                    </Label>
                    <Input
                      placeholder={`Body variable ${v}...`}
                      value={templateMappings[v] || ""}
                      onChange={(e) =>
                        setTemplateMappings((prev) => ({
                          ...prev,
                          [v]: e.target.value,
                        }))
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setActiveTemplate(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl font-bold"
                  disabled={
                    sendingTemplate ||
                    activeTemplate.vars.some((v) => !templateMappings[v]) ||
                    (activeTemplate.headerVars || []).some(
                      (v) => !templateMappings[`h${v}`],
                    ) ||
                    (activeTemplate.isMediaHeader &&
                      !templateMappings.header_url)
                  }
                  onClick={() =>
                    handleSendTemplate(activeTemplate, templateMappings)
                  }
                >
                  {sendingTemplate ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sidebar - conversations list */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${selectedConv ? "hidden md:flex" : "flex"}`}
      >
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
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-20" />
              No matches found.
            </div>
          ) : (
            filteredList.map((item) => {
              const displayInfo = item.contact_id || {
                name: item.phone_number || "Unknown",
                phone_number: item.phone_number,
              };
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
                      <span className="font-medium text-foreground text-sm truncate">
                        {displayInfo.name}
                      </span>
                      {item.isConv && item.unread_count > 0 && (
                        <Badge className="h-5 min-w-[1.25rem] px-1 justify-center rounded-full text-[10px]">
                          {item.unread_count}
                        </Badge>
                      )}
                      {!item.isConv && (
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1 opacity-50"
                        >
                          Contact
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.last_message ||
                        (item.isConv ? "" : "Start a new chat")}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div
        className={`flex-1 flex flex-col ${!selectedConv ? "hidden md:flex" : "flex"}`}
      >
        {selectedConv && selectedConvData ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConv(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {(
                  selectedConvData.contact_id?.name ||
                  selectedConvData.phone_number ||
                  "?"
                )
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground">
                    {selectedConvData.contact_id?.name ||
                      selectedConvData.phone_number}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedConvData.contact_id?.phone_number ||
                    selectedConvData.phone_number}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {msgsLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading messages...
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, index) => {
                    const isOutbound = msg.direction === "outbound";

                    const msgDate = new Date(msg.createdAt).toDateString();
                    const prevMsgDate =
                      index > 0
                        ? new Date(messages[index - 1].createdAt).toDateString()
                        : null;
                    const showDateSeparator = msgDate !== prevMsgDate;

                    let dateLabel = "";
                    if (showDateSeparator) {
                      const d = new Date(msg.createdAt);
                      const today = new Date().toDateString();
                      const yesterday = new Date(
                        Date.now() - 86400000,
                      ).toDateString();
                      if (msgDate === today) dateLabel = "Today";
                      else if (msgDate === yesterday) dateLabel = "Yesterday";
                      else
                        dateLabel = d.toLocaleDateString([], {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                    }

                    return (
                      <React.Fragment key={msg._id}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-6 sticky top-0 z-10">
                            <span className="bg-muted/80 backdrop-blur-sm text-muted-foreground text-[10px] font-bold px-4 py-1 rounded-lg border border-border shadow-sm uppercase tracking-tight">
                              {dateLabel}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`rounded-2xl text-sm flex flex-col ${msg.message_type === "template" ? "p-0 overflow-hidden max-w-[75%]" : "px-4 py-2.5 max-w-[70%]"} ${
                              isOutbound
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-secondary text-foreground rounded-bl-md"
                            }`}
                          >
                            {msg.message_type === "interactive" ||
                            msg.message_type === "button" ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">
                                  Button Reply
                                </span>
                                <span>{msg.content}</span>
                              </div>
                            ) : msg.message_type === "template" ? (
                              <div className="flex flex-col w-full">
                                <span
                                  className={`text-[10px] uppercase tracking-widest font-bold px-3 pt-2.5 pb-1 ${isOutbound ? "text-primary-foreground/60" : "text-muted-foreground/70"}`}
                                >
                                  Template
                                </span>
                                {(() => {
                                  let templateData = null;
                                  if (msg.template_snapshot) {
                                    templateData = msg.template_snapshot;
                                  } else if (msg.template_full_data && msg.template_variable_values) {
                                    const fd = msg.template_full_data;
                                    const vv = msg.template_variable_values;
                                    const mediaFormats = ["IMAGE", "VIDEO", "DOCUMENT"];
                                    const isMediaHeader = mediaFormats.includes(fd.headerFormat);
                                    
                                    templateData = {
                                      name: fd.name,
                                      header: fd.headerFormat && fd.headerFormat !== "none" ? {
                                        format: fd.headerFormat,
                                        text: fd.headerFormat === "TEXT" && fd.headerText 
                                          ? fd.headerText.replace(/\{\{(\d+)\}\}/g, (match, p1) => vv[`h${p1}`] || match)
                                          : fd.headerText || "",
                                        media_url: isMediaHeader ? (vv.header_url || msg.media_url) : null
                                      } : null,
                                      body: fd.bodyText 
                                        ? fd.bodyText.replace(/\{\{(\d+)\}\}/g, (match, p1) => vv[p1] || match)
                                        : "",
                                      footer: fd.footerText || "",
                                      buttons: fd.buttons || []
                                    };
                                  }

                                  if (!templateData) {
                                    return (
                                      <span className="px-3 py-2">
                                        {msg.content || `[Sent template: ${msg.template_name}]`}
                                      </span>
                                    );
                                  }

                                  const renderFormattedText = (text) => {
                                    if (!text) return text;
                                    return text.split(/(\*[^*]+\*|_[^_]+_)/g).map((part, i) => {
                                      if (part.startsWith('*') && part.endsWith('*')) return <strong key={i}>{part.slice(1, -1)}</strong>;
                                      if (part.startsWith('_') && part.endsWith('_')) return <em key={i}>{part.slice(1, -1)}</em>;
                                      return part;
                                    });
                                  };

                                  return (
                                    <div className={`flex flex-col ${isOutbound ? "text-primary-foreground" : "text-foreground"}`}>
                                      {/* Render Header */}
                                      {templateData.header && (
                                        <div>
                                          {["IMAGE", "VIDEO", "DOCUMENT"].includes(templateData.header.format) && (templateData.header.media_url || msg.media_url) ? (
                                            <div className="w-full overflow-hidden aspect-square">
                                              {templateData.header.format === "VIDEO" ? (
                                                <video
                                                  src={templateData.header.media_url || msg.media_url}
                                                  controls
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <img
                                                  src={templateData.header.media_url || msg.media_url}
                                                  className="w-full h-full object-cover"
                                                  alt="Template Media"
                                                />
                                              )}
                                            </div>
                                          ) : (
                                            templateData.header.format === "TEXT" && templateData.header.text && (
                                              <p className="text-sm font-bold opacity-100 px-3 pt-2 pb-1 border-b border-current/10">
                                                {templateData.header.text}
                                              </p>
                                            )
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* Render Body */}
                                      <p className="text-sm opacity-95 leading-relaxed whitespace-pre-wrap px-3 py-2">
                                        {renderFormattedText(templateData.body)}
                                      </p>

                                      {/* Render Footer */}
                                      {templateData.footer && (
                                        <p className={`text-[11px] px-3 pb-1 pt-1 border-t ${isOutbound ? "text-primary-foreground/60 border-primary-foreground/10" : "text-muted-foreground/70 border-border/50"}`}>
                                          {templateData.footer}
                                        </p>
                                      )}

                                      {/* Render Buttons */}
                                      {templateData.buttons && templateData.buttons.length > 0 && (
                                        <div className={`px-3 pb-2 pt-2 border-t flex flex-col gap-1.5 ${isOutbound ? "border-primary-foreground/15" : "border-border/60"}`}>
                                          {templateData.buttons.map((btn, idx) => {
                                            const isLink = btn.type === 'URL';
                                            const isPhone = btn.type === 'PHONE_NUMBER';
                                            const href = isLink ? btn.url : isPhone ? `tel:${btn.phone_number}` : undefined;
                                            
                                            return (
                                              <a
                                                key={idx}
                                                href={href}
                                                target={isLink ? "_blank" : undefined}
                                                rel={isLink ? "noopener noreferrer" : undefined}
                                                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors w-full ${
                                                  isOutbound 
                                                    ? "bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground" 
                                                    : "bg-muted hover:bg-muted/80 text-primary"
                                                }`}
                                              >
                                                {isLink && <ExternalLink className="w-3.5 h-3.5" />}
                                                {isPhone && <Phone className="w-3.5 h-3.5" />}
                                                {btn.text}
                                              </a>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              msg.content
                            )}
                            <div
                              className={`text-[9px] mt-1 self-end opacity-70 font-medium ${
                                msg.message_type === "template" ? "px-3 pb-2" : ""
                              } ${
                                isOutbound
                                  ? "text-primary-foreground/90"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          {msg.status === "failed" && msg.error_details && (
                            <div className="text-[10px] text-destructive mt-1 px-1 flex items-center gap-1">
                              <RefreshCw className="w-2.5 h-2.5" />
                              Failed: {msg.error_details}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (message.trim()) sendMutation.mutate();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="file"
                  id="media-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      toast({ title: "Media uploading coming soon!" });
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground"
                  onClick={() =>
                    document.getElementById("media-upload").click()
                  }
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground"
                    >
                      <LayoutTemplate className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 overflow-y-auto max-h-[300px]"
                  >
                    {templates.length === 0 && (
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        No templates available.
                      </div>
                    )}
                    {templates.map((t) => (
                      <DropdownMenuItem
                        key={String(t._id || t.id)}
                        onClick={() => {
                          const bodyText =
                            (Array.isArray(t.components)
                              ? t.components.find((c) => c.type === "BODY")
                                  ?.text
                              : t.body_text) || "";

                          const headerComp = Array.isArray(t.components)
                            ? t.components.find((c) => c.type === "HEADER")
                            : null;
                          const headerFormat = headerComp?.format || null; // "IMAGE", "VIDEO", "DOCUMENT", "TEXT"
                          const headerText = headerComp?.text || "";
                          const localUrl =
                            t.local_url ||
                            headerComp?.local_url ||
                            headerComp?.example?.header_handle?.[0] ||
                            headerComp?.example?.header_url ||
                            "";

                          const headerVars = (
                            headerText.match(/\{\{(\d+)\}\}/g) || []
                          )
                            .map((v) => parseInt(v.replace(/[{}]/g, "")))
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .sort((a, b) => a - b);

                          const vars = (bodyText.match(/\{\{(\d+)\}\}/g) || [])
                            .map((v) => parseInt(v.replace(/[{}]/g, "")))
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .sort((a, b) => a - b);

                          const mediaFormats = ["IMAGE", "VIDEO", "DOCUMENT"];
                          const isMediaHeader =
                            mediaFormats.includes(headerFormat);

                          if (
                            vars.length > 0 ||
                            headerVars.length > 0 ||
                            isMediaHeader
                          ) {
                            setActiveTemplate({
                              ...t,
                              bodyText,
                              vars,
                              headerFormat,
                              headerText,
                              headerVars,
                              isMediaHeader,
                            });
                            setTemplateMappings({ header_url: localUrl });
                          } else {
                            handleSendTemplate({
                              ...t,
                              bodyText,
                              vars,
                              headerFormat,
                              headerText,
                              headerVars,
                              isMediaHeader,
                            });
                          }
                        }}
                      >
                        {t.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted/50 border-input"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || sendMutation.isPending}
                  className="shrink-0 rounded-full h-10 w-10"
                >
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
              <p className="text-sm">
                Choose from your contacts to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
