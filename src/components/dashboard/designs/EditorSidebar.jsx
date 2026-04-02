import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Type, Image, Plus, Upload, Smile, Square, Circle, Triangle,
  Layout, Sparkles, Search, Rocket, Star, Heart
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as fabric from "fabric";
import EmojiPicker from 'emoji-picker-react';

const MOCK_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome Poster",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=200&fit=crop",
    data: {
      version: "5.3.0",
      objects: [
        { type: "rect", left: 0, top: 0, width: 500, height: 500, fill: "#f0f9ff" },
        { type: "i-text", left: 100, top: 150, text: "Welcome to\nConnectly", fontSize: 50, fontWeight: "bold", fill: "#0369a1", fontFamily: "Inter" },
        { type: "i-text", left: 100, top: 320, text: "Grow your business with WhatsApp", fontSize: 18, fill: "#0ea5e9", fontFamily: "Inter" }
      ]
    }
  },
  {
    id: "sale",
    name: "Flash Sale",
    thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop",
    data: {
      version: "5.3.0",
      objects: [
        { type: "rect", left: 0, top: 0, width: 500, height: 500, fill: "#fef2f2" },
        { type: "rect", left: 0, top: 0, width: 500, height: 100, fill: "#ef4444" },
        { type: "i-text", left: 150, top: 30, text: "MEGA SALE", fontSize: 36, fontWeight: "900", fill: "#ffffff", fontFamily: "Inter" },
        { type: "circle", left: 150, top: 150, radius: 100, fill: "#fca5a5" },
        { type: "i-text", left: 190, top: 220, text: "50%", fontSize: 60, fontWeight: "bold", fill: "#ffffff", fontFamily: "Inter" }
      ]
    }
  }
];

const GRAPHICS = [
  { id: "g1", name: "Modern Business", src: "/assets/graphics/business.png" },
  { id: "g2", name: "Marketing Rocket", icon: Rocket, color: "#3b82f6" },
  { id: "g3", name: "Premium Star", icon: Star, color: "#f59e0b" },
  { id: "g4", name: "Success Heart", icon: Heart, color: "#ec4899" },
  { id: "g5", name: "Sparkles", icon: Sparkles, color: "#8b5cf6" },
];

const EditorSidebar = ({ fabricRef, setSelectedObject }) => {
  const [activeTab, setActiveTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploads, setUploads] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileRef = useRef(null);

  React.useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/uploads-persist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUploads(data);
    } catch (err) {
      console.error("Failed to fetch uploads", err);
    }
  };

  const tabs = [
    { id: "templates", icon: Layout, label: "Design" },
    { id: "elements", icon: Square, label: "Elements" },
    { id: "media", icon: Image, label: "Uploads" },
    { id: "text", icon: Type, label: "Text" },
    { id: "emojis", icon: Smile, label: "Emojis" },
  ];

  const applyTemplate = (template) => {
    if (!fabricRef.current) return;
    fabricRef.current.loadFromJSON(template.data).then(() => {
      fabricRef.current.renderAll();
      toast({ title: "Template applied!", description: `${template.name} is now on your canvas.` });
    });
  };

  const addGraphic = (item) => {
    if (!fabricRef.current) return;
    if (item.src) {
      fabric.FabricImage.fromURL(item.src).then((img) => {
        img.scaleToWidth(200);
        fabricRef.current.add(img);
        fabricRef.current.centerObject(img);
        fabricRef.current.renderAll();
      });
    } else if (item.icon) {
      const iconText = new fabric.IText("★", {
        fontSize: 100,
        fill: item.color || "#000",
        fontFamily: "Arial",
      });
      fabricRef.current.add(iconText);
      fabricRef.current.centerObject(iconText);
      fabricRef.current.renderAll();
    }
  };

  const addText = (type) => {
    if (!fabricRef.current) return;
    let text;
    switch (type) {
      case "heading":
        text = new fabric.IText("Add a heading", {
          fontSize: 40,
          fontWeight: "bold",
          fontFamily: "Inter",
        });
        break;
      case "subheading":
        text = new fabric.IText("Add a subheading", {
          fontSize: 24,
          fontWeight: "semibold",
          fontFamily: "Inter",
        });
        break;
      default:
        text = new fabric.IText("Add body text", {
          fontSize: 16,
          fontFamily: "Inter",
        });
    }
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.centerObject(text);
    fabricRef.current.renderAll();
  };

  const addShape = (type) => {
    if (!fabricRef.current) return;
    let shape;
    const common = {
      fill: "#3b82f6",
      stroke: "#1d4ed8",
      strokeWidth: 0,
    };
    switch (type) {
      case "rect":
        shape = new fabric.Rect({ ...common, width: 100, height: 100, rx: 8, ry: 8 });
        break;
      case "circle":
        shape = new fabric.Circle({ ...common, radius: 50 });
        break;
      case "triangle":
        shape = new fabric.Triangle({ ...common, width: 100, height: 100 });
        break;
    }
    if (shape) {
      fabricRef.current.add(shape);
      fabricRef.current.setActiveObject(shape);
      fabricRef.current.centerObject(shape);
      fabricRef.current.renderAll();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;

    setLoadingMedia(true);
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const persistRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/uploads-persist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: file.name,
          url: uploadData.url,
          format: file.type,
          size: file.size
        })
      });

      const persisted = await persistRes.json();
      if (!persistRes.ok) {
        toast({ title: "Persistence Warning", description: "Image uploaded but could not be saved to your library", variant: "warning" });
      } else {
        setUploads(prev => [persisted, ...prev]);
        toast({ title: "Image saved to library" });
      }

      fabric.FabricImage.fromURL(uploadData.url, { crossOrigin: 'anonymous' }).then((img) => {
        img.scaleToWidth(200);
        if (fabricRef.current) {
          fabricRef.current.add(img);
          fabricRef.current.centerObject(img);
          fabricRef.current.renderAll();
          toast({ title: "Image added to design" });
        }
      }).catch(err => {
        toast({ title: "Canvas Error", description: "Image uploaded but couldn't be added to canvas", variant: "destructive" });
      });

    } catch (err) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoadingMedia(false);
      if (fileRef.current) fileRef.current.value = ""; // Clear file input
    }
  };

  const addMediaToCanvas = (url) => {
    if (!fabricRef.current) return;
    fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      img.scaleToWidth(200);
      fabricRef.current.add(img);
      fabricRef.current.centerObject(img);
      fabricRef.current.renderAll();
    });
  };

  const onEmojiClick = (emojiData) => {
    if (!fabricRef.current) return;
    const emojiText = new fabric.IText(emojiData.emoji, {
      fontSize: 80,
      fontFamily: "Apple Color Emoji, Segoe UI Emoji, Arial",
    });
    fabricRef.current.add(emojiText);
    fabricRef.current.centerObject(emojiText);
    fabricRef.current.setActiveObject(emojiText);
    fabricRef.current.renderAll();
  };

  return (
    <div className="w-full md:w-80 h-[45vh] md:h-full shrink-0 border-t md:border-t-0 md:border-r border-border bg-card flex flex-col shadow-lg z-20 overflow-hidden">
      <div className="flex border-b border-border bg-muted/30 p-1 m-2 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-md text-[9px] font-bold transition-all ${activeTab === tab.id
              ? "text-primary bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="px-4 py-2">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={`Search ${activeTab}...`}
            className="pl-9 h-9 text-xs bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pt-2">
        {activeTab === "templates" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Templates</h3>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all shadow-sm"
                >
                  <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-medium">{t.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "elements" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Shapes</h3>
              <div className="grid grid-cols-3 gap-2">
                {["rect", "circle", "triangle"].map(s => (
                  <button
                    key={s}
                    onClick={() => addShape(s)}
                    className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-secondary/30 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                  >
                    <div className={`w-8 h-8 bg-primary/20 border-2 border-primary/40 ${s === 'circle' ? 'rounded-full' : s === 'triangle' ? 'w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[28px] border-b-primary/40 bg-transparent border-none' : 'rounded-sm'} group-hover:scale-110 transition-transform`} />
                    <span className="text-[9px] font-medium capitalize">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Graphics</h3>
              <div className="grid grid-cols-2 gap-3">
                {GRAPHICS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => addGraphic(g)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-border bg-secondary/30 hover:bg-primary/5 hover:border-primary/30 transition-all group"
                  >
                    {g.src ? (
                      <img src={g.src} alt={g.name} className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                        <g.icon className="w-6 h-6" style={{ color: g.color }} />
                      </div>
                    )}
                    <span className="text-[9px] font-medium">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "text" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Styles</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-14 justify-start px-4 text-xl font-bold bg-secondary/30 border-dashed hover:border-primary/50"
                onClick={() => addText("heading")}
              >
                Add a heading
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 justify-start px-4 text-base font-semibold bg-secondary/30 border-dashed hover:border-primary/50"
                onClick={() => addText("subheading")}
              >
                Add a subheading
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 justify-start px-4 text-sm bg-secondary/30 border-dashed hover:border-primary/50"
                onClick={() => addText("body")}
              >
                Add body text
              </Button>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Uploads</h3>
            <div
              onClick={() => !loadingMedia && fileRef.current?.click()}
              className={`rounded-xl border-2 border-dashed border-primary/20 p-8 text-center cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all ${loadingMedia ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className={`w-6 h-6 text-primary ${loadingMedia ? 'animate-bounce' : ''}`} />
              </div>
              <p className="text-sm font-bold">{loadingMedia ? "Uploading..." : "Upload a file"}</p>
              <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG or WebP</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            <div className="grid grid-cols-2 gap-2 mt-4">
              {uploads.map(up => (
                <button
                  key={up._id}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all bg-secondary/10"
                  onClick={() => addMediaToCanvas(up.url)}
                >
                  <img src={up.url} alt={up.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "emojis" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Emojis</h3>
            <div className="emoji-picker-container rounded-xl overflow-hidden border border-border shadow-inner">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width="100%"
                height={350}
                lazyLoadEmojis={true}
                skinTonesDisabled
                searchDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorSidebar;
