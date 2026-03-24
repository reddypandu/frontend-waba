import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: "Hi there 👋 How can I help you today? Ask me anything about our WhatsApp marketing platform.",
};

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simple FAQ-style responses
    const reply = getAutoReply(text);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: reply },
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] max-h-[calc(100vh-3rem)] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold text-sm">Chat with us</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-80" aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-muted/30">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-muted-foreground rounded-2xl rounded-bl-md px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 p-3 border-t border-border"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 text-sm"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="shrink-0" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

function getAutoReply(text) {
  const t = text.toLowerCase();
  if (t.includes("price") || t.includes("pricing") || t.includes("cost") || t.includes("plan"))
    return "We offer flexible plans starting from a free tier. Check our Pricing section on the homepage for details, or reach out to our sales team for custom enterprise plans.";
  if (t.includes("whatsapp") || t.includes("setup") || t.includes("connect"))
    return "Setting up WhatsApp is easy. After signing up, go to Dashboard → WhatsApp Setup and follow the guided steps to connect your WhatsApp Business account.";
  if (t.includes("template") || t.includes("message"))
    return "You can create and manage message templates from Dashboard → Templates. Templates need Meta approval before use in campaigns.";
  if (t.includes("campaign") || t.includes("bulk") || t.includes("broadcast"))
    return "Create campaigns from Dashboard → Campaigns. Select your contacts, choose a template, and launch! You can track delivery and read rates in real-time.";
  if (t.includes("contact") || t.includes("import"))
    return "Manage contacts from Dashboard → Contacts. You can add them manually or import via Excel/CSV file.";
  if (t.includes("support") || t.includes("help") || t.includes("issue"))
    return "Our support team is here to help! Email us at support@example.com or raise a ticket from Settings → Support in your dashboard.";
  if (t.includes("hi") || t.includes("hello") || t.includes("hey"))
    return "Hello 😊 How can I assist you today? Feel free to ask about pricing, setup, campaigns, or anything else!";
  return "Thanks for your question! For detailed assistance, please sign up and explore the dashboard, or contact our support team. Is there anything specific I can help with?";
}

export default ChatbotWidget;
