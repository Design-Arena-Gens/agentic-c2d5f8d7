'use client';

import { useMemo, useState } from "react";
import { ComponentPalette } from "@/components/ComponentPalette";
import { WorkspaceCanvas } from "@/components/WorkspaceCanvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { MaterialLibrary } from "@/components/MaterialLibrary";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ReportModal } from "@/components/ReportModal";
import { defaultMaterials } from "@/lib/materials";
import { computeAnalysis } from "@/lib/analysis";
import {
  AnalysisResult,
  ComponentKind,
  Material,
  StructuralComponent,
} from "@/types";

const defaultDimensions: Record<ComponentKind, { width: number; height: number; depth: number }> =
  {
    wall: { width: 4, height: 3, depth: 0.3 },
    beam: { width: 6, height: 0.6, depth: 0.4 },
    column: { width: 0.5, height: 3, depth: 0.5 },
    support: { width: 1.2, height: 0.4, depth: 0.4 },
  };

const globalHotkeys = [
  { key: "Shift+Click", action: "Select multiple loads in reports (desktop)" },
  { key: "Tab / Shift+Tab", action: "Cycle focus between UI panels" },
  { key: "Enter", action: "Add highlighted palette item to workspace" },
];

export default function Home() {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [materials, setMaterials] = useState<Material[]>(defaultMaterials);
  const [components, setComponents] = useState<StructuralComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const analysis = useMemo<AnalysisResult[]>(
    () => computeAnalysis(components, materials),
    [components, materials],
  );

  const selectedComponent = useMemo(
    () => components.find((component) => component.id === selectedId) ?? null,
    [components, selectedId],
  );

  const reportContent = useMemo(() => {
    const lines: string[] = [];
    lines.push("Structural Design Summary");
    lines.push(`Mode: ${mode === "2d" ? "2D Plan" : "3D Perspective"}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("Materials:");
    materials.forEach((material) => {
      lines.push(
        `- ${material.name}: Density ${material.density} kg/m3, E ${material.elasticModulus} GPa, Yield ${material.yieldStrength} MPa`,
      );
    });
    lines.push("");
    lines.push("Components:");
    components.forEach((component) => {
      const result = analysis.find(
        (item) => item.componentId === component.id,
      );
      lines.push(
        `- ${component.name} (${component.kind}) @ (${component.position.x.toFixed(
          1,
        )}%, ${component.position.y.toFixed(1)}%)`,
      );
      lines.push(
        `  Geometry: ${component.width.toFixed(2)}m x ${component.height.toFixed(
          2,
        )}m x ${component.depth.toFixed(2)}m`,
      );
      lines.push(`  Material: ${component.materialId}`);
      lines.push(
        `  Constraint: ${component.constraint}, Rotation: ${component.rotation.toFixed(
          0,
        )}°`,
      );
      lines.push(
        `  Loads: ${
          component.loads.length
            ? component.loads
                .map(
                  (load) =>
                    `${load.label} (${load.magnitude.toFixed(
                      1,
                    )} kN ${load.direction})`,
                )
                .join("; ")
            : "None"
        }`,
      );
      if (result) {
        lines.push(
          `  Analysis: Axial ${result.axialStress.toFixed(
            2,
          )} MPa, Shear ${result.shearStress.toFixed(
            2,
          )} MPa, Von Mises ${result.vonMises.toFixed(2)} MPa`,
        );
        lines.push(
          `  Utilization: ${(result.utilization * 100).toFixed(
            1,
          )}%, Safety Factor ${result.safetyFactor.toFixed(2)}`,
        );
      }
      lines.push("");
    });
    return lines.join("\n");
  }, [analysis, components, materials, mode]);

  const handleCreateComponent = (
    kind: ComponentKind,
    position: { x: number; y: number },
  ) => {
    const id = crypto.randomUUID();
    const countOfKind =
      components.filter((component) => component.kind === kind).length + 1;
    const defaults = defaultDimensions[kind];
    const nextComponent: StructuralComponent = {
      id,
      name: `${capitalize(kind)} ${countOfKind}`,
      kind,
      materialId: materials[0]?.id ?? "",
      width: defaults.width,
      height: defaults.height,
      depth: defaults.depth,
      rotation: 0,
      position,
      loads: [],
      constraint: kind === "support" ? "fixed" : "pinned",
    };
    setComponents((current) => [...current, nextComponent]);
    setSelectedId(id);
  };

  const handleMoveComponent = (
    id: string,
    position: { x: number; y: number },
  ) => {
    setComponents((current) =>
      current.map((component) =>
        component.id === id ? { ...component, position } : component,
      ),
    );
  };

  const handleUpdateComponent = (
    id: string,
    update: Partial<StructuralComponent>,
  ) => {
    setComponents((current) =>
      current.map((component) =>
        component.id === id
          ? {
              ...component,
              ...update,
              position: update.position
                ? {
                    x: clamp(update.position.x, 0, 100),
                    y: clamp(update.position.y, 0, 100),
                  }
                : component.position,
            }
          : component,
      ),
    );
  };

  const handleAddLoad = (componentId: string) => {
    setComponents((current) =>
      current.map((component) =>
        component.id === componentId
          ? {
              ...component,
              loads: [
                ...component.loads,
                {
                  id: crypto.randomUUID(),
                  label: `Load ${component.loads.length + 1}`,
                  magnitude: 10,
                  direction: "axial",
                },
              ],
            }
          : component,
      ),
    );
  };

  const handleUpdateLoad = (
    componentId: string,
    loadId: string,
    update: {
      label?: string;
      magnitude?: number;
      direction?: StructuralComponent["loads"][number]["direction"];
    },
  ) => {
    setComponents((current) =>
      current.map((component) =>
        component.id === componentId
          ? {
              ...component,
              loads: component.loads.map((load) =>
                load.id === loadId ? { ...load, ...update } : load,
              ),
            }
          : component,
      ),
    );
  };

  const handleRemoveLoad = (componentId: string, loadId: string) => {
    setComponents((current) =>
      current.map((component) =>
        component.id === componentId
          ? {
              ...component,
              loads: component.loads.filter((load) => load.id !== loadId),
            }
          : component,
      ),
    );
  };

  const handleAddMaterial = (material: Material) => {
    setMaterials((current) => [...current, material]);
  };

  const handleUpdateMaterial = (id: string, update: Partial<Material>) => {
    setMaterials((current) =>
      current.map((material) =>
        material.id === id ? { ...material, ...update } : material,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 rounded-3xl bg-white/80 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Agentic Structural Studio
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Model, simulate, and iterate on structural concepts in real time.
              Drag components into the workspace, tune material properties, and
              review live performance metrics optimised for mobile-first
              workflows.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("2d")}
              className={`rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${
                mode === "2d"
                  ? "bg-primary text-white shadow"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary"
              }`}
            >
              2D View
            </button>
            <button
              type="button"
              onClick={() => setMode("3d")}
              className={`rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${
                mode === "3d"
                  ? "bg-primary text-white shadow"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary"
              }`}
            >
              3D View
            </button>
            <button
              type="button"
              onClick={() => {
                setComponents([]);
                setSelectedId(null);
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Reset Workspace
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr)] xl:grid-cols-[360px,minmax(0,1fr)]">
          <div className="space-y-6">
            <ComponentPalette
              onCreate={(kind) =>
                handleCreateComponent(kind, { x: 50, y: 50 })
              }
            />
            <MaterialLibrary
              materials={materials}
              onAddMaterial={handleAddMaterial}
              onUpdateMaterial={handleUpdateMaterial}
            />
            <section className="rounded-xl border border-slate-200 bg-white/80 p-4 text-xs text-slate-600 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Accessibility Shortcuts
              </h2>
              <ul className="mt-3 space-y-2">
                {globalHotkeys.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="font-semibold text-slate-500">
                      {item.key}
                    </span>
                    <span className="text-slate-600">{item.action}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => {
                    if (!selectedComponent) return;
                    handleAddLoad(selectedComponent.id);
                  }}
                >
                  Apply Load to Selection
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => {
                    if (!selectedComponent) return;
                    handleUpdateComponent(selectedComponent.id, {
                      constraint:
                        selectedComponent.constraint === "fixed"
                          ? "pinned"
                          : "fixed",
                    });
                  }}
                >
                  Toggle Boundary (Fixed/Pinned)
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 font-semibold hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => {
                    if (!selectedComponent) return;
                    handleUpdateComponent(selectedComponent.id, {
                      rotation: (selectedComponent.rotation + 15) % 360,
                    });
                  }}
                >
                  Rotate +15°
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Use the quick tools to experiment with load cases and boundary
                definitions. Full details remain editable inside the Properties
                panel.
              </p>
            </div>
            <WorkspaceCanvas
              mode={mode}
              components={components}
              analysis={analysis}
              selectedId={selectedId}
              onCreate={handleCreateComponent}
              onMove={handleMoveComponent}
              onSelect={setSelectedId}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <PropertiesPanel
                component={selectedComponent}
                materials={materials}
                onUpdate={handleUpdateComponent}
                onAddLoad={handleAddLoad}
                onUpdateLoad={handleUpdateLoad}
                onRemoveLoad={handleRemoveLoad}
              />
              <ResultsPanel
                components={components}
                materials={materials}
                analysis={analysis}
                onGenerateReport={() => setReportOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        content={reportContent}
        onClose={() => setReportOpen(false)}
      />
    </main>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
