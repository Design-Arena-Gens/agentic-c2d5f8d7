export type ComponentKind = "wall" | "beam" | "column" | "support";

export interface Material {
  id: string;
  name: string;
  density: number; // kg/m3
  elasticModulus: number; // GPa
  yieldStrength: number; // MPa
  description?: string;
}

export type ConstraintType = "fixed" | "pinned" | "roller" | "free";

export interface Load {
  id: string;
  label: string;
  magnitude: number; // kN
  direction: "axial" | "shear" | "moment";
}

export interface StructuralComponent {
  id: string;
  name: string;
  kind: ComponentKind;
  materialId: string;
  width: number; // meters
  height: number; // meters
  depth: number; // meters (for 3D)
  rotation: number; // degrees
  position: {
    x: number; // percentage
    y: number; // percentage
  };
  loads: Load[];
  constraint: ConstraintType;
}

export interface AnalysisResult {
  componentId: string;
  axialStress: number;
  shearStress: number;
  vonMises: number;
  utilization: number;
  safetyFactor: number;
}
