import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Trash2,
  Lock,
  Unlock,
  ChevronDown,
  Copy,
} from "lucide-react";

const LayersPanel = ({ fabricRef, selectedObject, onUpdate }) => {
  const [layers, setLayers] = React.useState([]);

  React.useEffect(() => {
    if (!fabricRef.current) return;
    const updateLayers = () => {
      const objects = fabricRef.current.getObjects().reverse();
      setLayers(
        objects.map((obj, idx) => ({
          id: obj.name || `layer-${idx}`,
          name: obj.name || `Layer ${objects.length - idx}`,
          object: obj,
          isSelected: obj === fabricRef.current.getActiveObject(),
          isVisible: !obj.visible === false,
          isLocked: obj.lockMovementX || false,
        })),
      );
    };

    updateLayers();

    fabricRef.current.on("object:added", updateLayers);
    fabricRef.current.on("object:removed", updateLayers);
    fabricRef.current.on("selection:created", updateLayers);
    fabricRef.current.on("selection:updated", updateLayers);
    fabricRef.current.on("selection:cleared", updateLayers);

    return () => {
      if (fabricRef.current) {
        fabricRef.current.off("object:added", updateLayers);
        fabricRef.current.off("object:removed", updateLayers);
        fabricRef.current.off("selection:created", updateLayers);
        fabricRef.current.off("selection:updated", updateLayers);
        fabricRef.current.off("selection:cleared", updateLayers);
      }
    };
  }, [fabricRef]);

  const toggleVisibility = (layer) => {
    layer.object.set("visible", !layer.object.visible);
    fabricRef.current.renderAll();
    onUpdate();
  };

  const toggleLock = (layer) => {
    const isLocked = !layer.object.lockMovementX;
    layer.object.set({
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

  const selectLayer = (layer) => {
    fabricRef.current.setActiveObject(layer.object);
    fabricRef.current.renderAll();
    onUpdate();
  };

  const deleteLayer = (layer) => {
    fabricRef.current.remove(layer.object);
    fabricRef.current.renderAll();
    onUpdate();
  };

  const duplicateLayer = (layer) => {
    layer.object.clone().then((cloned) => {
      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
      });
      fabricRef.current.add(cloned);
      fabricRef.current.renderAll();
      onUpdate();
    });
  };

  const renameLayer = (layer, newName) => {
    layer.object.set("name", newName);
    onUpdate();
  };

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      <h3 className="text-xs font-bold uppercase text-muted-foreground px-2">
        Layers ({layers.length})
      </h3>
      {layers.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No layers
        </p>
      ) : (
        layers.map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
              layer.isSelected
                ? "bg-primary/10 border-primary/50"
                : "bg-card border-border hover:border-border/80"
            }`}
            onClick={() => selectLayer(layer)}
          >
            <div className="flex-1 min-w-0">
              <Input
                className="h-6 text-xs border-none bg-transparent p-0 font-medium"
                value={layer.name}
                onChange={(e) => renameLayer(layer, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(layer);
              }}
            >
              {layer.isVisible ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 opacity-50" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(layer);
              }}
            >
              {layer.isLocked ? (
                <Lock className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <Unlock className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                duplicateLayer(layer);
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                deleteLayer(layer);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default LayersPanel;
