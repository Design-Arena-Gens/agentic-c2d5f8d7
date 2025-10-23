import { AnalysisResult, Material, StructuralComponent } from "@/types";

const minArea = 1e-4; // m^2 safeguard

export function computeAnalysis(
  components: StructuralComponent[],
  materials: Material[],
): AnalysisResult[] {
  const materialMap = new Map(materials.map((material) => [material.id, material]));

  return components.map((component) => {
    const material = materialMap.get(component.materialId);
    const area = Math.max(component.width * component.height, minArea);
    const axialLoad = component.loads
      .filter((load) => load.direction === "axial")
      .reduce((acc, load) => acc + load.magnitude, 0);
    const shearLoad = component.loads
      .filter((load) => load.direction === "shear")
      .reduce((acc, load) => acc + load.magnitude, 0);
    const momentLoad = component.loads
      .filter((load) => load.direction === "moment")
      .reduce((acc, load) => acc + load.magnitude, 0);

    const axialStress = (axialLoad * 1000) / area / 1e6; // MPa
    const shearStress = (shearLoad * 1000) / area / 1e6; // MPa
    const bendingStress =
      (6 * momentLoad * 1000) / (component.width * Math.pow(component.height, 2) || minArea) / 1e6;
    const combinedAxial = axialStress + bendingStress;
    const vonMises = Math.sqrt(
      Math.max(combinedAxial, 0) ** 2 +
        3 * Math.max(shearStress, 0) ** 2,
    );

    const capacity = material?.yieldStrength ?? 1;
    const utilization = capacity ? vonMises / capacity : 0;
    const safetyFactor = utilization > 0 ? 1 / utilization : Infinity;

    return {
      componentId: component.id,
      axialStress: Number.isFinite(combinedAxial) ? combinedAxial : 0,
      shearStress: Number.isFinite(shearStress) ? shearStress : 0,
      vonMises: Number.isFinite(vonMises) ? vonMises : 0,
      utilization: Number.isFinite(utilization) ? utilization : 0,
      safetyFactor: Number.isFinite(safetyFactor) ? safetyFactor : Infinity,
    };
  });
}

export function utilizationToColor(utilization: number): string {
  if (!Number.isFinite(utilization)) return "#28a745";
  if (utilization < 0.5) return "#28a745";
  if (utilization < 0.8) return "#ffc107";
  if (utilization < 1) return "#fd7e14";
  return "#dc3545";
}
