import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Type,
  Image,
  Plus,
  Upload,
  Smile,
  Square,
  Circle,
  Triangle,
  Layout,
  Sparkles,
  Search,
  Rocket,
  Star,
  Heart,
  Layers,
  Home,
  Mic,
  ChevronDown,
  Check,
  MapPin,
  Music,
  Crown,
  PenTool,
  WandSparkles,
  Shapes,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as fabric from "fabric";
import EmojiPicker from "emoji-picker-react";
import ShapesPanel from "./ShapesPanel";
import LayersPanel from "./LayersPanel";
import PropertyPanel from "./PropertyPanel";
import AdvancedEffectsPanel from "./AdvancedEffectsPanel";

const MOCK_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome Poster",
    thumbnail:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=200&fit=crop",
    data: {
      version: "5.3.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 500,
          height: 500,
          fill: "#f0f9ff",
        },
        {
          type: "i-text",
          left: 100,
          top: 150,
          text: "Welcome to\nConnectly",
          fontSize: 50,
          fontWeight: "bold",
          fill: "#0369a1",
          fontFamily: "Inter",
        },
        {
          type: "i-text",
          left: 100,
          top: 320,
          text: "Grow your business with WhatsApp",
          fontSize: 18,
          fill: "#0ea5e9",
          fontFamily: "Inter",
        },
      ],
    },
  },
  {
    id: "sale",
    name: "Flash Sale",
    thumbnail:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop",
    data: {
      version: "5.3.0",
      objects: [
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 500,
          height: 500,
          fill: "#fef2f2",
        },
        {
          type: "rect",
          left: 0,
          top: 0,
          width: 500,
          height: 100,
          fill: "#ef4444",
        },
        {
          type: "i-text",
          left: 150,
          top: 30,
          text: "MEGA SALE",
          fontSize: 36,
          fontWeight: "900",
          fill: "#ffffff",
          fontFamily: "Inter",
        },
        { type: "circle", left: 150, top: 150, radius: 100, fill: "#fca5a5" },
        {
          type: "i-text",
          left: 190,
          top: 220,
          text: "50%",
          fontSize: 60,
          fontWeight: "bold",
          fill: "#ffffff",
          fontFamily: "Inter",
        },
      ],
    },
  },
];

const GRAPHICS = [
  { id: "check", name: "Success Check", icon: Check, color: "#86c92d" },
  { id: "pin", name: "Location Pin", icon: MapPin, color: "#ffffff" },
  { id: "rocket", name: "Marketing Rocket", icon: Rocket, color: "#3b82f6" },
  { id: "star", name: "Premium Star", icon: Star, color: "#f59e0b" },
  { id: "heart", name: "Success Heart", icon: Heart, color: "#ec4899" },
  { id: "sparkles", name: "Sparkles", icon: Sparkles, color: "#8b5cf6" },
];

const ELEMENT_SECTIONS = [
  {
    title: "Recently used",
    items: [
      { id: "check", label: "Check", icon: Check, color: "#86c92d" },
      { id: "pin", label: "Pin", icon: MapPin, color: "#f8fafc", dark: true },
      { id: "spark", label: "Spark", bg: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=300&fit=crop" },
    ],
  },
  {
    title: "Recommended for you",
    items: [
      { id: "check-2", label: "Check", icon: Check, color: "#18c876" },
      { id: "check-3", label: "Badge", icon: Check, color: "#8bd12d", ring: true },
      { id: "music", label: "Music", icon: Music, color: "#7c3aed" },
    ],
  },
  {
    title: "Browse categories",
    items: [
      { id: "shapes", label: "Shapes", icon: Shapes, color: "#14b8a6", tile: "from-cyan-400 to-teal-500" },
      { id: "stickers", label: "Stickers", icon: Smile, color: "#f59e0b", tile: "from-orange-400 to-rose-500" },
      { id: "uploads", label: "Photos", icon: Image, color: "#16a34a", tile: "from-emerald-400 to-lime-500" },
    ],
  },
];

const EditorSidebar = ({ fabricRef, setSelectedObject, selectedObject }) => {
  const [activeTab, setActiveTab] = useState("elements");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploads, setUploads] = useState([]);
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileRef = useRef(null);
  const token = localStorage.getItem("token");

  React.useEffect(() => {
    fetchUploads();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/designs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        const remoteTemplates = data.filter((d) => d.type === "template");
        if (remoteTemplates.length > 0) {
          // Merge with mock templates or replace them
          setTemplates(remoteTemplates);
        }
      }
    } catch (err) {
      console.error("Failed to fetch templates", err);
    }
  };

  const fetchUploads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/uploads-persist`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (Array.isArray(data)) setUploads(data);
    } catch (err) {
      console.error("Failed to fetch uploads", err);
    }
  };

  const tabs = [
    { id: "templates", icon: Layout, label: "Templates" },
    { id: "elements", icon: Sparkles, label: "Elements" },
    { id: "text", icon: Type, label: "Text" },
    { id: "brand", icon: Crown, label: "Brand" },
    { id: "ai", icon: WandSparkles, label: "Canva AI" },
    { id: "media", icon: Upload, label: "Uploads" },
    { id: "tools", icon: PenTool, label: "Tools" },
    { id: "layers", icon: Layers, label: "Layers" },
  ];

  const applyTemplate = (template) => {
    if (!fabricRef.current) return;
    fabricRef.current.loadFromJSON(template.data).then(() => {
      fabricRef.current.renderAll();
      toast({
        title: "Template applied!",
        description: `${template.name} is now on your canvas.`,
      });
    });
  };

  const addGraphic = (item) => {
    if (!fabricRef.current) return;
    if (!item.src) {
      addCanvaElement(item.id);
      return;
    }
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

  const addCanvaElement = (type) => {
    if (!fabricRef.current) return;
    let element;
    if (type.includes("check")) {
      element = new fabric.Path("M 20 75 L 45 100 L 105 20", {
        fill: "",
        stroke: "#86c92d",
        strokeWidth: 18,
        strokeLineCap: "round",
        strokeLineJoin: "round",
        scaleX: 1.5,
        scaleY: 1.5,
      });
    } else if (type === "pin") {
      element = new fabric.Group([
        new fabric.Circle({ radius: 42, fill: "#f8fafc", left: 0, top: 0 }),
        new fabric.Circle({ radius: 15, fill: "#111827", left: 27, top: 16 }),
        new fabric.Triangle({
          width: 70,
          height: 68,
          fill: "#f8fafc",
          left: 8,
          top: 58,
          angle: 180,
        }),
      ]);
    } else if (type === "music") {
      element = new fabric.IText("MUSIC", {
        fontSize: 34,
        fontWeight: "900",
        fill: "#7c3aed",
        fontFamily: "Inter",
      });
    } else if (type === "heart") {
      element = new fabric.IText("HEART", {
        fontSize: 34,
        fontWeight: "900",
        fill: "#ec4899",
        fontFamily: "Inter",
      });
    } else if (type === "rocket") {
      element = new fabric.IText("ROCKET", {
        fontSize: 28,
        fontWeight: "900",
        fill: "#3b82f6",
        fontFamily: "Inter",
      });
    } else if (type === "star" || type === "sparkles") {
      element = new fabric.Polygon(
        [
          { x: 50, y: 0 },
          { x: 62, y: 34 },
          { x: 98, y: 35 },
          { x: 68, y: 56 },
          { x: 79, y: 91 },
          { x: 50, y: 70 },
          { x: 21, y: 91 },
          { x: 32, y: 56 },
          { x: 2, y: 35 },
          { x: 38, y: 34 },
        ],
        { fill: type === "star" ? "#f59e0b" : "#8b5cf6" },
      );
    } else {
      element = new fabric.Rect({
        width: 120,
        height: 80,
        rx: 14,
        ry: 14,
        fill: "#8b5cf6",
      });
    }
    fabricRef.current.add(element);
    fabricRef.current.setActiveObject(element);
    fabricRef.current.centerObject(element);
    fabricRef.current.renderAll();
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
        text = new fabric.IText(
          type === "box" ? "Add a text box" : "Add body text",
          {
            fontSize: 16,
            fontFamily: "Inter",
          },
        );
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
        shape = new fabric.Rect({
          ...common,
          width: 100,
          height: 100,
          rx: 8,
          ry: 8,
        });
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

      const uploadRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const persistRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/uploads-persist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: file.name,
            url: uploadData.url,
            format: file.type,
            size: file.size,
          }),
        },
      );

      const persisted = await persistRes.json();
      if (!persistRes.ok) {
        toast({
          title: "Persistence Warning",
          description: "Image uploaded but could not be saved to your library",
          variant: "warning",
        });
      } else {
        setUploads((prev) => [persisted, ...prev]);
        toast({ title: "Image saved to library" });
      }

      fabric.FabricImage.fromURL(uploadData.url, { crossOrigin: "anonymous" })
        .then((img) => {
          img.scaleToWidth(200);
          if (fabricRef.current) {
            fabricRef.current.add(img);
            fabricRef.current.centerObject(img);
            fabricRef.current.renderAll();
            toast({ title: "Image added to design" });
          }
        })
        .catch((err) => {
          toast({
            title: "Canvas Error",
            description: "Image uploaded but couldn't be added to canvas",
            variant: "destructive",
          });
        });
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingMedia(false);
      if (fileRef.current) fileRef.current.value = ""; // Clear file input
    }
  };

  const addMediaToCanvas = (url) => {
    if (!fabricRef.current) return;
    fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then(
      (img) => {
        img.scaleToWidth(200);
        fabricRef.current.add(img);
        fabricRef.current.centerObject(img);
        fabricRef.current.renderAll();
      },
    );
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
    <div className="w-full md:w-[560px] xl:w-[620px] h-[45vh] md:h-full shrink-0 border-t md:border-t-0 md:border-r border-[#2a2d35] bg-[#15171d] text-white flex shadow-lg z-20 overflow-hidden">
      <div className="hidden md:flex w-20 shrink-0 flex-col items-center gap-1 bg-[#111318] py-4">
        <button
          className="mb-4 grid h-10 w-10 place-items-center rounded-xl text-white hover:bg-white/10"
          title="Home"
        >
          <Home className="h-5 w-5" />
        </button>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={`flex min-h-[62px] w-full flex-col items-center justify-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === tab.id
                ? "text-white bg-white/10"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex md:hidden overflow-x-auto border-b border-white/10 bg-[#111318] p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`mr-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
                activeTab === tab.id ? "bg-white/10 text-white" : "text-white/70"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

      <div className="px-5 py-5">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-focus-within:text-white transition-colors" />
          <Input
            placeholder={
              activeTab === "elements"
                ? "Describe your ideal element"
                : activeTab === "text"
                  ? "Search fonts and combinations"
                  : `Search ${activeTab}`
            }
            className="pl-12 pr-12 h-[72px] rounded-[22px] text-lg bg-[#1d2028] border border-purple-500/50 text-white placeholder:text-white/55 focus-visible:ring-1 focus-visible:ring-purple-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {activeTab === "elements" && (
            <Mic className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80" />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-6 space-y-6 pt-0">
        {activeTab === "shapes" && <ShapesPanel fabricRef={fabricRef} />}

        {activeTab === "templates" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
              Templates
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {templates
                .filter((t) =>
                  t.name.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((t) => (
                  <button
                    key={t.id || t._id}
                    onClick={() => applyTemplate(t)}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all shadow-sm"
                  >
                    <img
                      src={t.thumbnail || t.thumbnail_url}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white font-medium">
                        {t.name}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {activeTab === "elements" && (
          <div className="space-y-6">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
              <Button
                className="h-14 rounded-2xl bg-[#7c2ee6] text-base font-bold hover:bg-[#8b3ff0]"
                onClick={() => addCanvaElement("sparkles")}
              >
                <WandSparkles className="mr-2 h-5 w-5" />
                Generate
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-2xl border-white/20 bg-[#1d2028] text-white hover:bg-white/10 hover:text-white"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
              <Button
                className="h-14 rounded-2xl bg-[#7c2ee6] text-base font-bold hover:bg-[#8b3ff0]"
                onClick={() => setSearchQuery(searchQuery)}
              >
                Search
              </Button>
            </div>

            {ELEMENT_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white/85">
                    {section.title}
                  </h3>
                  <button className="text-sm font-bold text-white/75 hover:text-white">
                    See all
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addCanvaElement(item.id)}
                      className={`group relative aspect-square overflow-hidden rounded-lg bg-[#1f222b] transition-all hover:bg-[#292d38] ${
                        item.tile ? `bg-gradient-to-br ${item.tile}` : ""
                      }`}
                      title={item.label}
                    >
                      {item.bg ? (
                        <img
                          src={item.bg}
                          alt={item.label}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          {item.ring && (
                            <div className="absolute h-20 w-20 rounded-full border-[9px] border-white/60" />
                          )}
                          <item.icon
                            className={`relative h-20 w-20 transition-transform group-hover:scale-110 ${
                              item.dark ? "drop-shadow-xl" : ""
                            }`}
                            style={{ color: item.color }}
                            strokeWidth={4}
                          />
                        </div>
                      )}
                      <Crown className="absolute bottom-2 left-2 h-4 w-4 rounded-full bg-[#242832] p-0.5 text-white/70" />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                Shapes
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {["rect", "circle", "triangle"].map((s) => (
                  <button
                    key={s}
                    onClick={() => addShape(s)}
                    className="aspect-square flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#1f222b] hover:bg-white/10 transition-all group"
                  >
                    <div
                      className={`w-8 h-8 bg-primary/20 border-2 border-primary/40 ${s === "circle" ? "rounded-full" : s === "triangle" ? "w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[28px] border-b-primary/40 bg-transparent border-none" : "rounded-sm"} group-hover:scale-110 transition-transform`}
                    />
                    <span className="text-[9px] font-medium capitalize text-white/80">
                      {s}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                Graphics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {GRAPHICS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => addGraphic(g)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-white/10 bg-[#1f222b] hover:bg-white/10 transition-all group"
                  >
                    {g.src ? (
                      <img
                        src={g.src}
                        alt={g.name}
                        className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                        <g.icon
                          className="w-6 h-6"
                          style={{ color: g.color }}
                        />
                      </div>
                    )}
                    <span className="text-[9px] font-medium text-white/80">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "text" && (
          <div className="space-y-4">
            <Button
              className="h-[60px] w-full rounded-2xl bg-[#7c2ee6] py-6 text-lg font-bold hover:bg-[#8b3ff0]"
              onClick={() => addText("box")}
            >
              <Type className="mr-3 h-6 w-6" />
              Add a text box
            </Button>
            <Button
              variant="outline"
              className="h-[60px] w-full rounded-2xl border-white/20 bg-[#1d2028] py-6 text-lg font-bold text-white hover:bg-white/10 hover:text-white"
              onClick={() => addText("body")}
            >
              <PenTool className="mr-3 h-5 w-5" />
              Magic Write
            </Button>
            <div className="flex items-center justify-between pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">
                The Patterns Company
              </h3>
              <button className="text-sm font-bold text-white/80 hover:text-white">
                Edit
              </button>
            </div>
            <button
              className="w-full rounded-2xl border border-white/10 bg-[#1d2028] p-6 text-left text-4xl font-black leading-none text-white hover:bg-white/10"
              onClick={() => addText("heading")}
            >
              THE PATTERNS
              <br />
              COMPANY
            </button>
            <button
              className="w-full rounded-2xl border border-white/10 bg-[#1d2028] p-6 text-left text-3xl font-black text-white hover:bg-white/10"
              onClick={() => addText("subheading")}
            >
              WE CREATE FUTURE
            </button>
            <h3 className="pt-2 text-lg font-bold text-white/85">
              Default text styles
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-14 justify-start rounded-2xl border-white/10 bg-[#1d2028] px-4 text-xl font-bold text-white hover:bg-white/10 hover:text-white"
                onClick={() => addText("heading")}
              >
                Add a heading
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 justify-start rounded-2xl border-white/10 bg-[#1d2028] px-4 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                onClick={() => addText("subheading")}
              >
                Add a subheading
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 justify-start rounded-2xl border-white/10 bg-[#1d2028] px-4 text-sm text-white hover:bg-white/10 hover:text-white"
                onClick={() => addText("body")}
              >
                Add body text
              </Button>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
              Uploads
            </h3>
            <div
              onClick={() => !loadingMedia && fileRef.current?.click()}
              className={`rounded-xl border-2 border-dashed border-primary/20 p-8 text-center cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all ${loadingMedia ? "opacity-50 cursor-wait" : ""}`}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload
                  className={`w-6 h-6 text-primary ${loadingMedia ? "animate-bounce" : ""}`}
                />
              </div>
              <p className="text-sm font-bold">
                {loadingMedia ? "Uploading..." : "Upload a file"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                PNG, JPG or WebP
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="grid grid-cols-2 gap-2 mt-4">
              {uploads.map((up) => (
                <button
                  key={up._id}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all bg-secondary/10"
                  onClick={() => addMediaToCanvas(up.url)}
                >
                  <img
                    src={up.url}
                    alt={up.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
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
            <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
              Emojis
            </h3>
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

        {activeTab === "layers" && (
          <LayersPanel
            fabricRef={fabricRef}
            selectedObject={selectedObject}
            onUpdate={() => {
              const active = fabricRef.current?.getActiveObject();
              setSelectedObject(
                active
                  ? { ...active.toObject(["id", "name"]), _ts: Date.now() }
                  : null,
              );
            }}
          />
        )}

        {activeTab === "brand" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white/85">Brand kit</h3>
            <div className="rounded-2xl border border-white/10 bg-[#1d2028] p-5">
              <div className="mb-4 h-14 w-14 rounded-full bg-black ring-2 ring-purple-500" />
              <p className="text-sm font-bold text-white">The Patterns Company</p>
              <p className="text-xs text-white/55">Logos, colors and reusable campaign styles.</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {["#86c92d", "#111827", "#ffffff", "#7c2ee6", "#ef4444"].map((color) => (
                <button
                  key={color}
                  className="h-12 rounded-xl border border-white/10"
                  style={{ backgroundColor: color }}
                  onClick={() => selectedObject && fabricRef.current?.getActiveObject()?.set("fill", color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white/85">Canva AI</h3>
            {["Generate a school campaign banner", "Remove image background", "Write WhatsApp promo copy"].map((prompt) => (
              <button
                key={prompt}
                className="w-full rounded-2xl border border-white/10 bg-[#1d2028] p-4 text-left text-sm font-bold text-white hover:bg-white/10"
                onClick={() => setSearchQuery(prompt)}
              >
                <WandSparkles className="mr-2 inline h-4 w-4 text-purple-300" />
                {prompt}
              </button>
            ))}
          </div>
        )}

        {activeTab === "tools" && selectedObject && (
          <>
            <PropertyPanel
              fabricRef={fabricRef}
              selectedObject={selectedObject}
              onUpdate={() => {
                const active = fabricRef.current?.getActiveObject();
                setSelectedObject(
                  active
                    ? { ...active.toObject(["id", "name"]), _ts: Date.now() }
                    : null,
                );
              }}
            />
            <AdvancedEffectsPanel
              fabricRef={fabricRef}
              selectedObject={selectedObject}
              onUpdate={() => {
                const active = fabricRef.current?.getActiveObject();
                setSelectedObject(
                  active
                    ? { ...active.toObject(["id", "name"]), _ts: Date.now() }
                    : null,
                );
              }}
            />
          </>
        )}

        {activeTab === "tools" && !selectedObject && (
          <div className="text-center py-8 text-white/60">
            <p className="text-sm">Select an object to edit properties</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default EditorSidebar;
