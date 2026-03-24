import { useState, useRef, useCallback } from "react";
import { X, GripVertical } from "lucide-react";

const DraggableElement = ({
  id,
  position,
  onPositionChange,
  onRemove,
  isSelected,
  onSelect,
  children,
  containerRef,
  removable = false,
}) => {
  const elRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const handleMouseDown = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect(id);
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };

      const onMove = (ev) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const dx = ev.clientX - dragStart.current.x;
        const dy = ev.clientY - dragStart.current.y;
        const newX = Math.max(0, Math.min(rect.width - 20, dragStart.current.px + dx));
        const newY = Math.max(0, Math.min(rect.height - 20, dragStart.current.py + dy));
        onPositionChange(id, { x: newX, y: newY });
      };

      const onUp = () => {
        setDragging(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [id, position, onPositionChange, onSelect, containerRef]
  );

  // Touch support
  const handleTouchStart = useCallback(
    (e) => {
      e.stopPropagation();
      onSelect(id);
      setDragging(true);
      const touch = e.touches[0];
      dragStart.current = { x: touch.clientX, y: touch.clientY, px: position.x, py: position.y };

      const onMove = (ev) => {
        ev.preventDefault();
        const t = ev.touches[0];
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const dx = t.clientX - dragStart.current.x;
        const dy = t.clientY - dragStart.current.y;
        const newX = Math.max(0, Math.min(rect.width - 20, dragStart.current.px + dx));
        const newY = Math.max(0, Math.min(rect.height - 20, dragStart.current.py + dy));
        onPositionChange(id, { x: newX, y: newY });
      };

      const onUp = () => {
        setDragging(false);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onUp);
      };

      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
    },
    [id, position, onPositionChange, onSelect, containerRef]
  );

  return (
    <div
      ref={elRef}
      className={`absolute select-none ${dragging ? "cursor-grabbing z-50" : "cursor-grab z-20"}`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={(e) => { e.stopPropagation(); onSelect(id); }}
    >
      {isSelected && (
        <div className="absolute -inset-1 border-2 border-blue-400 rounded pointer-events-none" />
      )}
      {isSelected && (
        <div className="absolute -top-6 left-0 flex gap-1">
          <div className="bg-blue-500 text-white rounded px-1 py-0.5 flex items-center">
            
          </div>
          {removable && onRemove && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              className="bg-red-500 text-white rounded px-1 py-0.5 hover:bg-red-600"
            >
              
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default DraggableElement;
