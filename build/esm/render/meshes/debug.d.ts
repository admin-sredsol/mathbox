export class Debug extends Base {
    geometry: PlaneGeometry;
    material: MeshBasicMaterial;
    objects: Mesh<PlaneGeometry, MeshBasicMaterial, import("three").Object3DEventMap>[];
}
import { Base } from "./base.js";
import { PlaneGeometry } from "three";
import { MeshBasicMaterial } from "three";
import { Mesh } from "three";
