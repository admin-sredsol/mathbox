export class Face extends Base {
    geometry: FaceGeometry;
    material: import("three").RawShaderMaterial;
    renders: Mesh<FaceGeometry, import("three").RawShaderMaterial, import("three").Object3DEventMap>[];
}
import { Base } from "./base.js";
import { FaceGeometry } from "../geometry/facegeometry.js";
import { Mesh } from "three";
