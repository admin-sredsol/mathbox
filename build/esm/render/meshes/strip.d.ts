export class Strip extends Base {
    geometry: StripGeometry;
    material: import("three").RawShaderMaterial;
    renders: Mesh<StripGeometry, import("three").RawShaderMaterial, import("three").Object3DEventMap>[];
}
import { Base } from "./base.js";
import { StripGeometry } from "../geometry/stripgeometry.js";
import { Mesh } from "three";
