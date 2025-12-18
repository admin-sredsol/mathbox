export class Arrow extends Base {
    geometry: ArrowGeometry;
    material: import("three").RawShaderMaterial;
    renders: Mesh<ArrowGeometry, import("three").RawShaderMaterial, import("three").Object3DEventMap>[];
}
import { Base } from "./base.js";
import { ArrowGeometry } from "../geometry/arrowgeometry.js";
import { Mesh } from "three";
