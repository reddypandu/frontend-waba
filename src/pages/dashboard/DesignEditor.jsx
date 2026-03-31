import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RotateCcw, Save, Undo, Redo, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as fabric from "fabric";
import EditorSidebar from "@/components/dashboard/designs/EditorSidebar";
import CanvasToolbar from "@/components/dashboard/designs/CanvasToolbar";
import { useAuth } from "@/contexts/AuthContext";

const DesignEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const canvasRef = React.useRef(null);
  const fabricRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [selectedObject, setSelectedObject] = React.useState(null);
  const [history, setHistory] = React.useState([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [designName, setDesignName] = React.useState("Untitled Design");
  const [isTemplate, setIsTemplate] = React.useState(false);
  const [isOwner, setIsOwner] = React.useState(true);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState(null);

  // Global Error Handler for this component
  React.useEffect(() => {
    const handleError = (error) => {
      console.error("Editor Root Error:", error);
      setErrorInfo(error.message || "Unknown error occurred");
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // Initialize Canvas
  React.useEffect(() => {
    if (!canvasRef.current) return;

    let width = 500;
    let height = 500;

    try {
      const custom = localStorage.getItem("custom_dimensions");
      if (id === "new" && custom) {
        const dim = JSON.parse(custom);
        width = dim?.width || 500;
        height = dim?.height || 500;
        localStorage.removeItem("custom_dimensions");
      }
    } catch (e) {
      console.error("Dim Parse Error", e);
    }

    try {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: width,
        height: height,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
      });

      fabricRef.current = canvas;
      setIsLoaded(true);

      const updateToolbar = () => {
        const active = canvas.getActiveObject();
        if (active) {
          setSelectedObject({ ...active.toObject(['id', 'name']), _ts: Date.now() });
        } else {
          setSelectedObject(null);
        }
      };

      canvas.on("selection:created", updateToolbar);
      canvas.on("selection:updated", updateToolbar);
      canvas.on("selection:cleared", updateToolbar);

      const saveHistory = () => {
        try {
          const json = canvas.toJSON();
          setHistory((prev) => {
            const newHistory = prev.slice(0, Math.max(0, historyIndex + 1));
            return [...newHistory, json];
          });
          setHistoryIndex((prev) => prev + 1);
        } catch (e) {
          console.error("History Error", e);
        }
      };

      canvas.on("object:added", saveHistory);
      canvas.on("object:modified", saveHistory);

      if (id && id !== "new") {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/designs/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
          .then(r => r.json())
          .then(design => {
            if (design?.name) setDesignName(design.name);
            if (design?.type === 'template') setIsTemplate(true);

            const currentUserId = user?._id || user?.id;
            // If the design belongs to someone else (e.g., an Admin Global Template), mark as a clone
            if (design?.user_id && currentUserId && design.user_id !== currentUserId) {
              setIsOwner(false);
            }

            if (design?.data) {
              canvas.loadFromJSON(design.data).then(() => canvas.renderAll());
            }
          })
          .catch(err => console.error("Load Error", err));
      }

      const resizeHandler = () => {
        if (!containerRef.current) return;
        const zoom = Math.min(
          (containerRef.current.offsetWidth - 100) / width,
          (containerRef.current.offsetHeight - 100) / height
        );
        canvas.setZoom(zoom);
        canvas.setWidth(width * zoom);
        canvas.setHeight(height * zoom);
      };

      window.addEventListener("resize", resizeHandler);
      setTimeout(resizeHandler, 200);

      return () => {
        canvas.dispose();
        window.removeEventListener("resize", resizeHandler);
      };
    } catch (err) {
      console.error("Canvas Init Error", err);
      setErrorInfo(err.message);
    }
  }, [id]);

  if (errorInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-background">
        <AlertCircle className="w-16 h-16 text-destructive animate-pulse" />
        <h2 className="text-2xl font-bold">Studio Encountered an Error</h2>
        <p className="text-muted-foreground max-w-md">{errorInfo}</p>
        <Button onClick={() => window.location.reload()}>Reload Studio</Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden font-jakarta">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shadow-sm bg-card z-10 transition-all">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/designs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 w-full max-w-[200px]"
              placeholder="Design Name"
            />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Connectly Creative Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => {
            if (historyIndex > 0) {
              const prev = historyIndex - 1;
              setHistoryIndex(prev);
              fabricRef.current.loadFromJSON(history[prev]).then(() => fabricRef.current.renderAll());
            }
          }} disabled={historyIndex <= 0}>
            <Undo className="h-3.5 w-3.5" /> Undo
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => {
            if (historyIndex < history.length - 1) {
              const next = historyIndex + 1;
              setHistoryIndex(next);
              fabricRef.current.loadFromJSON(history[next]).then(() => fabricRef.current.renderAll());
            }
          }} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-3.5 w-3.5" /> Redo
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-dashed" onClick={() => {
            fabricRef.current.clear();
            fabricRef.current.backgroundColor = "#ffffff";
            fabricRef.current.renderAll();
          }}>
            <RotateCcw className="h-3.5 w-3.5 text-orange-500" /> Reset
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => {
            const link = document.createElement("a");
            link.download = `design-${id || "new"}.png`;
            link.href = fabricRef.current.toDataURL({ format: "png", multiplier: 2 });
            link.click();
          }}>
            <Download className="h-3.5 w-3.5" /> PNG
          </Button>

          {user?.role === 'admin' && (
            <label className="flex items-center gap-1.5 text-xs font-bold text-primary mx-2 cursor-pointer bg-primary/10 px-2 py-1 rounded-md">
              <input type="checkbox" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)} className="accent-primary" />
              Save as Global Template
            </label>
          )}

          <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={async () => {
            try {
              const isNew = id === "new" || !isOwner;
              const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/designs${isNew ? '' : `/${id}`}`, {
                method: isNew ? "POST" : "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                  name: designName,
                  data: fabricRef.current.toJSON(),
                  thumbnail_url: fabricRef.current.toDataURL({ format: "png", quality: 0.2, multiplier: 0.5 }),
                  type: isTemplate && user?.role === 'admin' ? 'template' : 'user',
                  is_public: isTemplate && user?.role === 'admin'
                })
              });
              const saved = await res.json();
              if (res.ok) {
                if (isNew && saved?._id) navigate(`/dashboard/designs/editor/${saved._id}`, { replace: true });
                toast({ title: "Design saved successfully!" });
              } else {
                throw new Error(saved.error || "Save failed");
              }
            } catch (err) {
              toast({ title: "Save Error", description: err.message, variant: "destructive" });
            }
          }}>
            <Save className="h-3.5 w-3.5" /> Save Design
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar fabricRef={fabricRef} setSelectedObject={setSelectedObject} />

        <div ref={containerRef} className="flex-1 bg-[#f8f9fa] relative flex items-center justify-center p-8 overflow-auto custom-scrollbar" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>

          {isLoaded && fabricRef.current && (
            <CanvasToolbar
              fabricRef={fabricRef}
              selectedObject={selectedObject}
              onUpdate={() => {
                const active = fabricRef.current.getActiveObject();
                setSelectedObject(active ? { ...active.toObject(['id', 'name']), _ts: Date.now() } : null);
              }}
            />
          )}

          <div className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] rounded-sm overflow-hidden bg-white ring-1 ring-border/50">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignEditor;
