import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Type, Palette, Image, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Plus, Minus, Upload, Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const FONT_OPTIONS = [
  "Plus Jakarta Sans", "Arial", "Georgia", "Verdana", "Times New Roman",
  "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS",
];

const EditorSidebar = ({
  elements, onUpdateElement, onAddElement, onRemoveElement,
  selectedElementId, onSelectElement,
  overlayOpacity, onOverlayOpacityChange, overlayColor, onOverlayColorChange,
  accentColor, onAccentColorChange,
  logoUrl, onLogoUrlChange, uploading, onUploadLogo,
  logoSettings, onLogoSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState("text");
  const fileRef = useRef(null);

  const selected = elements.find((e) => e.id === selectedElementId);

  const tabs = [
    { id: "text", icon: Type, label: "Text" },
    { id: "style", icon: Palette, label: "Style" },
    { id: "media", icon: Image, label: "Media" },
  ];

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "File too large (max 5MB)", variant: "destructive" });
      return;
    }
    onUploadLogo(f);
  };

  return (
    <div className="w-80 shrink-0 border-r border-border bg-card overflow-y-auto">
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-5">
        {activeTab === "text" && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Text Elements</Label>
                <Button variant="ghost" size="sm" onClick={() => onAddElement("extra")} className="h-7 text-[10px] gap-1 px-2">
                  <Plus className="w-3 h-3" /> Add Text
                </Button>
              </div>
              <div className="space-y-1">
                {elements.map((el) => (
                  <button
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                      selectedElementId === el.id
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-secondary/50 text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="truncate flex-1">
                      {el.type === "extra" ? "✏️" : el.type === "heading" ? "H" : el.type === "subheading" ? "P" : "F"}{" "}
                      {el.text.slice(0, 25) || "(empty)"}
                    </span>
                    <Trash2
                      className="w-3 h-3 text-destructive shrink-0 ml-2 hover:scale-110"
                      onClick={(e) => { e.stopPropagation(); onRemoveElement(el.id); }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {selected && (
              <div className="space-y-3 border-t border-border pt-4">
                <Label>{selected.type === "extra" ? "Extra Text" : selected.type}</Label>
                {selected.type === "subheading" ? (
                  <Textarea
                    value={selected.text}
                    onChange={(e) => onUpdateElement(selected.id, { text: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={selected.text}
                    onChange={(e) => onUpdateElement(selected.id, { text: e.target.value })}
                  />
                )}

                <div className="flex items-center gap-1.5">
                  <Button
                    variant={selected.bold ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onUpdateElement(selected.id, { bold: !selected.bold })}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={selected.italic ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onUpdateElement(selected.id, { italic: !selected.italic })}
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </Button>
                  <div className="h-5 w-px bg-border mx-1" />
                  {(["left", "center", "right"]).map((a) => (
                    <Button
                      key={a}
                      variant={selected.align === a ? "default" : "outline"}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onUpdateElement(selected.id, { align: a })}
                    >
                      {a === "left" ? <AlignLeft className="w-3.5 h-3.5" /> : a === "center" ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-[10px] w-10 uppercase text-muted-foreground">Size</Label>
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => onUpdateElement(selected.id, { fontSize: Math.max(8, selected.fontSize - 1) })}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-xs font-mono w-6 text-center">{selected.fontSize}</span>
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => onUpdateElement(selected.id, { fontSize: Math.min(72, selected.fontSize + 1) })}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-[10px] w-10 uppercase text-muted-foreground">Font</Label>
                  <select
                    value={selected.fontFamily}
                    onChange={(e) => onUpdateElement(selected.id, { fontFamily: e.target.value })}
                    className="flex-1 h-7 text-xs rounded-md border border-input bg-background px-2 text-foreground"
                  >
                    {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-[10px] w-10 uppercase text-muted-foreground">Color</Label>
                  <input type="color" value={selected.color} onChange={(e) => onUpdateElement(selected.id, { color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={selected.color} onChange={(e) => onUpdateElement(selected.id, { color: e.target.value })} className="h-7 text-xs font-mono" />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "style" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Overlay</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] w-10 uppercase text-muted-foreground">Color</Label>
                  <input type="color" value={overlayColor} onChange={(e) => onOverlayColorChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <Input value={overlayColor} onChange={(e) => onOverlayColorChange(e.target.value)} className="h-7 text-xs font-mono" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] uppercase text-muted-foreground">Opacity</Label>
                    <span className="text-xs font-mono">{overlayOpacity}%</span>
                  </div>
                  <input type="range" min={0} max={80} value={overlayOpacity} onChange={(e) => onOverlayOpacityChange(Number(e.target.value))} className="w-full accent-primary" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={accentColor} onChange={(e) => onAccentColorChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                <Input value={accentColor} onChange={(e) => onAccentColorChange(e.target.value)} className="h-7 text-xs font-mono" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Logo</Label>
              <div
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border-2 border-dashed border-border p-6 text-center cursor-pointer hover:bg-primary/5 transition-colors"
              >
                <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium mt-2">{uploading ? "Uploading..." : "Click to upload"}</p>
                <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG, WebP • Max 5MB</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="space-y-2">
              <Label>Or paste URL</Label>
              <Input
                placeholder="https://your-logo.png"
                value={logoUrl}
                onChange={(e) => onLogoUrlChange(e.target.value)}
              />
            </div>

            {logoUrl && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Preview & Balance</Label>
                  <div className="rounded-lg border border-border p-3 bg-secondary/30 flex items-center gap-3">
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Active Logo</p>
                      <p className="text-xs truncate">Current selection</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => onLogoUrlChange("")}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label>Logo Settings</Label>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase text-muted-foreground">
                        <span>Width</span>
                        <span>{logoSettings.width}px</span>
                      </div>
                      <input type="range" min={24} max={200} value={logoSettings.width} onChange={(e) => onLogoSettingsChange({ width: Number(e.target.value) })} className="w-full accent-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase text-muted-foreground">
                        <span>Height</span>
                        <span>{logoSettings.height}px</span>
                      </div>
                      <input type="range" min={24} max={200} value={logoSettings.height} onChange={(e) => onLogoSettingsChange({ height: Number(e.target.value) })} className="w-full accent-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase text-muted-foreground">
                        <span>Rounding</span>
                        <span>{logoSettings.borderRadius}px</span>
                      </div>
                      <input type="range" min={0} max={100} value={logoSettings.borderRadius} onChange={(e) => onLogoSettingsChange({ borderRadius: Number(e.target.value) })} className="w-full accent-primary" />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Tip: Drag logo on canvas to reposition</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorSidebar;
