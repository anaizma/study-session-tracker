import { useState, useRef, useEffect } from 'react';

export interface WheelPickerOption<T extends string | number = string | number> {
  label: string;
  value: T;
}

const ITEM_H = 44;
const VISIBLE = 5;

interface WheelPickerProps<T extends string | number> {
  options: WheelPickerOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  infinite?: boolean;
}

export function WheelPicker<T extends string | number>({
  options,
  value,
  onChange,
  infinite = false,
}: WheelPickerProps<T>) {
  const count = options.length;

  const findIndex = (v: T | undefined) => {
    const i = options.findIndex((o) => o.value === v);
    return i >= 0 ? i : 0;
  };

  const [index, setIndex] = useState(() => findIndex(value));
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startIndex = useRef(0);

  // Sync when controlled value changes (e.g. startEdit)
  useEffect(() => {
    const i = findIndex(value);
    setIndex(i);
    setDragOffset(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const normalize = (i: number) =>
    infinite
      ? ((i % count) + count) % count
      : Math.max(0, Math.min(count - 1, i));

  const items = infinite ? [...options, ...options, ...options] : options;
  const baseDisplayIndex = infinite ? index + count : index;

  // Live visual index while dragging (for item highlighting)
  const liveDelta = dragging ? Math.round(dragOffset / ITEM_H) : 0;
  const visualIndex = normalize(index + liveDelta);

  const translateY =
    Math.floor(VISIBLE / 2) * ITEM_H - baseDisplayIndex * ITEM_H - dragOffset;

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startY.current = e.clientY;
    startIndex.current = index;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragOffset(startY.current - e.clientY);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    const delta = Math.round(dragOffset / ITEM_H);
    const newIndex = normalize(startIndex.current + delta);
    setIndex(newIndex);
    setDragOffset(0);
    onChange?.(options[newIndex].value);
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    const newIndex = normalize(index + (e.deltaY > 0 ? 1 : -1));
    setIndex(newIndex);
    onChange?.(options[newIndex].value);
  }

  return (
    <div
      style={{
        position: 'relative',
        height: ITEM_H * VISIBLE,
        width: 64,
        overflow: 'hidden',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      {/* Center selection highlight */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 4,
          right: 4,
          height: ITEM_H,
          transform: 'translateY(-50%)',
          background: 'rgba(79,70,229,0.08)',
          border: '1px solid rgba(79,70,229,0.2)',
          borderRadius: 8,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Items */}
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          transition: dragging
            ? 'none'
            : 'transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94)',
          willChange: 'transform',
        }}
      >
        {items.map((opt, i) => {
          const itemValue = infinite ? i % count : i;
          const isActive = itemValue === visualIndex;
          return (
            <div
              key={i}
              style={{
                height: ITEM_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#4f46e5' : '#9ca3af',
              }}
            >
              {opt.label}
            </div>
          );
        })}
      </div>

      {/* Top fade */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: ITEM_H * 2,
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.96) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      {/* Bottom fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: ITEM_H * 2,
          background:
            'linear-gradient(to top, rgba(255,255,255,0.96) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
    </div>
  );
}

export function WheelPickerWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'white',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        padding: '0 8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  );
}
