export class Screen extends Base {
    geometry: ScreenGeometry;
    material: import("three").RawShaderMaterial;
    renders: Mesh<ScreenGeometry, import("three").RawShaderMaterial, import("three").Object3DEventMap>[];
}
import { Base } from "./base.js";
import { ScreenGeometry } from "../geometry/screengeometry.js";
import { Mesh } from "three";
