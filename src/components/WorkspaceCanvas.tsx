import { AnalysisResult, StructuralComponent } from "@/types";
import { utilizationToColor } from "@/lib/analysis";
import clsx from "clsx";
import { useCallback, useMemo, useRef } from "react";

interface WorkspaceCanvasProps {
  mode: "2d" | "3d";
  components: StructuralComponent[];
  analysis: AnalysisResult[];
  selectedId: string | null;
  onCreate: (
    kind: StructuralComponent["kind"],
    position: { x: number; y: number },
  ) => void;
  onMove: (
    id: string,
    position: { x: number; y: number },
  ) => void;
  onSelect: (id: string | null) => void;
}

const gridBackground =
  "linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 0), linear-gradient(180deg, rgba(148, 163, 184, 0.08) 1px, transparent 0)";

export function WorkspaceCanvas({
  mode,
  components,
  analysis,
  selectedId,
  onCreate,
  onMove,
  onSelect,
}: WorkspaceCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const analysisByComponent = useMemo(() => {
    const map = new Map<string, AnalysisResult>();
    analysis.forEach((result) => map.set(result.componentId, result));
    return map;
  }, [analysis]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      const moveId = event.dataTransfer.getData("application/x-component-id");
      if (moveId) {
        onMove(moveId, { x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
        return;
      }

      const kind = event.dataTransfer.getData("application/x-component");
      if (kind) {
        onCreate(kind as StructuralComponent["kind"], {
          x: clamp(x, 0, 100),
          y: clamp(y, 0, 100),
        });
      }
    },
    [onCreate, onMove],
  );

  return (
    <section
      ref={containerRef}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className={clsx(
        "relative flex h-full min-h-[460px] w-full flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner",
      )}
      aria-label="Structural workspace"
    >
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          {mode === "2d" ? "2D Modeling Workspace" : "3D Modeling Workspace"}
        </div>
        <p className="text-xs text-slate-500">
          Drag components into the grid to build your structure.
        </p>
      </header>
      <div
        className={clsx(
          "relative flex-1",
          mode === "3d" ? "bg-slate-100" : "bg-slate-50",
        )}
        style={{
          backgroundImage: gridBackground,
          backgroundSize: "48px 48px",
        }}
      >
        {components.map((component) => {
          const analysisResult = analysisByComponent.get(component.id);
          const color = utilizationToColor(analysisResult?.utilization ?? 0);
          const sizeProps =
            mode === "2d"
              ? {
                  width: `${component.width * 80}px`,
                  height: `${component.height * 80}px`,
                }
              : {
                  width: `${component.width * 60}px`,
                  height: `${component.height * 60}px`,
                  transform: `translateZ(${component.depth * 40}px) rotateX(15deg) rotateY(-20deg)`,
                };
          return (
            <button
              key={component.id}
              type="button"
              draggable
              aria-label={`${component.name} (${component.kind})`}
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  "application/x-component-id",
                  component.id,
                );
                event.dataTransfer.effectAllowed = "move";
              }}
              onClick={() => onSelect(component.id)}
              onFocus={() => onSelect(component.id)}
              className={clsx(
                "group absolute flex cursor-grab flex-col items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-2 py-3 text-xs font-semibold text-slate-700 shadow transition focus:outline-none focus:ring-2 focus:ring-primary",
                selectedId === component.id
                  ? "ring-2 ring-primary"
                  : "hover:border-primary",
              )}
              style={{
                left: `calc(${component.position.x}% - ${
                  mode === "2d"
                    ? component.width * 40
                    : component.width * 30
                }px)`,
                top: `calc(${component.position.y}% - ${
                  mode === "2d"
                    ? component.height * 40
                    : component.height * 30
                }px)`,
                rotate: `${component.rotation}deg`,
                ...sizeProps,
                background:
                  mode === "3d"
                    ? `linear-gradient(145deg, ${color}cc, #f8fafc)`
                    : `${color}22`,
                boxShadow:
                  mode === "3d"
                    ? "10px 12px 20px rgba(15, 23, 42, 0.15)"
                    : "0 8px 16px rgba(15, 23, 42, 0.08)",
              }}
            >
              <span className="text-slate-900">{component.name}</span>
              <span className="text-[10px] text-slate-500">
                {component.constraint.toUpperCase()}
              </span>
              {analysisResult ? (
                <span className="mt-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  Utilization: {(analysisResult.utilization * 100).toFixed(0)}%
                </span>
              ) : null}
            </button>
          );
        })}
        {components.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">
            Drag components from the palette or press Enter on a component to
            add it to the workspace.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
