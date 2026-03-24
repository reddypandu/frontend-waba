import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, Video, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPT_MAP = {
  image: "image/jpeg,image/png",
  video: "video/mp4,video/3gpp",
  document: "application/pdf",
};

const SIZE_LIMITS = {
  image: 5 * 1024 * 1024,     // 5 MB
  video: 16 * 1024 * 1024,    // 16 MB
  document: 100 * 1024 * 1024, // 100 MB
};

const getLabels = (type) => {
  switch (type) {
    case 'image': return { icon: <ImageIcon className="h-8 w-8 text-primary/40" />, label: "Upload Image", hint: "JPEG or PNG (Max 5MB)" };
    case 'video': return { icon: <Video className="h-8 w-8 text-primary/40" />, label: "Upload Video", hint: "MP4 or 3GP (Max 16MB)" };
    case 'document': return { icon: <FileText className="h-8 w-8 text-primary/40" />, label: "Upload Document", hint: "PDF only (Max 100MB)" };
    default: return { icon: <Upload className="h-8 w-8 text-primary/40" />, label: "Upload File", hint: "Select a file" };
  }
};

const HeaderMediaUpload = ({ type, file, url, onFileChange, onUrlChange }) => {
  const inputRef = React.useRef(null);
  const [mode, setMode] = React.useState("upload");
  const info = getLabels(type);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > SIZE_LIMITS[type]) {
      alert(`File too large. Max ${(SIZE_LIMITS[type] / (1024 * 1024)).toFixed(0)} MB`);
      return;
    }
    onFileChange(f);
    onUrlChange("");
  };

  const removeFile = () => {
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mt-2 space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
        >
           Upload File
        </Button>
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("url")}
        >
          URL
        </Button>
      </div>

      {mode === "upload" ? (
        <div className="space-y-2">
          {file ? (
            <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-secondary/30">
              {info.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border-2 border-dashed border-border p-6 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
            >
              <div className="flex justify-center mb-2">{info.icon}</div>
              <p className="text-sm font-medium">{info.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{info.hint}</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_MAP[type]}
            className="hidden"
            onChange={handleFile}
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>Media URL</Label>
          <Input
            value={url}
            onChange={(e) => { onUrlChange(e.target.value); onFileChange(null); }}
            placeholder={`https://example.com/sample.${type === "image" ? "jpg" : type === "video" ? "mp4" : "pdf"}`}
          />
          <p className="text-xs text-muted-foreground">Provide a publicly accessible URL for the {type}</p>
        </div>
      )}
    </div>
  );
};

export default HeaderMediaUpload;
