import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Minus, Maximize2, Save, ArrowLeft,
  MessageCircle, Zap, Clock, Type, MousePointerSquareDashed,
  Trash2, GitBranch, SquareStack,
  Calendar, CreditCard, Database, HelpCircle, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import "./VisualFlowBuilder.css";

/* ─── Constants ─────────────────────────────────────────────── */
const NODE_W = 250;
const NODE_HEADER_H = 44;
const NODE_BODY_H = 56;
const NODE_H = NODE_HEADER_H + NODE_BODY_H;
const CANVAS_W = 6000;
const CANVAS_H = 6000;
const GRID_SNAP = 24;

const DEFAULT_SUCCESS_RECEIPT = `🎉 *PAYMENT CONFIRMED* 🎉

Thank you, *{customer_name}*! 🙏

🧾 *Order ID: #{order_id}*
━━━━━━━━━━━━━━━━━━━
📋 *Order Details*
▫️ *{service_name}* × 1 — ₹{amount}.00
━━━━━━━━━━━━━━━━━━━
🧮 Subtotal — ₹{amount}.00
━━━━━━━━━━━━━━━━━━━
💰 *TOTAL PAID — ₹{amount}.00*
━━━━━━━━━━━━━━━━━━━

📱 Save this confirmation for your records.
Thank you for doing business with us! ✨`;

const DEFAULT_FAILED_RECEIPT = `❌ *PAYMENT PENDING / FAILED*

Hello *{customer_name}*, we could not verify your payment of ₹{amount}.00 for *{service_name}*.

Order ID: #{order_id}

Please complete your payment or contact our team if you need assistance. 🙏`;

const NODE_TYPES = {
  trigger: {
    label: "Trigger",
    desc: "Start of the flow",
    icon: Zap,
    colorClass: "node-color-trigger",
  },
  send_text: {
    label: "Send Text",
    desc: "Send a text message",
    icon: Type,
    colorClass: "node-color-send-text",
  },
  send_buttons: {
    label: "Send Buttons",
    desc: "Interactive buttons",
    icon: SquareStack,
    colorClass: "node-color-send-buttons",
  },
  ask_question: {
    label: "Ask Question",
    desc: "Question & Answer",
    icon: HelpCircle,
    colorClass: "node-color-send-text",
  },
  delay: {
    label: "Delay",
    desc: "Wait before next step",
    icon: Clock,
    colorClass: "node-color-delay",
  },
  condition: {
    label: "Condition",
    desc: "Branch on keyword",
    icon: GitBranch,
    colorClass: "node-color-condition",
  },
  book_meeting: {
    label: "Book Meeting",
    desc: "Calendar booking",
    icon: Calendar,
    colorClass: "node-color-condition",
  },
  payment_invoice: {
    label: "Payment Invoice",
    desc: "Request payment",
    icon: CreditCard,
    colorClass: "node-color-condition",
  },
  verify_payment: {
    label: "Verify Payment",
    desc: "Check payment status",
    icon: ShieldCheck,
    colorClass: "node-color-condition",
  },
  save_data: {
    label: "Save Data",
    desc: "Export to Excel/Sheets",
    icon: Database,
    colorClass: "node-color-condition",
  }
};

const SIDEBAR_ITEMS_BUSINESS = ["trigger", "send_text", "send_buttons", "ask_question", "delay", "condition", "book_meeting", "payment_invoice", "verify_payment", "save_data"];
const SIDEBAR_ITEMS_STANDARD = ["trigger", "send_text", "send_buttons", "ask_question", "delay", "condition", "verify_payment"];

const snap = (v) => Math.round(v / GRID_SNAP) * GRID_SNAP;

const genId = () => `step_${Math.random().toString(36).substring(2, 9)}`;

/* ─── Bézier path helper ────────────────────────────────────── */
function bezierPath(x1, y1, x2, y2) {
  const dy = Math.abs(y2 - y1);
  const cp = Math.max(50, dy * 0.5);
  return `M ${x1} ${y1} C ${x1} ${y1 + cp}, ${x2} ${y2 - cp}, ${x2} ${y2}`;
}

/* ─── Build nodes from actions (load existing workflow) ────── */
function actionsToNodes(actions, triggerType, triggerValue) {
  const nodes = [];
  // Always add trigger node
  const triggerNode = {
    id: "trigger",
    type: "trigger",
    triggerType: triggerType || "keyword_match",
    triggerValue: triggerValue || "",
    position: { x: CANVAS_W / 2 - NODE_W / 2, y: 80 },
    next_step: "",
  };

  if (actions && actions.length > 0) {
    triggerNode.next_step = actions[0].id;
    if (actions[0]?.position) {
      triggerNode.position = { x: actions[0].position.x, y: Math.max(80, (actions[0].position.y || 200) - 160) };
    }
  }
  nodes.push(triggerNode);

  (actions || []).forEach((action, idx) => {
    nodes.push({
      id: action.id || genId(),
      type: action.type || "send_text",
      text: action.text || "",
      buttons: action.buttons || [],
      next_step: action.next_step || "",
      delaySeconds: action.delaySeconds || 5,
      conditionKeyword: action.conditionKeyword || "",
      amount: action.amount !== undefined ? action.amount : 0,
      upiId: action.upiId || action.upi_id || "",
      metaPaymentConfig: action.metaPaymentConfig || action.meta_payment_config || "",
      question: action.question || "",
      variableName: action.variableName || action.variable_name || "",
      success_next_step: action.success_next_step || action.successNextStep || "",
      failed_next_step: action.failed_next_step || action.failedNextStep || "",
      successText: action.type === "verify_payment" ? (action.successText || action.success_text || DEFAULT_SUCCESS_RECEIPT) : (action.successText || action.success_text || ""),
      failedText: action.type === "verify_payment" ? (action.failedText || action.failed_text || DEFAULT_FAILED_RECEIPT) : (action.failedText || action.failed_text || ""),
      startTime: action.startTime || "09:00",
      endTime: action.endTime || "17:00",
      slotDuration: action.slotDuration || 30,
      position: action.position || {
        x: CANVAS_W / 2 - NODE_W / 2,
        y: 250 + idx * 160,
      },
    });
  });

  return nodes;
}

/* ─── Convert nodes back to actions[] for API ───────────────── */
function nodesToActions(nodes) {
  return nodes
    .filter((n) => n.type !== "trigger")
    .map((n) => ({
      id: n.id,
      type: n.type,
      text: n.text || "",
      buttons: (n.buttons || []).map((b) => ({
        id: b.id,
        title: b.title || "",
        next_step: b.next_step || "",
      })),
      next_step: n.next_step || "",
      delaySeconds: n.delaySeconds,
      conditionKeyword: n.conditionKeyword,
      amount: n.amount,
      upiId: n.upiId,
      upi_id: n.upiId,
      metaPaymentConfig: n.metaPaymentConfig,
      meta_payment_config: n.metaPaymentConfig,
      question: n.question,
      variableName: n.variableName,
      variable_name: n.variableName,
      success_next_step: n.success_next_step,
      failed_next_step: n.failed_next_step,
      successText: n.successText || (n.type === "verify_payment" ? DEFAULT_SUCCESS_RECEIPT : ""),
      success_text: n.successText || (n.type === "verify_payment" ? DEFAULT_SUCCESS_RECEIPT : ""),
      failedText: n.failedText || (n.type === "verify_payment" ? DEFAULT_FAILED_RECEIPT : ""),
      failed_text: n.failedText || (n.type === "verify_payment" ? DEFAULT_FAILED_RECEIPT : ""),
      startTime: n.startTime,
      endTime: n.endTime,
      slotDuration: n.slotDuration,
      position: n.position,
    }));
}

/* ─── Build edge list from nodes ────────────────────────────── */
function buildEdges(nodes) {
  const edges = [];
  nodes.forEach((n) => {
    if (n.next_step) {
      edges.push({ from: n.id, fromPort: "output", to: n.next_step, toPort: "input" });
    }
    if (n.buttons && n.buttons.length > 0) {
      n.buttons.forEach((b, i) => {
        if (b.next_step) {
          edges.push({ from: n.id, fromPort: `btn_${i}`, to: b.next_step, toPort: "input" });
        }
      });
    }
    if (n.type === "verify_payment") {
      if (n.success_next_step) {
        edges.push({ from: n.id, fromPort: "verify_success", to: n.success_next_step, toPort: "input" });
      }
      if (n.failed_next_step) {
        edges.push({ from: n.id, fromPort: "verify_failed", to: n.failed_next_step, toPort: "input" });
      }
    }
  });
  return edges;
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */
export default function VisualFlowBuilder({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving,
  isBusinessWorkflow,
}) {
  const activeSidebarItems = isBusinessWorkflow ? SIDEBAR_ITEMS_BUSINESS : SIDEBAR_ITEMS_STANDARD;
  const { toast } = useToast();
  /* ── State ─────────────────────────────────────────────────── */
  const [workflowName, setWorkflowName] = React.useState("");
  const [triggerType, setTriggerType] = React.useState("keyword_match");
  const [triggerValue, setTriggerValue] = React.useState("");
  const [nodes, setNodes] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [zoom, setZoom] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });

  // Drag state
  const [dragging, setDragging] = React.useState(null); // { nodeId, startX, startY, origX, origY }
  const [panning, setPanning] = React.useState(null);
  const [connecting, setConnecting] = React.useState(null); // { fromId, fromPort, mouseX, mouseY }

  const canvasRef = React.useRef(null);
  const wrapperRef = React.useRef(null);

  /* ── Initialize from data ──────────────────────────────────── */
  React.useEffect(() => {
    if (isOpen) {
      let initialNodes = [];
      if (initialData) {
        setWorkflowName(initialData.name || "");
        setTriggerType(initialData.trigger_type || "keyword_match");
        setTriggerValue(initialData.trigger_value || "");
        initialNodes = actionsToNodes(initialData.actions, initialData.trigger_type, initialData.trigger_value);
        setNodes(initialNodes);
      } else {
        setWorkflowName("");
        setTriggerType("keyword_match");
        setTriggerValue("");
        initialNodes = actionsToNodes([], "keyword_match", "");
        setNodes(initialNodes);
      }
      setSelectedId(null);
      setZoom(1);
      
      const wrapperW = window.innerWidth > 768 ? window.innerWidth - 220 : window.innerWidth;
      const trigger = initialNodes.find(n => n.type === "trigger");
      const targetX = trigger ? trigger.position.x + (NODE_W / 2) : CANVAS_W / 2;
      
      setPanOffset({ x: -targetX + wrapperW / 2, y: 0 });
    }
  }, [isOpen, initialData]);

  /* ── Node helpers ──────────────────────────────────────────── */
  const updateNode = (id, updates) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const deleteNode = (id) => {
    if (id === "trigger") return;
    // Remove connections referencing this node
    setNodes((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          next_step: n.next_step === id ? "" : n.next_step,
          success_next_step: n.success_next_step === id ? "" : n.success_next_step,
          failed_next_step: n.failed_next_step === id ? "" : n.failed_next_step,
          buttons: (n.buttons || []).map((b) => ({
            ...b,
            next_step: b.next_step === id ? "" : b.next_step,
          })),
        }))
    );
    if (selectedId === id) setSelectedId(null);
  };

  const disconnectEdge = (fromId, fromPort) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== fromId) return n;
        if (fromPort === "output") {
          return { ...n, next_step: "" };
        }
        if (fromPort === "verify_success") {
          return { ...n, success_next_step: "" };
        }
        if (fromPort === "verify_failed") {
          return { ...n, failed_next_step: "" };
        }
        if (fromPort.startsWith("btn_")) {
          const btnIdx = parseInt(fromPort.split("_")[1], 10);
          const buttons = [...(n.buttons || [])];
          if (buttons[btnIdx]) {
            buttons[btnIdx] = { ...buttons[btnIdx], next_step: "" };
          }
          return { ...n, buttons };
        }
        return n;
      })
    );
    toast({ title: "Connection removed" });
  };

  const addNode = (type) => {
    if (type === "trigger" && nodes.some((n) => n.type === "trigger")) {
      toast({
        title: "Trigger Already Exists",
        description: "A workflow can only have one trigger node. Please click the existing Trigger node to edit its settings.",
        variant: "destructive",
      });
      return;
    }

    const id = type === "trigger" ? "trigger" : genId();
    // Position below the lowest node
    let maxY = 0;
    nodes.forEach((n) => {
      if (n.position.y > maxY) maxY = n.position.y;
    });
    const newNode = {
      id,
      type,
      text: "",
      buttons: type === "send_buttons" ? [{ id: genId(), title: "Option 1", next_step: "" }] : [],
      next_step: "",
      delaySeconds: type === "delay" ? 5 : undefined,
      conditionKeyword: type === "condition" ? "" : undefined,
      successText: type === "verify_payment" ? DEFAULT_SUCCESS_RECEIPT : undefined,
      failedText: type === "verify_payment" ? DEFAULT_FAILED_RECEIPT : undefined,
      position: { x: snap(CANVAS_W / 2 - NODE_W / 2), y: snap(maxY + 160) },
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedId(id);
  };

  /* ── Get port positions (relative to canvas) ───────────────── */
  const getPortPos = (nodeId, port) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const { x, y } = node.position;

    if (port === "input") {
      return { x: x + NODE_W / 2, y };
    }
    if (port === "output") {
      const h = getNodeHeight(node);
      return { x: x + NODE_W / 2, y: y + h };
    }
    if (port === "verify_success") {
      const portY = y + NODE_HEADER_H + NODE_BODY_H + 6 + 0 * 28 + 14;
      return { x: x + NODE_W, y: portY };
    }
    if (port === "verify_failed") {
      const portY = y + NODE_HEADER_H + NODE_BODY_H + 6 + 1 * 28 + 14;
      return { x: x + NODE_W, y: portY };
    }
    if (port.startsWith("btn_")) {
      const btnIdx = parseInt(port.split("_")[1], 10);
      const btnY = y + NODE_HEADER_H + NODE_BODY_H + 6 + btnIdx * 28 + 14;
      return { x: x + NODE_W, y: btnY };
    }
    return { x: x + NODE_W / 2, y: y + NODE_H };
  };

  const getNodeHeight = (node) => {
    let h = NODE_HEADER_H + NODE_BODY_H;
    if (node.type === "send_buttons" && node.buttons?.length > 0) {
      h += 8 + node.buttons.length * 28 + 8;
    } else if (node.type === "verify_payment") {
      h += 8 + 2 * 28 + 8;
    }
    return h;
  };

  /* ── Mouse event handlers ──────────────────────────────────── */
  const getCanvasCoords = (e) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    };
  };

  // Node drag
  const onNodeMouseDown = (e, nodeId) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setSelectedId(nodeId);
    setDragging({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      origX: node.position.x,
      origY: node.position.y,
    });
  };

  // Canvas pan
  const onCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target === wrapperRef.current || e.target.classList.contains("vfb-canvas-bg")) {
      setSelectedId(null);
      setPanning({ startX: e.clientX, startY: e.clientY, origX: panOffset.x, origY: panOffset.y });
    }
  };

  // Port drag (connecting)
  const onPortMouseDown = (e, fromId, fromPort) => {
    e.stopPropagation();
    e.preventDefault();
    const coords = getCanvasCoords(e);
    setConnecting({ fromId, fromPort, mouseX: coords.x, mouseY: coords.y });
  };

  // Port drop
  const onPortMouseUp = (e, toId) => {
    e.stopPropagation();
    if (!connecting) return;
    const { fromId, fromPort } = connecting;
    if (fromId === toId) {
      setConnecting(null);
      return;
    }
    // Create connection
    if (fromPort === "output") {
      updateNode(fromId, { next_step: toId });
    } else if (fromPort === "verify_success") {
      updateNode(fromId, { success_next_step: toId });
    } else if (fromPort === "verify_failed") {
      updateNode(fromId, { failed_next_step: toId });
    } else if (fromPort.startsWith("btn_")) {
      const btnIdx = parseInt(fromPort.split("_")[1], 10);
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id !== fromId) return n;
          const buttons = [...(n.buttons || [])];
          if (buttons[btnIdx]) {
            buttons[btnIdx] = { ...buttons[btnIdx], next_step: toId };
          }
          return { ...n, buttons };
        })
      );
    }
    setConnecting(null);
  };

  // Global mouse move & up
  React.useEffect(() => {
    const onMouseMove = (e) => {
      if (dragging) {
        const dx = (e.clientX - dragging.startX) / zoom;
        const dy = (e.clientY - dragging.startY) / zoom;
        updateNode(dragging.nodeId, {
          position: {
            x: snap(dragging.origX + dx),
            y: snap(dragging.origY + dy),
          },
        });
      }
      if (panning) {
        setPanOffset({
          x: panning.origX + (e.clientX - panning.startX),
          y: panning.origY + (e.clientY - panning.startY),
        });
      }
      if (connecting) {
        const coords = getCanvasCoords(e);
        setConnecting((prev) => (prev ? { ...prev, mouseX: coords.x, mouseY: coords.y } : null));
      }
    };
    const onMouseUp = () => {
      setDragging(null);
      setPanning(null);
      if (connecting) setConnecting(null);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, panning, connecting, zoom]);

  // Zoom via wheel
  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom((z) => Math.min(2, Math.max(0.3, z + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isOpen]);

  /* ── Save handler ──────────────────────────────────────────── */
  const handleSave = () => {
    const triggerNode = nodes.find((n) => n.type === "trigger");
    onSave({
      name: workflowName,
      trigger_type: triggerNode?.triggerType || triggerType,
      trigger_value: triggerNode?.triggerValue || triggerValue,
      actions: nodesToActions(nodes),
    });
  };

  /* ── Edges ─────────────────────────────────────────────────── */
  const edges = buildEdges(nodes);
  const selectedNode = nodes.find((n) => n.id === selectedId);

  /* ── Render ────────────────────────────────────────────────── */
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="vfb-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* ── Toolbar ────────────────────────────────────────── */}
        <div className="vfb-toolbar">
          <div className="vfb-toolbar-left">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <input
              className="vfb-workflow-name"
              placeholder="Workflow Name..."
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
            />
          </div>
          <div className="vfb-toolbar-center">
            <div className="vfb-zoom-controls">
              <button className="vfb-zoom-btn" onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="vfb-zoom-label">{Math.round(zoom * 100)}%</span>
              <button className="vfb-zoom-btn" onClick={() => setZoom((z) => Math.min(2, z + 0.15))}>
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button className="vfb-zoom-btn" onClick={() => { 
                setZoom(1); 
                const wrapperW = window.innerWidth > 768 ? window.innerWidth - 220 : window.innerWidth;
                const trigger = nodes.find(n => n.type === "trigger");
                const targetX = trigger ? trigger.position.x + (NODE_W / 2) : CANVAS_W / 2;
                setPanOffset({ x: -targetX + wrapperW / 2, y: 0 }); 
              }}>
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="vfb-toolbar-right">
            <Button onClick={handleSave} disabled={isSaving} className="rounded-xl px-5 h-9 text-sm font-semibold">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Workflow"}
            </Button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="vfb-body">
          {/* ── Left Sidebar ─────────────────────────────────── */}
          <div className="vfb-sidebar">
            <div className="vfb-sidebar-header">Add Nodes</div>
            <div className="vfb-sidebar-nodes">
              {activeSidebarItems.map((type) => {
                const meta = NODE_TYPES[type];
                const Icon = meta.icon;
                return (
                  <div
                    key={type}
                    className="vfb-sidebar-node"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("application/reactflow", type)}
                    onClick={() => addNode(type)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") addNode(type); }}
                  >
                    <div className={`vfb-sidebar-node-icon ${meta.colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="vfb-sidebar-node-info">
                      <div className="vfb-sidebar-node-title">{meta.label}</div>
                      <div className="vfb-sidebar-node-desc">{meta.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Canvas ───────────────────────────────────────── */}
          <div
            ref={wrapperRef}
            className={`vfb-canvas-wrapper${connecting ? " connecting" : ""}`}
            onMouseDown={onCanvasMouseDown}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const type = e.dataTransfer.getData("application/reactflow");
              if (!type) return;

              if (type === "trigger" && nodes.some((n) => n.type === "trigger")) {
                toast({
                  title: "Trigger Already Exists",
                  description: "A workflow can only have one trigger node. Please click the existing Trigger node to edit its settings.",
                  variant: "destructive",
                });
                return;
              }
              
              const coords = getCanvasCoords(e);
              const id = type === "trigger" ? "trigger" : genId();
              const newNode = {
                id,
                type,
                triggerType: type === "trigger" ? "keyword_match" : undefined,
                triggerValue: type === "trigger" ? "" : undefined,
                text: "",
                buttons: type === "send_buttons" ? [{ id: genId(), title: "Option 1", next_step: "" }] : [],
                next_step: "",
                delaySeconds: type === "delay" ? 5 : undefined,
                conditionKeyword: type === "condition" ? "" : undefined,
                successText: type === "verify_payment" ? DEFAULT_SUCCESS_RECEIPT : undefined,
                failedText: type === "verify_payment" ? DEFAULT_FAILED_RECEIPT : undefined,
                position: { x: snap(coords.x - NODE_W / 2), y: snap(coords.y - NODE_H / 2) },
              };
              setNodes((prev) => [...prev, newNode]);
              setSelectedId(id);
            }}
          >
            {/* Background grid (static, under pan/zoom) */}
            <div
              className="vfb-canvas-bg"
              style={{
                backgroundPositionX: panOffset.x,
                backgroundPositionY: panOffset.y,
                backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
              }}
            />

            {/* Pannable / Zoomable canvas layer */}
            <div
              ref={canvasRef}
              className="vfb-canvas"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                width: CANVAS_W,
                height: CANVAS_H,
              }}
            >
              {/* SVG connections */}
              <svg className="vfb-connections-svg" width={CANVAS_W} height={CANVAS_H}>
                {edges.map((edge, i) => {
                  const from = getPortPos(edge.from, edge.fromPort === "output" ? "output" : edge.fromPort);
                  const to = getPortPos(edge.to, "input");
                  const isActive = selectedId === edge.from || selectedId === edge.to;
                  const midX = (from.x + to.x) / 2;
                  const midY = (from.y + to.y) / 2;

                  return (
                    <g key={`${edge.from}-${edge.fromPort}-${edge.to}-${i}`} className="vfb-edge-group">
                      {/* Invisible thick path for easy click/hover targeting */}
                      <path
                        d={bezierPath(from.x, from.y, to.x, to.y)}
                        className="vfb-connection-hitbox"
                        onClick={(e) => {
                          e.stopPropagation();
                          disconnectEdge(edge.from, edge.fromPort);
                        }}
                      />
                      <path
                        d={bezierPath(from.x, from.y, to.x, to.y)}
                        className={`vfb-connection-path${isActive ? " vfb-connection-path-active" : ""}`}
                      />
                      <path
                        d={bezierPath(from.x, from.y, to.x, to.y)}
                        className="vfb-connection-flow"
                      />
                      {/* Midpoint disconnect button */}
                      <g
                        className="vfb-edge-disconnect-btn"
                        transform={`translate(${midX}, ${midY})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          disconnectEdge(edge.from, edge.fromPort);
                        }}
                      >
                        <circle r="12" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                        <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">✕</text>
                      </g>
                    </g>
                  );
                })}
                {/* Temp connection while dragging */}
                {connecting && (
                  <path
                    d={bezierPath(
                      getPortPos(connecting.fromId, connecting.fromPort === "output" ? "output" : connecting.fromPort).x,
                      getPortPos(connecting.fromId, connecting.fromPort === "output" ? "output" : connecting.fromPort).y,
                      connecting.mouseX,
                      connecting.mouseY
                    )}
                    className="vfb-connection-temp"
                  />
                )}
              </svg>

              {/* Nodes */}
              {nodes.map((node) => {
                const meta = NODE_TYPES[node.type] || NODE_TYPES.send_text;
                const Icon = meta.icon;
                const isTrigger = node.type === "trigger";
                const isSelected = selectedId === node.id;

                return (
                  <motion.div
                    key={node.id}
                    className={`vfb-node${isSelected ? " selected" : ""}${isTrigger ? " trigger-node" : ""}`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      width: NODE_W,
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    onMouseDown={(e) => onNodeMouseDown(e, node.id)}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(node.id); }}
                  >
                    {/* Input port (not on trigger) */}
                    {!isTrigger && (
                      <div
                        className={`vfb-port vfb-port-input${connecting ? " active" : ""}`}
                        onMouseUp={(e) => onPortMouseUp(e, node.id)}
                      />
                    )}

                    {/* Header */}
                    <div className="vfb-node-header">
                      <div className={`vfb-node-icon ${meta.colorClass}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="vfb-node-title">
                        {isTrigger
                          ? `Trigger: ${(node.triggerType || "keyword_match").replace(/_/g, " ")}`
                          : meta.label}
                      </span>
                      {!isTrigger && (
                        <button
                          className="vfb-node-delete"
                          onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Body */}
                    <div className="vfb-node-body">
                      {isTrigger && (
                        <div className="vfb-node-preview">
                          {node.triggerValue
                            ? <>Keyword: <strong>{node.triggerValue}</strong></>
                            : "Triggers when conditions are met"}
                        </div>
                      )}
                      {node.type === "send_text" && (
                        <div className="vfb-node-preview">
                          {node.text || "Enter message text..."}
                        </div>
                      )}
                      {node.type === "send_buttons" && (
                        <div className="vfb-node-preview">
                          {node.text || "Enter button message..."}
                        </div>
                      )}
                      {node.type === "ask_question" && (
                        <div className="vfb-node-preview">
                          {node.question || node.text || "Enter question..."}
                        </div>
                      )}
                      {node.type === "delay" && (
                        <div className="vfb-node-preview">
                          Wait {node.delaySeconds || 5} seconds
                        </div>
                      )}
                      {node.type === "condition" && (
                        <div className="vfb-node-preview">
                          {node.conditionKeyword
                            ? <>If keyword: <strong>{node.conditionKeyword}</strong></>
                            : "Set condition keyword..."}
                        </div>
                      )}
                      {node.type === "book_meeting" && (
                        <div className="vfb-node-preview">
                          {node.text || "Book a Meeting"}
                        </div>
                      )}
                      {node.type === "payment_invoice" && (
                        <div className="vfb-node-preview">
                          Amount: ₹{node.amount || 0}
                        </div>
                      )}
                      {node.type === "verify_payment" && (
                        <div className="vfb-node-preview">
                          Check Payment Status
                        </div>
                      )}
                      {node.type === "save_data" && (
                        <div className="vfb-node-preview">
                          Saves to Database
                        </div>
                      )}
                    </div>

                    {/* Button port rows for send_buttons */}
                    {node.type === "send_buttons" && node.buttons?.map((btn, bIdx) => (
                      <div key={btn.id} style={{ position: "relative", height: 28, display: "flex", alignItems: "center", padding: "0 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="vfb-node-btn-tag" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {btn.title || "Button"}
                        </span>
                        <div
                          className="vfb-port vfb-port-btn-output"
                          onMouseDown={(e) => onPortMouseDown(e, node.id, `btn_${bIdx}`)}
                          title={`Connect "${btn.title || "Button"}"`}
                        />
                      </div>
                    ))}

                    {/* Output ports for verify_payment */}
                    {node.type === "verify_payment" && (
                      <>
                        <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center", padding: "0 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <span className="vfb-node-btn-tag text-emerald-400 font-medium" style={{ flex: 1 }}>
                            ✓ Success (Paid)
                          </span>
                          <div
                            className="vfb-port vfb-port-btn-output bg-emerald-500"
                            onMouseDown={(e) => onPortMouseDown(e, node.id, "verify_success")}
                            title="Connect Success Path"
                          />
                        </div>
                        <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center", padding: "0 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <span className="vfb-node-btn-tag text-rose-400 font-medium" style={{ flex: 1 }}>
                            ✕ Failed / Pending
                          </span>
                          <div
                            className="vfb-port vfb-port-btn-output bg-rose-500"
                            onMouseDown={(e) => onPortMouseDown(e, node.id, "verify_failed")}
                            title="Connect Failed Path"
                          />
                        </div>
                      </>
                    )}

                    {/* Output port (hidden for send_buttons & verify_payment) */}
                    {node.type !== "send_buttons" && node.type !== "verify_payment" && (
                      <div
                        className="vfb-port vfb-port-output"
                        onMouseDown={(e) => onPortMouseDown(e, node.id, "output")}
                      />
                    )}
                  </motion.div>
                );
              })}

              {/* Empty hint */}
              {nodes.length <= 1 && (
                <div className="vfb-empty-hint">
                  <div className="vfb-empty-hint-icon">
                    <MousePointerSquareDashed className="h-12 w-12 mx-auto opacity-30" />
                  </div>
                  <div className="vfb-empty-hint-text">Click nodes from the sidebar to add steps</div>
                  <div className="vfb-empty-hint-sub">Connect them by dragging from port to port</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Panel ──────────────────────────────────── */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                className="vfb-panel"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="vfb-panel-header">
                  <span className="vfb-panel-title">
                    {selectedNode.type === "trigger"
                      ? "Trigger Settings"
                      : `${NODE_TYPES[selectedNode.type]?.label || "Node"} Settings`}
                  </span>
                  <button className="vfb-panel-close" onClick={() => setSelectedId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="vfb-panel-body">
                  {/* ── Trigger panel ──────────────────────── */}
                  {selectedNode.type === "trigger" && (
                    <>
                      <div className="vfb-field">
                        <label className="vfb-field-label">Trigger Type</label>
                        <select
                          className="vfb-field-input"
                          value={selectedNode.triggerType}
                          onChange={(e) => updateNode("trigger", { triggerType: e.target.value })}
                        >
                          <option value="keyword_match">Keyword in message</option>
                          <option value="message_received">Any message received</option>
                          <option value="contact_created">New contact created</option>
                          <option value="schedule">Scheduled time</option>
                        </select>
                      </div>
                      <div className="vfb-field">
                        <label className="vfb-field-label">
                          {selectedNode.triggerType === "keyword_match" ? "Trigger Keyword" : "Trigger Value"}
                        </label>
                        <input
                          className="vfb-field-input"
                          placeholder={selectedNode.triggerType === "keyword_match" ? "e.g. hello" : "Optional"}
                          value={selectedNode.triggerValue || ""}
                          onChange={(e) => updateNode("trigger", { triggerValue: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {/* ── Send Text panel ────────────────────── */}
                  {selectedNode.type === "send_text" && (
                    <div className="vfb-field">
                      <label className="vfb-field-label">Message Text</label>
                      <textarea
                        className="vfb-field-input"
                        rows={4}
                        placeholder="Enter your message..."
                        value={selectedNode.text || ""}
                        onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
                      />
                    </div>
                  )}

                  {/* ── Send Buttons panel ─────────────────── */}
                  {selectedNode.type === "send_buttons" && (
                    <>
                      <div className="vfb-field">
                        <label className="vfb-field-label">Message Text</label>
                        <textarea
                          className="vfb-field-input"
                          rows={3}
                          placeholder="Enter button message..."
                          value={selectedNode.text || ""}
                          onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
                        />
                      </div>
                      <div className="vfb-field">
                        <label className="vfb-field-label">Buttons (Max 3)</label>
                        <div className="vfb-buttons-list">
                          {(selectedNode.buttons || []).map((btn, i) => (
                            <div key={btn.id} className="vfb-button-item">
                              <input
                                className="vfb-field-input"
                                placeholder={`Button ${i + 1} text`}
                                value={btn.title}
                                onChange={(e) => {
                                  const newBtns = [...selectedNode.buttons];
                                  newBtns[i].title = e.target.value;
                                  updateNode(selectedNode.id, { buttons: newBtns });
                                }}
                              />
                              <button
                                className="vfb-button-delete"
                                onClick={() => {
                                  const newBtns = selectedNode.buttons.filter((_, idx) => idx !== i);
                                  updateNode(selectedNode.id, { buttons: newBtns });
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {(selectedNode.buttons?.length || 0) < 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              updateNode(selectedNode.id, {
                                buttons: [...(selectedNode.buttons || []), { id: genId(), title: "New Button", next_step: "" }],
                              });
                            }}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Button
                          </Button>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── Delay panel ────────────────────────── */}
                  {selectedNode.type === "delay" && (
                    <div className="vfb-field">
                      <label className="vfb-field-label">Delay (seconds)</label>
                      <input
                        className="vfb-field-input"
                        type="number"
                        min="1"
                        max="86400"
                        value={selectedNode.delaySeconds || 5}
                        onChange={(e) => updateNode(selectedNode.id, { delaySeconds: parseInt(e.target.value, 10) || 5 })}
                      />
                    </div>
                  )}

                  {/* ── Condition panel ────────────────────── */}
                  {selectedNode.type === "condition" && (
                    <div className="vfb-field">
                      <label className="vfb-field-label">Condition Keyword</label>
                      <input
                        className="vfb-field-input"
                        placeholder="e.g. yes"
                        value={selectedNode.conditionKeyword || ""}
                        onChange={(e) => updateNode(selectedNode.id, { conditionKeyword: e.target.value })}
                      />
                    </div>
                  )}

                  {/* ── Book Meeting panel ────────────────────── */}
                  {selectedNode.type === "book_meeting" && (
                    <>
                      <div className="vfb-field">
                        <label className="vfb-field-label">Message Text</label>
                        <textarea
                          className="vfb-field-input"
                          rows={3}
                          placeholder="e.g. Please choose a date and time..."
                          value={selectedNode.text || ""}
                          onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
                        />
                      </div>
                      
                      <div className="vfb-field mt-4">
                        <label className="vfb-field-label text-[10px] uppercase text-muted-foreground mb-1 block">Calendar Availability</label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="vfb-field-label text-xs">Start Time</label>
                            <input
                              type="time"
                              className="vfb-field-input"
                              value={selectedNode.startTime || "09:00"}
                              onChange={(e) => updateNode(selectedNode.id, { startTime: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="vfb-field-label text-xs">End Time</label>
                            <input
                              type="time"
                              className="vfb-field-input"
                              value={selectedNode.endTime || "17:00"}
                              onChange={(e) => updateNode(selectedNode.id, { endTime: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="vfb-field-label text-xs">Slot Duration (minutes)</label>
                          <select
                            className="vfb-field-input"
                            value={selectedNode.slotDuration || 30}
                            onChange={(e) => updateNode(selectedNode.id, { slotDuration: parseInt(e.target.value, 10) })}
                          >
                            <option value={15}>15 Minutes</option>
                            <option value={30}>30 Minutes</option>
                            <option value={60}>60 Minutes</option>
                          </select>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">A calendar link will automatically be attached to this message.</p>
                    </>
                  )}

                  {/* ── Payment Invoice panel ────────────────────── */}
                  {selectedNode.type === "payment_invoice" && (
                    <>
                      <div className="vfb-field">
                        <label className="vfb-field-label">Message Text</label>
                        <textarea
                          className="vfb-field-input"
                          rows={3}
                          placeholder="e.g. Please complete your payment."
                          value={selectedNode.text || ""}
                          onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
                        />
                      </div>
                      <div className="vfb-field mt-3">
                        <label className="vfb-field-label">Amount (₹)</label>
                        <input
                          type="number"
                          className="vfb-field-input"
                          min="1"
                          value={selectedNode.amount || ""}
                          onChange={(e) => updateNode(selectedNode.id, { amount: parseInt(e.target.value, 10) || 0 })}
                        />
                      </div>
                      <div className="vfb-field mt-3">
                        <label className="vfb-field-label">UPI ID</label>
                        <input
                          type="text"
                          className="vfb-field-input"
                          placeholder="e.g. 9063663180@ptyes"
                          value={selectedNode.upiId || ""}
                          onChange={(e) => updateNode(selectedNode.id, { upiId: e.target.value })}
                        />
                      </div>
                      <div className="vfb-field mt-3">
                        <label className="vfb-field-label">Meta Payment Config Name (For Native WhatsApp Pay)</label>
                        <input
                          type="text"
                          className="vfb-field-input"
                          placeholder="e.g. thepatternscompany"
                          value={selectedNode.metaPaymentConfig || ""}
                          onChange={(e) => updateNode(selectedNode.id, { metaPaymentConfig: e.target.value })}
                        />
                        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                          💡 <strong>How to get this:</strong> Go to <strong>WhatsApp Manager → Payment configurations → India</strong> and copy the active configuration name (e.g. <code>thepatternscompany</code>).
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">A native in-chat payment card or button pointing to your UPI ID will be sent to the customer.</p>
                    </>
                  )}

                  {/* ── Ask Question panel ─────────────────── */}
                  {selectedNode.type === "ask_question" && (
                    <>
                      <div className="vfb-field">
                        <label className="vfb-field-label">Question Text</label>
                        <textarea
                          className="vfb-field-input"
                          rows={3}
                          placeholder="e.g. What is your full name?"
                          value={selectedNode.question || selectedNode.text || ""}
                          onChange={(e) => updateNode(selectedNode.id, { question: e.target.value, text: e.target.value })}
                        />
                      </div>
                      <div className="vfb-field mt-3">
                        <label className="vfb-field-label">Save Answer To Variable</label>
                        <input
                          type="text"
                          className="vfb-field-input"
                          placeholder="e.g. customer_name, address, notes"
                          value={selectedNode.variableName || ""}
                          onChange={(e) => updateNode(selectedNode.id, { variableName: e.target.value })}
                        />
                        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                          💡 The customer's reply will be saved in this variable and stored in the database.
                        </p>
                      </div>
                    </>
                  )}

                  {/* ── Verify Payment panel ─────────────────── */}
                  {selectedNode.type === "verify_payment" && (
                    <>
                      <div className="vfb-field">
                        <div className="flex items-center justify-between mb-1">
                          <label className="vfb-field-label">Payment Success Receipt Message</label>
                          <button
                            type="button"
                            className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                            onClick={() => updateNode(selectedNode.id, { successText: DEFAULT_SUCCESS_RECEIPT })}
                          >
                            Reset Default
                          </button>
                        </div>
                        <textarea
                          className="vfb-field-input font-mono text-xs"
                          rows={11}
                          placeholder="Enter payment receipt message..."
                          value={selectedNode.successText !== undefined && selectedNode.successText !== "" ? selectedNode.successText : DEFAULT_SUCCESS_RECEIPT}
                          onChange={(e) => updateNode(selectedNode.id, { successText: e.target.value })}
                        />
                        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                          💡 Dynamic placeholders: <code>{`{customer_name}`}</code>, <code>{`{order_id}`}</code>, <code>{`{service_name}`}</code>, <code>{`{amount}`}</code>
                        </p>
                      </div>
                      <div className="vfb-field mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <label className="vfb-field-label">Payment Failed / Pending Message</label>
                          <button
                            type="button"
                            className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                            onClick={() => updateNode(selectedNode.id, { failedText: DEFAULT_FAILED_RECEIPT })}
                          >
                            Reset Default
                          </button>
                        </div>
                        <textarea
                          className="vfb-field-input"
                          rows={4}
                          placeholder="Enter message for failed/pending payments..."
                          value={selectedNode.failedText !== undefined && selectedNode.failedText !== "" ? selectedNode.failedText : DEFAULT_FAILED_RECEIPT}
                          onChange={(e) => updateNode(selectedNode.id, { failedText: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {/* ── Save Data panel ────────────────────── */}
                  {selectedNode.type === "save_data" && (
                    <div className="vfb-field">
                      <p className="text-sm text-foreground font-medium">Auto-Save</p>
                      <p className="text-xs text-muted-foreground mt-1">This node silently saves the entire workflow conversation data (customer info, payment, booking) to your Business Dashboard.</p>
                    </div>
                  )}

                  {/* ── Active Connections / Disconnect block ── */}
                  <div className="vfb-field mt-4 pt-3 border-t border-white/10">
                    <label className="vfb-field-label text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connected Output Steps</label>
                    
                    {selectedNode.next_step && (
                      <div className="flex items-center justify-between mt-2 p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
                        <span>Connected to <strong>{nodes.find(n => n.id === selectedNode.next_step)?.type ? (NODE_TYPES[nodes.find(n => n.id === selectedNode.next_step)?.type]?.label || selectedNode.next_step) : selectedNode.next_step}</strong></span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          onClick={() => disconnectEdge(selectedNode.id, "output")}
                        >
                          Disconnect
                        </Button>
                      </div>
                    )}

                    {selectedNode.type === "verify_payment" && (
                      <>
                        {selectedNode.success_next_step && (
                          <div className="flex items-center justify-between mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                            <span className="text-emerald-300">✓ Success → <strong>{nodes.find(n => n.id === selectedNode.success_next_step)?.type ? (NODE_TYPES[nodes.find(n => n.id === selectedNode.success_next_step)?.type]?.label || selectedNode.success_next_step) : selectedNode.success_next_step}</strong></span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              onClick={() => disconnectEdge(selectedNode.id, "verify_success")}
                            >
                              Disconnect
                            </Button>
                          </div>
                        )}
                        {selectedNode.failed_next_step && (
                          <div className="flex items-center justify-between mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                            <span className="text-rose-300">✕ Failed → <strong>{nodes.find(n => n.id === selectedNode.failed_next_step)?.type ? (NODE_TYPES[nodes.find(n => n.id === selectedNode.failed_next_step)?.type]?.label || selectedNode.failed_next_step) : selectedNode.failed_next_step}</strong></span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                              onClick={() => disconnectEdge(selectedNode.id, "verify_failed")}
                            >
                              Disconnect
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                    {selectedNode.type === "send_buttons" && selectedNode.buttons?.map((btn, bIdx) => (
                      btn.next_step ? (
                        <div key={btn.id} className="flex items-center justify-between mt-2 p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
                          <span>Button "{btn.title}" → <strong>{nodes.find(n => n.id === btn.next_step)?.type ? (NODE_TYPES[nodes.find(n => n.id === btn.next_step)?.type]?.label || btn.next_step) : btn.next_step}</strong></span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            onClick={() => disconnectEdge(selectedNode.id, `btn_${bIdx}`)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : null
                    ))}

                    {!selectedNode.next_step &&
                     !selectedNode.success_next_step &&
                     !selectedNode.failed_next_step &&
                     !(selectedNode.type === "send_buttons" && selectedNode.buttons?.some(b => b.next_step)) && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic">No outgoing connections. Drag from output port to connect.</p>
                    )}
                  </div>

                  {/* ── Node ID (all non-trigger) ──────────── */}
                  {selectedNode.type !== "trigger" && (
                    <div className="vfb-field mt-3" style={{ opacity: 0.5 }}>
                      <label className="vfb-field-label">Step ID</label>
                      <input
                        className="vfb-field-input"
                        value={selectedNode.id}
                        readOnly
                        style={{ fontFamily: "monospace", fontSize: 11 }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
