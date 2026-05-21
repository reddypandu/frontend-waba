import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter, Palette } from "lucide-react";
import * as fabric from "fabric";

const AdvancedEffectsPanel = ({ fabricRef, selectedObject, onUpdate }) => {
  if (!selectedObject || !fabricRef.current) return null;

  const isImage =
    selectedObject.type === "image" || selectedObject.type === "fabricimage";
  const isShape = ["rect", "circle", "triangle", "polygon"].includes(
    selectedObject.type,
  );
  const isText =
    selectedObject.type === "i-text" || selectedObject.type === "text";

  const updateProp = (prop, value) => {
    const active = fabricRef.current.getActiveObject();
    if (!active) return;
    active.set(prop, value);
    fabricRef.current.renderAll();
    onUpdate();
  };

  const applyImageFilter = (filterType, value) => {
    if (!isImage) return;
    const active = fabricRef.current.getActiveObject();
    if (!active || !active.filters) return;

    active.filters = [];

    if (filterType === "brightness") {
      active.filters.push(
        new fabric.Image.filters.Brightness({ brightness: value }),
      );
    } else if (filterType === "contrast") {
      active.filters.push(
        new fabric.Image.filters.Contrast({ contrast: value }),
      );
    } else if (filterType === "saturation") {
      active.filters.push(
        new fabric.Image.filters.Saturation({ saturation: value }),
      );
    } else if (filterType === "blur") {
      active.filters.push(new fabric.Image.filters.Blur({ blur: value }));
    } else if (filterType === "grayscale") {
      active.filters.push(new fabric.Image.filters.Grayscale());
    } else if (filterType === "sepia") {
      active.filters.push(new fabric.Image.filters.Sepia());
    }

    active.applyFilters();
    fabricRef.current.renderAll();
    onUpdate();
  };

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <h3 className="text-xs font-bold uppercase text-muted-foreground">
        Effects & Style
      </h3>

      {/* Stroke Controls */}
      {isShape && (
        <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
          <h4 className="text-xs font-semibold text-foreground">Stroke</h4>

          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">
              Stroke Width
            </Label>
            <Input
              type="number"
              min="0"
              value={selectedObject.strokeWidth || 0}
              onChange={(e) =>
                updateProp("strokeWidth", parseInt(e.target.value) || 0)
              }
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">
              Stroke Color
            </Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={selectedObject.stroke || "#000000"}
                onChange={(e) => updateProp("stroke", e.target.value)}
                className="h-8 w-12 rounded-md cursor-pointer"
              />
              <Input
                value={selectedObject.stroke || "#000000"}
                onChange={(e) => updateProp("stroke", e.target.value)}
                className="h-8 text-xs flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Text Stroke */}
      {isText && (
        <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
          <h4 className="text-xs font-semibold text-foreground">Text Stroke</h4>

          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">
              Stroke Width
            </Label>
            <Input
              type="number"
              min="0"
              value={selectedObject.strokeWidth || 0}
              onChange={(e) =>
                updateProp("strokeWidth", parseInt(e.target.value) || 0)
              }
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">
              Stroke Color
            </Label>
            <input
              type="color"
              value={selectedObject.stroke || "#000000"}
              onChange={(e) => updateProp("stroke", e.target.value)}
              className="h-8 w-full rounded-md cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Image Filters */}
      {isImage && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs gap-2 justify-start"
            >
              <Filter className="w-4 h-4" /> Image Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Brightness
              </Label>
              <Input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                onChange={(e) =>
                  applyImageFilter("brightness", parseFloat(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Contrast
              </Label>
              <Input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                onChange={(e) =>
                  applyImageFilter("contrast", parseFloat(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Saturation
              </Label>
              <Input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                onChange={(e) =>
                  applyImageFilter("saturation", parseFloat(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Blur
              </Label>
              <Input
                type="range"
                min="0"
                max="50"
                step="1"
                onChange={(e) =>
                  applyImageFilter("blur", parseInt(e.target.value))
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => applyImageFilter("grayscale", 0)}
              >
                B&W
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => applyImageFilter("sepia", 0)}
              >
                Sepia
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Blend Mode */}
      {(isShape || isImage) && (
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground">
            Blend Mode
          </Label>
          <select
            value={selectedObject.globalCompositeOperation || "source-over"}
            onChange={(e) =>
              updateProp("globalCompositeOperation", e.target.value)
            }
            className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 py-1"
          >
            <option value="source-over">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
            <option value="color-dodge">Color Dodge</option>
            <option value="color-burn">Color Burn</option>
            <option value="hard-light">Hard Light</option>
            <option value="soft-light">Soft Light</option>
            <option value="difference">Difference</option>
            <option value="exclusion">Exclusion</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default AdvancedEffectsPanel;
