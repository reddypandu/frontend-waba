import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Minus, Maximize2, Save, ArrowLeft,
  MessageCircle, Zap, Clock, Type, MousePointerSquareDashed,
  Trash2, GitBranch, SquareStack,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "./VisualFlowBuilder.css";

/* ─── Constants ─────────────────────────────────────────────── */
const NODE_W = 240;
const NODE_HEADER_H = 44;
const NODE_BODY_H = 56;
const NODE_H = NODE_HEADER_H + NODE_BODY_H;
const CANVAS_W = 6000;
const CANVAS_H = 6000;
const GRID_SNAP = 24;

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
};

const SIDEBAR_ITEMS = ["send_text", "send_buttons", "delay", "condition"];

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
}) {
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
      if (initialData) {
        setWorkflowName(initialData.name || "");
        setTriggerType(initialData.trigger_type || "keyword_match");
        setTriggerValue(initialData.trigger_value || "");
        setNodes(actionsToNodes(initialData.actions, initialData.trigger_type, initialData.trigger_value));
      } else {
        setWorkflowName("");
        setTriggerType("keyword_match");
        setTriggerValue("");
        setNodes(actionsToNodes([], "keyword_match", ""));
      }
      setSelectedId(null);
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
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
          buttons: (n.buttons || []).map((b) => ({
            ...b,
            next_step: b.next_step === id ? "" : b.next_step,
          })),
        }))
    );
    if (selectedId === id) setSelectedId(null);
  };

  const addNode = (type) => {
    const id = genId();
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
      // calculate full height of this node
      const h = getNodeHeight(node);
      return { x: x + NODE_W / 2, y: y + h };
    }
    // Button port: btn_0, btn_1, ...
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
              <button className="vfb-zoom-btn" onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}>
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
              {SIDEBAR_ITEMS.map((type) => {
                const meta = NODE_TYPES[type];
                const Icon = meta.icon;
                return (
                  <div
                    key={type}
                    className="vfb-sidebar-node"
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
                  return (
                    <g key={`${edge.from}-${edge.fromPort}-${edge.to}-${i}`}>
                      <path
                        d={bezierPath(from.x, from.y, to.x, to.y)}
                        className={`vfb-connection-path${isActive ? " vfb-connection-path-active" : ""}`}
                      />
                      <path
                        d={bezierPath(from.x, from.y, to.x, to.y)}
                        className="vfb-connection-flow"
                      />
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
                        <>
                          <div className="vfb-node-preview">
                            {node.text || "Enter button message..."}
                          </div>
                          {node.buttons?.length > 0 && (
                            <div className="vfb-node-buttons-preview">
                              {node.buttons.map((b) => (
                                <span key={b.id} className="vfb-node-btn-tag">{b.title || "Button"}</span>
                              ))}
                            </div>
                          )}
                        </>
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
                    </div>

                    {/* Button port rows for send_buttons */}
                    {node.type === "send_buttons" && node.buttons?.map((btn, bIdx) => (
                      <div key={btn.id} style={{ position: "relative", height: 28 }}>
                        <div
                          className="vfb-port vfb-port-btn-output"
                          onMouseDown={(e) => onPortMouseDown(e, node.id, `btn_${bIdx}`)}
                          title={`Connect "${btn.title || "Button"}"`}
                        />
                      </div>
                    ))}

                    {/* Output port */}
                    <div
                      className="vfb-port vfb-port-output"
                      onMouseDown={(e) => onPortMouseDown(e, node.id, "output")}
                    />
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
                        <label className="vfb-field-label">Buttons (Max 20 characters)</label>
                        <div className="vfb-panel-btn-list">
                          {(selectedNode.buttons || []).map((btn, bIdx) => (
                            <div key={btn.id} className="vfb-panel-btn-item">
                              <input
                                placeholder={`Button ${bIdx + 1} title`}
                                value={btn.title || ""}
                                maxLength={20}
                                onChange={(e) => {
                                  const btns = [...(selectedNode.buttons || [])];
                                  btns[bIdx] = { ...btns[bIdx], title: e.target.value };
                                  updateNode(selectedNode.id, { buttons: btns });
                                }}
                              />
                              <button
                                className="vfb-panel-btn-remove"
                                onClick={() => {
                                  const btns = (selectedNode.buttons || []).filter((_, i) => i !== bIdx);
                                  updateNode(selectedNode.id, { buttons: btns });
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 rounded-lg text-xs h-8 w-full"
                          onClick={() => {
                            const btns = [...(selectedNode.buttons || []), { id: genId(), title: "", next_step: "" }];
                            updateNode(selectedNode.id, { buttons: btns });
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Button
                        </Button>
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

                  {/* ── Node ID (all non-trigger) ──────────── */}
                  {selectedNode.type !== "trigger" && (
                    <div className="vfb-field" style={{ opacity: 0.5 }}>
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
