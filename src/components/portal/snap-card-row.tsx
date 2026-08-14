import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Gallery-style drag / swipe / snap row.
 * - pointer down starts the drag, the row follows the pointer 1:1
 * - release snaps to the nearest card, or the flicked-toward card
 * - dragging past the first/last card is clamped (with a soft rubber-band)
 */
export function SnapCardRow<T>({
  items,
  getKey,
  renderItem,
  index,
  onIndexChange,
  className,
  label = "Assigned work",
}: {
  items: T[];
  getKey: (item: T, i: number) => string;
  renderItem: (item: T, i: number, active: boolean) => React.ReactNode;
  index?: number;
  onIndexChange?: (i: number) => void;
  className?: string;
  label?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(index ?? 0);
  const [offset, setOffset] = useState(0); // px translate of the track
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(1);

  const drag = useRef({ id: -1, startX: 0, startOffset: 0, lastX: 0, lastT: 0, v: 0, moved: false });

  const count = items.length;
  const clampIndex = useCallback((i: number) => Math.max(0, Math.min(count - 1, i)), [count]);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    if (!first) return;
    const s = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    setStep(Math.max(1, s));
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [measure, count]);

  // keep offset aligned to the active card whenever not dragging
  useEffect(() => {
    if (!dragging) setOffset(-clampIndex(active) * step);
  }, [active, step, dragging, clampIndex]);

  useEffect(() => {
    if (index !== undefined) setActive(clampIndex(index));
  }, [index, clampIndex]);

  const commit = useCallback(
    (i: number) => {
      const next = clampIndex(i);
      setActive(next);
      setOffset(-next * step);
      onIndexChange?.(next);
    },
    [clampIndex, step, onIndexChange],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const t = e.target as HTMLElement;
    if (t.closest("input,textarea,select,[data-no-drag]")) return;
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startOffset: offset,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: false,
    };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || e.pointerId !== drag.current.id) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    const now = performance.now();
    const dt = now - drag.current.lastT;
    if (dt > 0) drag.current.v = (e.clientX - drag.current.lastX) / dt; // px/ms
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;

    const min = -(count - 1) * step;
    let next = drag.current.startOffset + dx;
    // rubber-band resistance past the edges, hard clamp so it never runs away
    if (next > 0) next = Math.min(step * 0.18, next * 0.25);
    if (next < min) next = Math.max(min - step * 0.18, min + (next - min) * 0.25);
    setOffset(next);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (e.pointerId !== drag.current.id) return;
    setDragging(false);
    if (!drag.current.moved) {
      setOffset(-active * step);
      return;
    }
    const raw = -offset / step;
    const v = drag.current.v; // >0 means dragging right => previous card
    const flick = Math.abs(v) > 0.45;
    const target = flick ? (v > 0 ? Math.floor(raw) : Math.ceil(raw)) : Math.round(raw);
    commit(target);
  };

  if (count === 0) return null;

  return (
    <div className={cn("select-none", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Previous card" disabled={active === 0} onClick={() => commit(active - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="tabular w-14 text-center text-[11px] text-muted-foreground">{active + 1} / {count}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Next card" disabled={active === count - 1} onClick={() => commit(active + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        role="group"
        aria-label={label}
        tabIndex={0}
        className={cn(
          "overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); commit(active + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); commit(active - 1); }
        }}
      >
        <div
          ref={trackRef}
          className={cn("flex touch-pan-y items-stretch gap-3", dragging ? "" : "transition-transform duration-300 ease-out")}
          style={{ transform: `translate3d(${offset}px,0,0)` }}
        >
          {items.map((item, i) => (
            <div
              key={getKey(item, i)}
              className={cn(
                "w-[min(20rem,82%)] shrink-0 transition-opacity duration-200",
                i === active ? "opacity-100" : "opacity-60",
              )}
              aria-current={i === active ? "true" : undefined}
            >
              {renderItem(item, i, i === active)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {items.map((item, i) => (
          <button
            key={getKey(item, i)}
            type="button"
            aria-label={`Go to card ${i + 1}`}
            onClick={() => commit(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-5 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
