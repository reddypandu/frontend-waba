import React from "react";
import { Button } from "@/components/ui/button";
import {
  Square,
  Circle,
  Triangle,
  Minus,
  ArrowRight,
  Star,
  Heart,
  Pentagon,
  Hexagon,
} from "lucide-react";
import * as fabric from "fabric";

const ShapesPanel = ({ fabricRef }) => {
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
      case "line":
        shape = new fabric.Line([0, 0, 100, 0], {
          ...common,
          stroke: "#000000",
          strokeWidth: 2,
        });
        break;
      case "arrow":
        const group = new fabric.Group([
          new fabric.Line([0, 0, 80, 0], { stroke: "#000000", strokeWidth: 2 }),
          new fabric.Polygon(
            [
              { x: 85, y: 0 },
              { x: 75, y: -8 },
              { x: 75, y: 8 },
            ],
            { fill: "#000000" },
          ),
        ]);
        shape = group;
        break;
      case "star":
        const points = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? 50 : 25;
          points.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          });
        }
        shape = new fabric.Polygon(points, { ...common, fill: "#fbbf24" });
        break;
      case "heart":
        const heartPath =
          "M 230.378 466.556 C 125.168 307.303 62.208 259.931 62.208 202.256 C 62.208 138.088 107.832 85.376 161.904 85.376 C 190.44 85.376 216.768 99.12 230.378 120.224 C 243.988 99.12 270.316 85.376 298.852 85.376 C 352.924 85.376 398.548 138.088 398.548 202.256 C 398.548 259.931 335.588 307.303 230.378 466.556 Z";
        shape = new fabric.Path(heartPath, {
          ...common,
          fill: "#ec4899",
          scaleX: 0.3,
          scaleY: 0.3,
        });
        break;
      case "pentagon":
        const pentagonPoints = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          pentagonPoints.push({
            x: Math.cos(angle) * 50,
            y: Math.sin(angle) * 50,
          });
        }
        shape = new fabric.Polygon(pentagonPoints, {
          ...common,
          fill: "#8b5cf6",
        });
        break;
      case "hexagon":
        const hexagonPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * 2 * Math.PI) / 6;
          hexagonPoints.push({
            x: Math.cos(angle) * 50,
            y: Math.sin(angle) * 50,
          });
        }
        shape = new fabric.Polygon(hexagonPoints, {
          ...common,
          fill: "#06b6d4",
        });
        break;
    }

    if (shape) {
      fabricRef.current.add(shape);
      fabricRef.current.setActiveObject(shape);
      fabricRef.current.centerObject(shape);
      fabricRef.current.renderAll();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase text-muted-foreground px-2">
        Basic Shapes
      </h3>
      <div className="grid grid-cols-3 gap-2 px-2">
        <Button
          variant="outline"
          size="sm"
          className="h-10 flex flex-col items-center justify-center text-[10px] gap-1"
          onClick={() => addShape("rect")}
          title="Rectangle"
        >
          <Square className="w-5 h-5" />
          <span>Rectangle</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 flex flex-col items-center justify-center text-[10px] gap-1"
          onClick={() => addShape("circle")}
          title="Circle"
        >
          <Circle className="w-5 h-5" />
          <span>Circle</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 flex flex-col items-center justify-center text-[10px] gap-1"
          onClick={() => addShape("triangle")}
          title="Triangle"
        >
          <Triangle className="w-5 h-5" />
          <span>Triangle</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 flex flex-col items-center justify-center text-[10px] gap-1"
          onClick={() => addShape("line")}
          title="Line"
        >
          <Minus className="w-5 h-5" />
          <span>Line</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 flex flex-col items-center justify-center text-[10px] gap-1"
          onClick={() => addShape("arrow")}
          title="Arrow"
        >
          <ArrowRight className="w-5 h-5" />
          <span>Arrow</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 flex flex-col items-center justify-center text-[10px] gap-1"
          onClick={() => addShape("star")}
          title="Star"
        >
          <Star className="w-5 h-5" />
          <span>Star</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 flex flex-col items-center justify-center text-[10px] gap-1"
          onClick={() => addShape("heart")}
          title="Heart"
        >
          <Heart className="w-5 h-5" />
          <span>Heart</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 flex flex-col items-center justify-center text-[10px] gap-1"
          onClick={() => addShape("pentagon")}
          title="Pentagon"
        >
          <Pentagon className="w-5 h-5" />
          <span>Pentagon</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 flex flex-col items-center justify-center text-[10px] gap-1"
          onClick={() => addShape("hexagon")}
          title="Hexagon"
        >
          <Hexagon className="w-5 h-5" />
          <span>Hexagon</span>
        </Button>
      </div>
    </div>
  );
};

export default ShapesPanel;
