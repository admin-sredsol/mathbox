export class Line extends Base {
    geometry: LineGeometry;
    material: import("three").RawShaderMaterial;
    renders: Mesh<LineGeometry, import("three").RawShaderMaterial, import("three").Object3DEventMap>[];
}
import { Base } from "./base.js";
import { LineGeometry } from "../geometry/linegeometry.js";
import { Mesh } from "three";
