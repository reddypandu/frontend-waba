import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlipHorizontal, FlipVertical, RotateCw } from "lucide-react";

const PropertyPanel = ({ fabricRef, selectedObject, onUpdate }) => {
  if (!selectedObject || !fabricRef.current) return null;

  const updateProp = (prop, value) => {
    const active = fabricRef.current.getActiveObject();
    if (!active) return;
    active.set(prop, value);
    active.setCoords();
    fabricRef.current.renderAll();
    onUpdate();
  };

  const handleFlip = (direction) => {
    const active = fabricRef.current.getActiveObject();
    if (!active) return;

    if (direction === "h") {
      active.set("flipX", !active.flipX);
    } else if (direction === "v") {
      active.set("flipY", !active.flipY);
    }

    fabricRef.current.renderAll();
    onUpdate();
  };

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <h3 className="text-xs font-bold uppercase text-muted-foreground">
        Properties
      </h3>

      {/* Position */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground">
            X Position
          </Label>
          <Input
            type="number"
            value={Math.round(selectedObject.left || 0)}
            onChange={(e) => updateProp("left", parseInt(e.target.value) || 0)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-medium text-muted-foreground">
            Y Position
          </Label>
          <Input
            type="number"
            value={Math.round(selectedObject.top || 0)}
            onChange={(e) => updateProp("top", parseInt(e.target.value) || 0)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Size */}
      {(selectedObject.type === "rect" ||
        selectedObject.type === "circle" ||
        selectedObject.type === "triangle" ||
        selectedObject.type === "image") && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">
              Width
            </Label>
            <Input
              type="number"
              value={Math.round(
                (selectedObject.width || 0) * (selectedObject.scaleX || 1),
              )}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                const baseWidth = selectedObject.width || 1;
                updateProp("scaleX", val / baseWidth);
              }}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium text-muted-foreground">
              Height
            </Label>
            <Input
              type="number"
              value={Math.round(
                (selectedObject.height || 0) * (selectedObject.scaleY || 1),
              )}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                const baseHeight = selectedObject.height || 1;
                updateProp("scaleY", val / baseHeight);
              }}
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Rotation */}
      <div className="space-y-1">
        <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
          <RotateCw className="w-3 h-3" /> Rotation
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="360"
            value={Math.round((selectedObject.angle || 0) % 360)}
            onChange={(e) =>
              updateProp("angle", parseInt(e.target.value) % 360 || 0)
            }
            className="h-8 text-xs"
          />
          <span className="text-xs text-muted-foreground">°</span>
        </div>
      </div>

      {/* Flip Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs gap-1"
          onClick={() => handleFlip("h")}
        >
          <FlipHorizontal className="w-4 h-4" /> H-Flip
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs gap-1"
          onClick={() => handleFlip("v")}
        >
          <FlipVertical className="w-4 h-4" /> V-Flip
        </Button>
      </div>
    </div>
  );
};

export default PropertyPanel;
