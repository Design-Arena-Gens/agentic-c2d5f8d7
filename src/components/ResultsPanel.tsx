import { AnalysisResult, Material, StructuralComponent } from "@/types";
import { utilizationToColor } from "@/lib/analysis";
import { useMemo } from "react";

interface ResultsPanelProps {
  components: StructuralComponent[];
  materials: Material[];
  analysis: AnalysisResult[];
  onGenerateReport: () => void;
}

export function ResultsPanel({
  components,
  materials,
  analysis,
  onGenerateReport,
}: ResultsPanelProps) {
  const materialMap = useMemo(
    () => new Map(materials.map((material) => [material.id, material])),
    [materials],
  );

  const overallUtilization = useMemo(() => {
    if (!analysis.length) return 0;
    const sum = analysis.reduce((acc, { utilization }) => acc + utilization, 0);
    return sum / analysis.length;
  }, [analysis]);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Analysis Results
          </h2>
          <p className="text-xs text-slate-500">
            Real-time stress and utilization with color-coded performance.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerateReport}
          className="rounded-full border border-secondary/40 bg-secondary px-3 py-1 text-xs font-semibold text-white shadow hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
        >
          Generate Report
        </button>
      </header>

      <div className="rounded-xl border border-slate-200 bg-slate-100/60 p-4">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Overall Utilization</span>
          <span>{(overallUtilization * 100).toFixed(0)}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, overallUtilization * 100)}%`,
              backgroundColor: utilizationToColor(overallUtilization),
            }}
          />
        </div>
        <p className="mt-3 text-[11px] text-slate-500">
          Utilization is calculated using an approximate Von Mises criterion
          relative to material yield strength. Aim to keep below 80% for safe
          designs.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Components</h3>
        <ul className="mt-3 space-y-3">
          {components.map((component) => {
            const result = analysis.find(
              (item) => item.componentId === component.id,
            );
            const material = materialMap.get(component.materialId);
            return (
              <li
                key={component.id}
                className="rounded-xl border border-slate-200 bg-white/90 p-3 text-xs text-slate-600 shadow-sm"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                  <span>{component.name}</span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{
                      backgroundColor: `${utilizationToColor(
                        result?.utilization ?? 0,
                      )}22`,
                      color: utilizationToColor(result?.utilization ?? 0),
                    }}
                  >
                    {(result?.utilization ?? 0).toFixed(2)}
                  </span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div>
                    <dt className="text-slate-400">Material</dt>
                    <dd className="text-slate-600">{material?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Safety Factor</dt>
                    <dd className="text-slate-600">
                      {result?.safetyFactor
                        ? result.safetyFactor.toFixed(2)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Axial Stress</dt>
                    <dd className="text-slate-600">
                      {(result?.axialStress ?? 0).toFixed(2)} MPa
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Shear Stress</dt>
                    <dd className="text-slate-600">
                      {(result?.shearStress ?? 0).toFixed(2)} MPa
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Von Mises</dt>
                    <dd className="text-slate-600">
                      {(result?.vonMises ?? 0).toFixed(2)} MPa
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Loads</dt>
                    <dd className="text-slate-600">
                      {component.loads.length
                        ? component.loads
                            .map(
                              (load) =>
                                `${load.label} (${load.magnitude.toFixed(
                                  1,
                                )} kN ${load.direction})`,
                            )
                            .join(", ")
                        : "None"}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
          {!components.length ? (
            <li className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">
              Add components to see live analysis summaries here.
            </li>
          ) : null}
        </ul>
      </div>

      <footer className="space-y-2 rounded-xl border border-slate-200 bg-slate-100/70 p-3 text-[11px] text-slate-500">
        <p>
          Color coding:{" "}
          <span className="font-semibold text-secondary">Green</span> (&lt;50%),
          <span className="font-semibold text-[#ffc107]"> Amber</span> (50-80%),
          <span className="font-semibold text-[#fd7e14]"> Orange</span>{" "}
          (80-100%),{" "}
          <span className="font-semibold text-[#dc3545]">Red</span> (&gt;100%).
        </p>
        <p>
          Simulations are conceptual and intended for early-stage structural
          design exploration.
        </p>
      </footer>
    </section>
  );
}
