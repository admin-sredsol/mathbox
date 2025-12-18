export class Sprite extends Base {
    geometry: SpriteGeometry;
    fillMaterial: import("three").RawShaderMaterial;
    edgeMaterial: import("three").RawShaderMaterial;
    fillObject: Mesh<SpriteGeometry, import("three").RawShaderMaterial, import("three").Object3DEventMap>;
    edgeObject: Mesh<SpriteGeometry, import("three").RawShaderMaterial, import("three").Object3DEventMap>;
    renders: Mesh<SpriteGeometry, import("three").RawShaderMaterial, import("three").Object3DEventMap>[];
    show(transparent: any, blending: any, order: any, depth: any): null;
}
import { Base } from "./base.js";
import { SpriteGeometry } from "../geometry/spritegeometry.js";
import { Mesh } from "three";
