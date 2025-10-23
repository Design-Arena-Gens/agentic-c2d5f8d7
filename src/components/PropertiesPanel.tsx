import { Material, StructuralComponent } from "@/types";
import { useId, useState } from "react";

interface PropertiesPanelProps {
  component: StructuralComponent | null;
  materials: Material[];
  onUpdate: (id: string, update: Partial<StructuralComponent>) => void;
  onAddLoad: (id: string) => void;
  onUpdateLoad: (
    componentId: string,
    loadId: string,
    update: {
      label?: string;
      magnitude?: number;
      direction?: StructuralComponent["loads"][number]["direction"];
    },
  ) => void;
  onRemoveLoad: (componentId: string, loadId: string) => void;
}

const constraintOptions = [
  { value: "fixed", label: "Fixed" },
  { value: "pinned", label: "Pinned" },
  { value: "roller", label: "Roller" },
  { value: "free", label: "Free" },
];

export function PropertiesPanel({
  component,
  materials,
  onUpdate,
  onAddLoad,
  onUpdateLoad,
  onRemoveLoad,
}: PropertiesPanelProps) {
  const sectionId = useId();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  if (!component) {
    return (
      <aside
        aria-labelledby={`${sectionId}-title`}
        className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
      >
        <h2
          id={`${sectionId}-title`}
          className="text-base font-semibold text-slate-900"
        >
          Properties
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Select a component to edit geometric parameters, material properties,
          loads, and boundary conditions. Keyboard users can press Tab to
          navigate components in the workspace.
        </p>
      </aside>
    );
  }

  return (
    <aside
      aria-labelledby={`${sectionId}-title`}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur"
    >
      <header>
        <h2
          id={`${sectionId}-title`}
          className="text-base font-semibold text-slate-900"
        >
          {component.name}
        </h2>
        <p className="text-xs uppercase tracking-wide text-primary">
          {component.kind}
        </p>
      </header>

      <div className="space-y-3">
        <Field label="Label">
          <input
            type="text"
            value={component.name}
            onChange={(event) =>
              onUpdate(component.id, { name: event.target.value })
            }
            className="input"
          />
        </Field>
        <Field label="Material">
          <select
            value={component.materialId}
            className="input"
            onChange={(event) =>
              onUpdate(component.id, { materialId: event.target.value })
            }
          >
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Width (m)">
          <input
            type="number"
            min={0.1}
            step={0.1}
            className="input"
            value={component.width}
            onChange={(event) =>
              onUpdate(component.id, {
                width: parseFloat(event.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Height (m)">
          <input
            type="number"
            min={0.1}
            step={0.1}
            className="input"
            value={component.height}
            onChange={(event) =>
              onUpdate(component.id, {
                height: parseFloat(event.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Depth (m)">
          <input
            type="number"
            min={0.1}
            step={0.1}
            className="input"
            value={component.depth}
            onChange={(event) =>
              onUpdate(component.id, {
                depth: parseFloat(event.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Rotation (°)">
          <input
            type="number"
            step={1}
            className="input"
            value={component.rotation}
            onChange={(event) =>
              onUpdate(component.id, {
                rotation: parseFloat(event.target.value) || 0,
              })
            }
          />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-900">
          Boundary Condition
        </legend>
        <div className="flex flex-wrap gap-2">
          {constraintOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary focus-within:ring-2 focus-within:ring-primary"
            >
              <input
                type="radio"
                name={`${component.id}-constraint`}
                className="h-3.5 w-3.5 text-primary focus:ring-primary"
                value={option.value}
                checked={component.constraint === option.value}
                onChange={() =>
                  onUpdate(component.id, {
                    constraint: option.value as StructuralComponent["constraint"],
                  })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Loads</h3>
          <button
            type="button"
            className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => onAddLoad(component.id)}
          >
            Add Load
          </button>
        </div>
        <ul className="mt-3 space-y-3">
          {component.loads.map((load) => (
            <li
              key={load.id}
              className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3"
            >
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  className="input"
                  value={load.label}
                  onChange={(event) =>
                    onUpdateLoad(component.id, load.id, {
                      label: event.target.value,
                    })
                  }
                  aria-label="Load label"
                />
                <select
                  className="input w-28"
                  value={load.direction}
                  onChange={(event) =>
                  onUpdateLoad(component.id, load.id, {
                    direction: event.target.value as StructuralComponent["loads"][number]["direction"],
                  })
                  }
                  aria-label="Load direction"
                >
                  <option value="axial">Axial</option>
                  <option value="shear">Shear</option>
                  <option value="moment">Moment</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-500">
                  Magnitude (kN)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={1}
                    className="input w-24"
                    value={load.magnitude}
                    onChange={(event) =>
                      onUpdateLoad(component.id, load.id, {
                        magnitude: parseFloat(event.target.value) || 0,
                      })
                    }
                  />
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                    onClick={() => onRemoveLoad(component.id, load.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
          {component.loads.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
              No loads defined. Click &quot;Add Load&quot; to apply forces,
              shear, or moments.
            </li>
          ) : null}
        </ul>
      </section>

      <button
        type="button"
        className="text-left text-xs font-medium text-primary underline decoration-dotted underline-offset-4 hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setIsAdvancedOpen((value) => !value)}
      >
        {isAdvancedOpen ? "Hide alignment controls" : "Show alignment controls"}
      </button>

      {isAdvancedOpen ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="X Position (%)">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              className="input"
              value={component.position.x}
              onChange={(event) =>
                onUpdate(component.id, {
                  position: {
                    ...component.position,
                    x: parseFloat(event.target.value) || 0,
                  },
                })
              }
            />
          </Field>
          <Field label="Y Position (%)">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              className="input"
              value={component.position.y}
              onChange={(event) =>
                onUpdate(component.id, {
                  position: {
                    ...component.position,
                    y: parseFloat(event.target.value) || 0,
                  },
                })
              }
            />
          </Field>
        </div>
      ) : null}
    </aside>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const fieldId = useId();
  return (
    <label className="block text-xs font-medium text-slate-600">
      <span>{label}</span>
      <div className="mt-1" id={fieldId}>
        {children}
      </div>
    </label>
  );
}
