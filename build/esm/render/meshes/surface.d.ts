export class Surface extends Base {
    geometry: SurfaceGeometry;
    material: import("three").RawShaderMaterial;
    renders: Mesh<SurfaceGeometry, import("three").RawShaderMaterial, import("three").Object3DEventMap>[];
}
import { Base } from "./base.js";
import { SurfaceGeometry } from "../geometry/surfacegeometry.js";
import { Mesh } from "three";
