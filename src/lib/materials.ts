import { Material } from "@/types";

export const defaultMaterials: Material[] = [
  {
    id: "concrete-c30",
    name: "Concrete C30",
    density: 2400,
    elasticModulus: 30,
    yieldStrength: 30,
    description: "Standard structural concrete for general purpose members.",
  },
  {
    id: "steel-s355",
    name: "Structural Steel S355",
    density: 7850,
    elasticModulus: 200,
    yieldStrength: 355,
    description:
      "High strength steel for beams and columns with excellent ductility.",
  },
  {
    id: "timber-gl24",
    name: "Glulam Timber GL24",
    density: 450,
    elasticModulus: 14,
    yieldStrength: 24,
    description:
      "Engineered timber laminate, lightweight with moderate stiffness.",
  },
  {
    id: "frp-plate",
    name: "FRP Plate",
    density: 1900,
    elasticModulus: 45,
    yieldStrength: 500,
    description: "Fiber reinforced polymer plate for retrofits and wraps.",
  },
];
