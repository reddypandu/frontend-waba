import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, ChevronDown, Paperclip, Image, Video, File } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiPost } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ChatAttachmentBar = ({ onSendTemplate, onSendMedia }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mediaDialog, setMediaDialog] = useState(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");

  const { data: metaTemplates = [], isLoading } = useQuery({
    queryKey: ["meta-templates", user?.id],
    queryFn: async () => {
      const data = await apiPost("/api/whatsapp", { action: "get_templates" });
      return (data?.data || []).filter((t) => t.status === "APPROVED");
    },
    enabled: !!user && open,
  });

  const handleMediaSend = () => {
    if (mediaDialog && mediaUrl.trim()) {
      onSendMedia(mediaDialog, mediaUrl.trim(), mediaCaption.trim() || undefined);
      setMediaDialog(null);
      setMediaUrl("");
      setMediaCaption("");
    }
  };

  const mediaLabel = mediaDialog === "image" ? "Image" : mediaDialog === "video" ? "Video" : "Document";

  return (
    <>
      <div className="flex items-center gap-1 mr-2">
        {/* Templates dropdown */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <FileText className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Approved Templates</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoading ? (
              <div className="py-3 text-center text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                Loading...
              </div>
            ) : metaTemplates.length === 0 ? (
              <div className="py-3 text-center text-muted-foreground text-sm">No approved templates</div>
            ) : (
              metaTemplates.map((t, i) => {
                const body = t.components?.find((c) => c.type === "BODY")?.text || "";
                return (
                  <DropdownMenuItem
                    key={t.name + i}
                    onClick={() => onSendTemplate(t.name, body, t.language || "en")}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate font-medium text-sm">{t.name}</span>
                    <Badge variant="outline" className="text-[10px] scale-90">{t.language}</Badge>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Media dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Paperclip className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Send Media</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setMediaDialog("image")} className="cursor-pointer gap-2">
              <Image className="h-4 w-4" />
              <span>Image</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMediaDialog("video")} className="cursor-pointer gap-2">
              <Video className="h-4 w-4" />
              <span>Video</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMediaDialog("document")} className="cursor-pointer gap-2">
              <File className="h-4 w-4" />
              <span>Document</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Media URL dialog */}
      <Dialog open={!!mediaDialog} onOpenChange={(v) => { if (!v) { setMediaDialog(null); setMediaUrl(""); setMediaCaption(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send {mediaLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="media-url">{mediaLabel} URL</Label>
              <Input
                id="media-url"
                placeholder={`https://example.com/${mediaDialog === "image" ? "photo.jpg" : mediaDialog === "video" ? "video.mp4" : "file.pdf"}`}
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter a publicly accessible URL for the {mediaLabel?.toLowerCase()}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-caption">Caption (optional)</Label>
              <Textarea
                id="media-caption"
                placeholder="Add a caption..."
                value={mediaCaption}
                onChange={e => setMediaCaption(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setMediaDialog(null); setMediaUrl(""); setMediaCaption(""); }}>Cancel</Button>
            <Button onClick={handleMediaSend} disabled={!mediaUrl.trim()}>Send {mediaLabel}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatAttachmentBar;
