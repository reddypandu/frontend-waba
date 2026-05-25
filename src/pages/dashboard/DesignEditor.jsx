import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  RotateCcw,
  RotateCw,
  Save,
  Undo,
  Redo,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import * as fabric from "fabric";
import EditorSidebar from "@/components/dashboard/designs/EditorSidebar";
import CanvasToolbar from "@/components/dashboard/designs/CanvasToolbar";
import { useAuth } from "@/contexts/AuthContext";

const DesignEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canvasRef = React.useRef(null);
  const fabricRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const canvasDimensionsRef = React.useRef({ width: 500, height: 500 });
  const sidebarRef = React.useRef(null);
  const dividerRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);
  const [selectedObject, setSelectedObject] = React.useState(null);
  const [history, setHistory] = React.useState([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [designName, setDesignName] = React.useState("Untitled Design");
  const [isTemplate, setIsTemplate] = React.useState(false);
  const [isOwner, setIsOwner] = React.useState(true);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [errorInfo, setErrorInfo] = React.useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = React.useState("Saved");
  const [sidebarWidth, setSidebarWidth] = React.useState(320);
  const autoSaveTimerRef = React.useRef(null);
  const guidesRef = React.useRef({ v: null, h: null });
  const customNameRef = React.useRef(null);

  const { data: design, isLoading: isDesignLoading } = useQuery({
    queryKey: ["design-detail", user?.id, id],
    queryFn: () => apiGet(`/api/designs/${id}`),
    enabled: !!user && !!id && id !== "new",
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const isNew = id === "new" || !isOwner;
      return isNew
        ? apiPost("/api/designs", data)
        : apiPut(`/api/designs/${id}`, data);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["designs", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["design-detail", user?.id, id],
      });
      const isNew = id === "new" || !isOwner;
      if (isNew && saved?._id) {
        setIsOwner(true);
        navigate(`/dashboard/designs/editor/${saved._id}`, { replace: true });
      }
    },
    onError: (err) => {
      toast({
        title: "Save Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Global Error Handler for this component
  React.useEffect(() => {
    const handleError = (error) => {
      console.error("Editor Root Error:", error);
      setErrorInfo(error.message || "Unknown error occurred");
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  // Draggable Sidebar Handler (Desktop only)
  React.useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !sidebarRef.current) return;
      const newWidth = Math.max(250, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "auto";
      document.body.style.userSelect = "auto";
    };

    const handleMouseDown = (e) => {
      if (
        e.target === dividerRef.current ||
        (dividerRef.current && dividerRef.current.contains(e.target))
      ) {
        isDraggingRef.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      }
    };

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarWidth(window.innerWidth);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 1. Initialize Canvas Instance (Mount Only)
  React.useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    let width = 500;
    let height = 500;

    try {
      const custom = localStorage.getItem("custom_dimensions");
      if (id === "new" && custom) {
        const dim = JSON.parse(custom);
        width = dim?.width || 500;
        height = dim?.height || 500;
        if (dim?.name) customNameRef.current = dim.name;
        localStorage.removeItem("custom_dimensions");
      }
    } catch (e) {
      console.error("Dim Parse Error", e);
    }

    // Store the actual canvas dimensions for export
    canvasDimensionsRef.current = { width, height };

    try {
      // Global configuration for Fabric objects to show rotation handles "direct" on elements
      // We use FabricObject for Fabric 6+ or Object for earlier versions
      const BaseObject = fabric.FabricObject || fabric.Object;
      if (BaseObject) {
        BaseObject.prototype.transparentCorners = false;
        BaseObject.prototype.cornerColor = "#3b82f6";
        BaseObject.prototype.cornerStyle = "circle";
        BaseObject.prototype.cornerSize = 12;
        BaseObject.prototype.borderColor = "#3b82f6";
        BaseObject.prototype.padding = 10;
        BaseObject.prototype.rotatingPointOffset = 40; // The "stick" length for the rotation handle
      }

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: width,
        height: height,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
      });

      fabricRef.current = canvas;

      const updateToolbar = () => {
        const active = canvas.getActiveObject();
        setSelectedObject(
          active
            ? { ...active.toObject(["id", "name"]), _ts: Date.now() }
            : null,
        );
      };

      canvas.on("selection:created", updateToolbar);
      canvas.on("selection:updated", updateToolbar);
      canvas.on("selection:cleared", updateToolbar);

      const saveHistory = () => {
        try {
          const json = canvas.toJSON();
          setHistory((prev) => {
            const newHistory = prev.slice(0, (historyIndex || 0) + 1);
            if (newHistory.length > 50) newHistory.shift();
            return [...newHistory, json];
          });
          setHistoryIndex((prev) => Math.min((prev || 0) + 1, 49));
        } catch (e) {
          console.error("History Error", e);
        }
      };

      const saveState = () => {
        updateToolbar();
        saveHistory();
      };

      canvas.on("object:added", () => {
        saveState();
        triggerAutoSave();
      });
      canvas.on("object:modified", () => {
        saveState();
        triggerAutoSave();
      });
      canvas.on("object:removed", () => {
        saveState();
        triggerAutoSave();
      });

      // Smart Guides Logic
      canvas.on("object:moving", (e) => {
        const obj = e.target;
        if (!obj) return;
        const centerX = canvas.getCenter().left;
        const centerY = canvas.getCenter().top;
        const snapThreshold = 10;

        if (
          Math.abs(obj.left + (obj.width * obj.scaleX) / 2 - centerX) <
          snapThreshold
        ) {
          obj.set({ left: centerX - (obj.width * obj.scaleX) / 2 });
          guidesRef.current.v = centerX;
        } else {
          guidesRef.current.v = null;
        }

        if (
          Math.abs(obj.top + (obj.height * obj.scaleY) / 2 - centerY) <
          snapThreshold
        ) {
          obj.set({ top: centerY - (obj.height * obj.scaleY) / 2 });
          guidesRef.current.h = centerY;
        } else {
          guidesRef.current.h = null;
        }
        canvas.renderAll();
      });

      canvas.on("before:render", () => {
        canvas.clearContext(canvas.contextTop);
      });

      canvas.on("after:render", () => {
        const ctx = canvas.getContext();
        ctx.save();
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        if (guidesRef.current.v !== null) {
          ctx.beginPath();
          ctx.moveTo(guidesRef.current.v, 0);
          ctx.lineTo(guidesRef.current.v, canvas.height);
          ctx.stroke();
        }
        if (guidesRef.current.h !== null) {
          ctx.beginPath();
          ctx.moveTo(0, guidesRef.current.h);
          ctx.lineTo(canvas.width, guidesRef.current.h);
          ctx.stroke();
        }
        ctx.restore();
      });

      const resizeHandler = () => {
        if (!containerRef.current) return;
        let zoom = Math.min(
          (containerRef.current.offsetWidth - 100) / width,
          (containerRef.current.offsetHeight - 100) / height,
        );
        zoom = Math.max(0.05, zoom); // Prevent negative or zero zoom
        canvas.setZoom(zoom);
        canvas.setWidth(width * zoom);
        canvas.setHeight(height * zoom);
      };

      window.addEventListener("resize", resizeHandler);
      setTimeout(resizeHandler, 200);
      setIsLoaded(true);

      return () => {
        canvas.dispose();
        fabricRef.current = null;
        window.removeEventListener("resize", resizeHandler);
      };
    } catch (err) {
      console.error("Canvas Init Error", err);
      setErrorInfo(err.message);
    }
  }, []);

  // 2. Load Design Data (When design data changes or becomes available)
  const isInitialLoadRef = React.useRef(true);
  React.useEffect(() => {
    if (!fabricRef.current || !isLoaded) return;

    if (id === "new") {
      setDesignName(customNameRef.current || "Untitled Design");
      isInitialLoadRef.current = false;
      return;
    }

    if (design && isInitialLoadRef.current) {
      if (design?.name) setDesignName(design.name);
      if (design?.type === "template") setIsTemplate(true);

      const currentUserId = user?._id || user?.id;
      const ownerId = design?.user_id?._id || design?.user_id;

      // If there's no ownerId (global template) or IDs don't match, user is NOT owner
      if (
        !ownerId ||
        (currentUserId && String(ownerId) !== String(currentUserId))
      ) {
        setIsOwner(false);
      }

      if (design?.data) {
        fabricRef.current.loadFromJSON(design.data).then(() => {
          fabricRef.current.renderAll();
          setHistory([fabricRef.current.toJSON()]);
          setHistoryIndex(0);
        });
      }
      isInitialLoadRef.current = false;
    }
  }, [id, design, isLoaded, user]);

  const triggerAutoSave = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setAutoSaveStatus("Saving...");
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(true);
    }, 3000);
  };

  const handleSave = async (isAuto = false) => {
    if (!fabricRef.current) return;
    try {
      const dims = canvasDimensionsRef.current;
      await saveMutation.mutateAsync({
        name: designName,
        data: fabricRef.current.toJSON(),
        thumbnail_url: fabricRef.current.toDataURL({
          format: "png",
          quality: 0.2,
          multiplier: 0.5,
          width: dims.width,
          height: dims.height,
        }),
        type: isTemplate && user?.role === "admin" ? "template" : "user",
        is_public: isTemplate && user?.role === "admin",
      });
      setAutoSaveStatus("Saved");
      if (!isAuto) toast({ title: "Design saved successfully!" });
    } catch (e) {
      setAutoSaveStatus("Error");
    }
  };

  const rotateSelected = () => {
    if (!fabricRef.current) return;
    const activeObject = fabricRef.current.getActiveObject();
    if (activeObject) {
      const currentAngle = activeObject.angle || 0;
      activeObject.set("angle", (currentAngle + 90) % 360);
      fabricRef.current.renderAll();
      triggerAutoSave();
    }
  };

  const sendToWhatsApp = async () => {
    if (!fabricRef.current) return;
    try {
      toast({ title: "Preparing export..." });
      const dims = canvasDimensionsRef.current;
      const dataUrl = fabricRef.current.toDataURL({
        format: "png",
        multiplier: 2,
        width: dims.width,
        height: dims.height,
      });

      // Upload to Cloudinary for a public URL
      const blob = await (await fetch(dataUrl)).blob();
      const filename = `design-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/cloudinary`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const waUrl = `https://wa.me/?text=${encodeURIComponent("Check out my design: " + data.url)}`;
      window.open(waUrl, "_blank");
      toast({ title: "Redirecting to WhatsApp..." });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

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
    <div className="h-screen min-h-screen flex flex-col bg-background md:overflow-hidden font-jakarta text-foreground">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 py-3 bg-gradient-to-r from-primary via-primary/70 to-primary/50 shadow-lg z-10 gap-3 md:gap-0 shrink-0">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/15 hover:text-white"
            onClick={() => navigate("/dashboard/designs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="text-sm font-bold bg-transparent border-none text-white placeholder:text-white/70 focus:outline-none focus:ring-1 focus:ring-white/30 rounded px-1 -ml-1 w-full max-w-[220px]"
              placeholder="Design Name"
            />
            <p className="text-[10px] text-white/75 font-medium uppercase tracking-tighter">
              Connectly Creative Editor
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 text-white hover:bg-white/15 hover:text-white disabled:text-white/40"
            onClick={() => {
              if (historyIndex > 0) {
                const prev = historyIndex - 1;
                setHistoryIndex(prev);
                fabricRef.current
                  .loadFromJSON(history[prev])
                  .then(() => fabricRef.current.renderAll());
              }
            }}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-3.5 w-3.5" /> Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 text-white hover:bg-white/15 hover:text-white disabled:text-white/40"
            onClick={() => {
              if (historyIndex < history.length - 1) {
                const next = historyIndex + 1;
                setHistoryIndex(next);
                fabricRef.current
                  .loadFromJSON(history[next])
                  .then(() => fabricRef.current.renderAll());
              }
            }}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-3.5 w-3.5" /> Redo
          </Button>
          <div className="w-px h-6 bg-white/20 mx-2 hidden md:block" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 text-white hover:bg-white/15 hover:text-white disabled:text-white/40"
            onClick={rotateSelected}
            disabled={!selectedObject}
          >
            <RotateCw className="h-3.5 w-3.5" /> Rotate
          </Button>
          <div className="w-px h-6 bg-white/20 mx-2 hidden md:block" />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-white/20 bg-black/15 text-white hover:bg-white/15 hover:text-white"
            onClick={() => {
              fabricRef.current.clear();
              fabricRef.current.backgroundColor = "#ffffff";
              fabricRef.current.renderAll();
            }}
          >
            <RotateCcw className="h-3.5 w-3.5 text-orange-500" /> Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-white/20 bg-black/15 text-white hover:bg-white/15 hover:text-white"
            onClick={() => {
              const dims = canvasDimensionsRef.current;
              const link = document.createElement("a");
              link.download = `design-${id || "new"}.png`;
              link.href = fabricRef.current.toDataURL({
                format: "png",
                multiplier: 2,
                width: dims.width,
                height: dims.height,
              });
              link.click();
            }}
          >
            <Download className="h-3.5 w-3.5" /> PNG
          </Button>

          {user?.role === "admin" && (
            <label className="flex items-center gap-1.5 text-xs font-bold text-white mx-1 md:mx-2 cursor-pointer bg-black/15 px-2 py-1 rounded-md">
              <input
                type="checkbox"
                checked={isTemplate}
                onChange={(e) => setIsTemplate(e.target.checked)}
                className="accent-primary"
              />
              Save as Global Template
            </label>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 text-white hover:text-white hover:bg-white/15"
            onClick={sendToWhatsApp}
          >
            <Plus className="h-3.5 w-3.5" /> Send to WhatsApp
          </Button>

          <div className="flex items-center gap-1.5 px-2">
            <span
              className={`w-2 h-2 rounded-full ${autoSaveStatus === "Saved" ? "bg-emerald-300" : "bg-amber-300 animate-pulse"}`}
            />
            <span className="text-[10px] text-white/80 font-bold uppercase">
              {autoSaveStatus}
            </span>
          </div>

          <Button
            size="sm"
            className="h-9 text-xs gap-1.5 bg-white text-[#16181f] hover:bg-white/90 shadow-lg transition-all active:scale-95"
            disabled={saveMutation.isPending}
            onClick={() => handleSave()}
          >
            {saveMutation.isPending ? (
              <RotateCcw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Design
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden">
        <div
          ref={sidebarRef}
          className="w-full md:overflow-y-auto bg-card border-b md:border-b-0 md:border-r border-border"
          style={{
            width: `${sidebarWidth}px`,
            transition: isDraggingRef.current ? "none" : "width 0.2s ease",
          }}
        >
          <EditorSidebar
            fabricRef={fabricRef}
            setSelectedObject={setSelectedObject}
            selectedObject={selectedObject}
          />
        </div>

        <div
          ref={dividerRef}
          className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors hidden md:block"
          style={{
            opacity: isDraggingRef.current ? 1 : 0.3,
          }}
        />

        <div
          ref={containerRef}
          className="h-[50vh] md:h-auto md:flex-1 shrink-0 bg-muted relative flex items-center justify-center p-2 md:p-8 overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {isLoaded && fabricRef.current && (
            <CanvasToolbar
              fabricRef={fabricRef}
              selectedObject={selectedObject}
              onUpdate={() => {
                const active = fabricRef.current.getActiveObject();
                setSelectedObject(
                  active
                    ? { ...active.toObject(["id", "name"]), _ts: Date.now() }
                    : null,
                );
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
