import { Material } from "@/types";
import { useId, useState } from "react";

interface MaterialLibraryProps {
  materials: Material[];
  onAddMaterial: (material: Material) => void;
  onUpdateMaterial: (id: string, update: Partial<Material>) => void;
}

export function MaterialLibrary({
  materials,
  onAddMaterial,
  onUpdateMaterial,
}: MaterialLibraryProps) {
  const sectionId = useId();
  const [draft, setDraft] = useState({
    name: "",
    density: "",
    elasticModulus: "",
    yieldStrength: "",
    description: "",
  });

  return (
    <section
      aria-labelledby={`${sectionId}-title`}
      className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
    >
      <h2
        id={`${sectionId}-title`}
        className="text-base font-semibold text-slate-900"
      >
        Material Library
      </h2>
      <p className="mt-2 text-xs text-slate-500">
        Select and customize material properties to reflect project-specific
        data. All stresses are benchmarked against yield strength.
      </p>

      <ul className="mt-4 space-y-3">
        {materials.map((material) => (
          <li
            key={material.id}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-800">
                {material.name}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {material.yieldStrength.toFixed(0)} MPa
              </span>
            </div>
            {material.description ? (
              <p className="mt-1 text-[11px] text-slate-500">
                {material.description}
              </p>
            ) : null}
            <dl className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
              <EditableValue
                label="Density (kg/m³)"
                value={material.density}
                onChange={(value) =>
                  onUpdateMaterial(material.id, { density: value })
                }
              />
              <EditableValue
                label="Elasticity (GPa)"
                value={material.elasticModulus}
                onChange={(value) =>
                  onUpdateMaterial(material.id, { elasticModulus: value })
                }
              />
              <EditableValue
                label="Yield (MPa)"
                value={material.yieldStrength}
                onChange={(value) =>
                  onUpdateMaterial(material.id, { yieldStrength: value })
                }
              />
            </dl>
          </li>
        ))}
      </ul>

      <form
        className="mt-5 space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3 text-xs"
        onSubmit={(event) => {
          event.preventDefault();
          const density = Number(draft.density);
          const elasticModulus = Number(draft.elasticModulus);
          const yieldStrength = Number(draft.yieldStrength);
          if (!draft.name || isNaN(density) || isNaN(elasticModulus) || isNaN(yieldStrength)) {
            return;
          }
          onAddMaterial({
            id: crypto.randomUUID(),
            name: draft.name,
            density,
            elasticModulus,
            yieldStrength,
            description: draft.description,
          });
          setDraft({
            name: "",
            density: "",
            elasticModulus: "",
            yieldStrength: "",
            description: "",
          });
        }}
      >
        <p className="text-xs font-semibold text-slate-600">
          Add Custom Material
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            aria-label="Material name"
            required
            placeholder="Name"
            className="input"
            value={draft.name}
            onChange={(event) =>
              setDraft((state) => ({ ...state, name: event.target.value }))
            }
          />
          <input
            aria-label="Density kg per cubic meter"
            required
            type="number"
            step={10}
            placeholder="Density"
            className="input"
            value={draft.density}
            onChange={(event) =>
              setDraft((state) => ({ ...state, density: event.target.value }))
            }
          />
          <input
            aria-label="Elastic modulus in GPa"
            required
            type="number"
            step={1}
            placeholder="Elasticity"
            className="input"
            value={draft.elasticModulus}
            onChange={(event) =>
              setDraft((state) => ({
                ...state,
                elasticModulus: event.target.value,
              }))
            }
          />
          <input
            aria-label="Yield strength in MPa"
            required
            type="number"
            step={5}
            placeholder="Yield strength"
            className="input"
            value={draft.yieldStrength}
            onChange={(event) =>
              setDraft((state) => ({
                ...state,
                yieldStrength: event.target.value,
              }))
            }
          />
        </div>
        <textarea
          aria-label="Material description"
          className="input h-16 resize-none"
          placeholder="Notes"
          value={draft.description}
          onChange={(event) =>
            setDraft((state) => ({
              ...state,
              description: event.target.value,
            }))
          }
        />
        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Save Material
        </button>
      </form>
    </section>
  );
}

function EditableValue({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-[10px] font-medium text-slate-500">
      {label}
      <input
        type="number"
        className="input"
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value) || 0)}
      />
    </label>
  );
}
