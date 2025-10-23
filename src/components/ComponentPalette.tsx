import { ComponentKind } from "@/types";
import { useId } from "react";

interface ComponentPaletteProps {
  onCreate: (kind: ComponentKind) => void;
}

const paletteItems: {
  kind: ComponentKind;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    kind: "wall",
    name: "Wall Panel",
    description: "Vertical element for lateral and gravity loads.",
    icon: "🧱",
  },
  {
    kind: "beam",
    name: "Beam",
    description: "Horizontal member spanning between supports.",
    icon: "—",
  },
  {
    kind: "column",
    name: "Column",
    description: "Compression member transferring axial loads.",
    icon: "▮",
  },
  {
    kind: "support",
    name: "Support",
    description: "Boundary condition or restraint.",
    icon: "⟂",
  },
];

export function ComponentPalette({ onCreate }: ComponentPaletteProps) {
  const paletteId = useId();

  return (
    <section
      aria-labelledby={`${paletteId}-title`}
      className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur"
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id={`${paletteId}-title`}
          className="text-base font-semibold text-slate-900"
        >
          Components
        </h2>
        <span className="text-xs font-medium uppercase text-slate-500">
          Drag & Drop
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {paletteItems.map((item) => (
          <li key={item.kind}>
            <button
              type="button"
              onClick={() => onCreate(item.kind)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onCreate(item.kind);
                }
              }}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "copy";
                event.dataTransfer.setData("application/x-component", item.kind);
              }}
              className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-primary hover:bg-slate-50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary"
              >
                {item.icon}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {item.name}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {item.description}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
