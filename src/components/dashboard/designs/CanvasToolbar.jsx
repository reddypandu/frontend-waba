import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Bold, Italic, AlignLeft, AlignCenter, AlignRight,
    ChevronUp, ChevronDown, Trash2, Copy, MoveUp, MoveDown,
    Type, Palette, Layers, Sparkles, Layout, Plus,
    Underline, Lock, Unlock,
    ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine,
    AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter,
    Moon, Sun, Ghost
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const FONT_FAMILIES = [
    "Inter", "Arial", "Georgia", "Verdana", "Times New Roman",
    "Courier New", "Impact", "Comic Sans MS"
];

const CanvasToolbar = ({ fabricRef, selectedObject, onUpdate }) => {
    if (!selectedObject || !fabricRef.current) return null;

    const type = selectedObject.type?.toLowerCase() || "";
    const isText = type === "i-text" || type === "text" || type === "textbox" || type === "itext";
    const isImage = type === "image" || type === "fabricimage";
    const isShape = ["rect", "circle", "triangle"].includes(type);
    const isGroup = type === "group" || type === "activeselection";

    const updateProp = (prop, value) => {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
        active.set(prop, value);
        fabricRef.current.renderAll();
        onUpdate();
    };

    const bringToFront = () => {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
        fabricRef.current.bringObjectToFront(active);
        fabricRef.current.renderAll();
        onUpdate();
    };

    const sendToBack = () => {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
        fabricRef.current.sendObjectToBack(active);
        fabricRef.current.renderAll();
        onUpdate();
    };

    const bringForward = () => {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
        fabricRef.current.bringObjectForward(active, true);
        fabricRef.current.renderAll();
        onUpdate();
    };

    const sendBackward = () => {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
        fabricRef.current.sendObjectBackwards(active, true);
        fabricRef.current.renderAll();
        onUpdate();
    };

    const handleGroup = () => {
        const active = fabricRef.current.getActiveObject();
        if (!active || active.type !== "activeSelection") return;
        const group = active.toGroup();
        fabricRef.current.setActiveObject(group);
        fabricRef.current.renderAll();
        onUpdate();
    };

    const handleUngroup = () => {
        const active = fabricRef.current.getActiveObject();
        if (!active || active.type !== "group") return;
        const activeSelection = active.toActiveSelection();
        fabricRef.current.setActiveObject(activeSelection);
        fabricRef.current.renderAll();
        onUpdate();
    };

    const deleteObject = () => {
        const active = fabricRef.current.getActiveObject();
        if (!active || active.lockMovementX) return; // Prevent deleting locked objects
        if (active.type === "activeSelection") {
            active.forEachObject((obj) => fabricRef.current.remove(obj));
        } else {
            fabricRef.current.remove(active);
        }
        fabricRef.current.discardActiveObject();
        fabricRef.current.renderAll();
        onUpdate();
    };

    const toggleLock = () => {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
        const isLocked = !active.lockMovementX;
        active.set({
            lockMovementX: isLocked,
            lockMovementY: isLocked,
            lockRotation: isLocked,
            lockScalingX: isLocked,
            lockScalingY: isLocked,
            hasControls: !isLocked,
        });
        fabricRef.current.renderAll();
        onUpdate();
    };

    const alignToCanvas = (type) => {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
        const canvas = fabricRef.current;

        switch (type) {
            case "left": active.set("left", 0); break;
            case "right": active.set("left", canvas.width - active.width * active.scaleX); break;
            case "top": active.set("top", 0); break;
            case "bottom": active.set("top", canvas.height - active.height * active.scaleY); break;
            case "h-center": canvas.centerObjectH(active); break;
            case "v-center": canvas.centerObjectV(active); break;
        }
        active.setCoords();
        canvas.renderAll();
        onUpdate();
    };

    const cloneObject = () => {
        const active = fabricRef.current.getActiveObject();
        if (!active) return;
        active.clone().then((cloned) => {
            cloned.set({
                left: cloned.left + 20,
                top: cloned.top + 20,
            });
            if (cloned.type === "activeSelection") {
                cloned.canvas = fabricRef.current;
                cloned.forEachObject((obj) => fabricRef.current.add(obj));
                cloned.setCoords();
            } else {
                fabricRef.current.add(cloned);
            }
            fabricRef.current.setActiveObject(cloned);
            fabricRef.current.renderAll();
            onUpdate();
        });
    };

    return (
        <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-card/95 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-2xl animate-in fade-in zoom-in duration-200">

            {/* Grouping */}
            <div className="flex items-center gap-1">
                {selectedObject.type === "activeSelection" && (
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] font-bold" onClick={handleGroup}>
                        <Layers className="h-3.5 w-3.5" /> Group
                    </Button>
                )}
                {selectedObject.type === "group" && (
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] font-bold" onClick={handleUngroup}>
                        <Layout className="h-3.5 w-3.5" /> Ungroup
                    </Button>
                )}
            </div>

            {(selectedObject.type === "activeSelection" || selectedObject.type === "group") && <div className="w-px h-6 bg-border mx-1" />}

            {/* Text Specific Controls */}
            {isText && (
                <>
                    <Select
                        value={selectedObject.fontFamily}
                        onValueChange={(v) => updateProp("fontFamily", v)}
                    >
                        <SelectTrigger className="w-[80px] h-9 text-xs border-none bg-secondary/50 hover:bg-secondary">
                            <SelectValue placeholder="Font" />
                        </SelectTrigger>
                        <SelectContent>
                            {FONT_FAMILIES.map(f => (
                                <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex items-center bg-secondary/50 rounded-lg px-1">
                        <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => updateProp("fontSize", Math.max(1, selectedObject.fontSize - 1))}
                        >-</Button>
                        <Input
                            className="w-10 h-7 text-center text-xs p-0 border-none bg-transparent"
                            value={selectedObject.fontSize || 20}
                            onChange={(e) => updateProp("fontSize", parseInt(e.target.value) || 1)}
                        />
                        <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => updateProp("fontSize", selectedObject.fontSize + 1)}
                        >+</Button>
                    </div>

                    <div className="flex items-center gap-0.5 ml-1">
                        <Button
                            variant={selectedObject.fontWeight === "bold" ? "secondary" : "ghost"}
                            size="icon" className="h-8 w-8"
                            onClick={() => updateProp("fontWeight", selectedObject.fontWeight === "bold" ? "normal" : "bold")}
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={selectedObject.underline ? "secondary" : "ghost"}
                            size="icon" className="h-8 w-8"
                            onClick={() => updateProp("underline", !selectedObject.underline)}
                        >
                            <Underline className="h-4 w-4" />
                        </Button>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Sparkles className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Letter Spacing</Label>
                                <Input 
                                    type="number" 
                                    value={selectedObject.charSpacing || 0} 
                                    onChange={(e) => updateProp("charSpacing", parseInt(e.target.value) || 0)} 
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Line Height</Label>
                                <Input 
                                    type="number" 
                                    step="0.1"
                                    value={selectedObject.lineHeight || 1.16} 
                                    onChange={(e) => updateProp("lineHeight", parseFloat(e.target.value) || 1)} 
                                    className="h-8 text-xs"
                                />
                            </div>
                        </PopoverContent>
                    </Popover>


                    <div className="flex items-center gap-0.5">
                        <Button
                            variant={selectedObject.textAlign === "left" ? "secondary" : "ghost"}
                            size="icon" className="h-8 w-8"
                            onClick={() => updateProp("textAlign", "left")}
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={selectedObject.textAlign === "center" ? "secondary" : "ghost"}
                            size="icon" className="h-8 w-8"
                            onClick={() => updateProp("textAlign", "center")}
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={selectedObject.textAlign === "right" ? "secondary" : "ghost"}
                            size="icon" className="h-8 w-8"
                            onClick={() => updateProp("textAlign", "right")}
                        >
                            <AlignRight className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}

            {/* Color Picker (Shared for text and shapes) */}
            {(isText || isShape) && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 relative group">
                            <div
                                className="w-5 h-5 rounded-full border border-border shadow-sm group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: selectedObject.fill }}
                            />
                            <Palette className="h-3 w-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground bg-card rounded-full" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3">
                        <div className="grid grid-cols-5 gap-2">
                            {["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280"].map(c => (
                                <button
                                    key={c}
                                    className="w-6 h-6 rounded-md border border-border hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c }}
                                    onClick={() => updateProp("fill", c)}
                                />
                            ))}
                        </div>
                        <div className="mt-3">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Custom Color</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="color"
                                    className="w-full h-8 rounded-md bg-transparent cursor-pointer"
                                    value={selectedObject.fill}
                                    onChange={(e) => updateProp("fill", e.target.value)}
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            {/* Global Properties (Opacity, Shadow, Radius) */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Sun className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Opacity</Label>
                        <Input 
                            type="range" min="0" max="1" step="0.01"
                            value={selectedObject.opacity || 1} 
                            onChange={(e) => updateProp("opacity", parseFloat(e.target.value))} 
                        />
                    </div>
                    {type === 'rect' && (
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Corner Radius</Label>
                            <Input 
                                type="number" 
                                value={selectedObject.rx || 0} 
                                onChange={(e) => {
                                    updateProp("rx", parseInt(e.target.value) || 0);
                                    updateProp("ry", parseInt(e.target.value) || 0);
                                }} 
                                className="h-8 text-xs"
                            />
                        </div>
                    )}
                    <div className="space-y-2 border-t pt-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Shadow</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Blur" type="number" className="h-8 text-xs" onChange={(e) => {
                                const active = fabricRef.current.getActiveObject();
                                if (active) {
                                    active.set("shadow", new fabric.Shadow({ blur: parseInt(e.target.value) || 0, color: "rgba(0,0,0,0.3)", offsetX: 5, offsetY: 5 }));
                                    fabricRef.current.renderAll();
                                    onUpdate();
                                }
                            }} />
                            <Input placeholder="Color" type="color" className="h-8 text-xs p-0 border-none" onChange={(e) => {
                                const active = fabricRef.current.getActiveObject();
                                if (active && active.shadow) {
                                    active.shadow.color = e.target.value;
                                    fabricRef.current.renderAll();
                                    onUpdate();
                                }
                            }} />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <AlignHorizontalJustifyCenter className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2">
                   <div className="grid grid-cols-3 gap-1">
                      <Button variant="ghost" size="icon" onClick={() => alignToCanvas('left')} title="Align Left"><ArrowLeftToLine className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => alignToCanvas('h-center')} title="Center Horizontal"><AlignHorizontalJustifyCenter className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => alignToCanvas('right')} title="Align Right"><ArrowRightToLine className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => alignToCanvas('top')} title="Align Top"><ArrowUpToLine className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => alignToCanvas('v-center')} title="Center Vertical"><AlignVerticalJustifyCenter className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => alignToCanvas('bottom')} title="Align Bottom"><ArrowDownToLine className="h-4 w-4" /></Button>
                   </div>
                </PopoverContent>
            </Popover>



            <div className="w-px h-6 bg-border mx-1" />

            {/* Layering & Actions */}
            <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={bringToFront} title="Bring to Front">
                    <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={bringForward} title="Bring Forward">
                    <MoveUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={sendBackward} title="Send Backward">
                    <MoveDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={sendToBack} title="Send to Back">
                    <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleLock} title={selectedObject.lockMovementX ? "Unlock" : "Lock"}>
                    {selectedObject.lockMovementX ? <Lock className="h-4 w-4 text-amber-500" /> : <Unlock className="h-4 w-4" />}
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cloneObject} title="Clone" disabled={selectedObject.lockMovementX}>
                    <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={deleteObject} title="Delete" disabled={selectedObject.lockMovementX}>
                    <Trash2 className="h-4 w-4" />
                </Button>

            </div>

        </div>
    );
};

export default CanvasToolbar;
