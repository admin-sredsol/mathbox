export class Scene extends Renderable {
    constructor(renderer: any, shaders: any, options: any);
    root: MathBox;
    scene: any;
    pending: any[];
    async: number;
    scratch: WebGLRenderTarget<import("three").Texture<unknown>>;
    camera: PerspectiveCamera;
    inject(scene: any): any;
    unject(): any;
    add(object: any): number | MathBox;
    remove(object: any): MathBox | undefined;
    _add(object: any): MathBox;
    _remove(object: any): MathBox;
    dispose(): any;
    warmup(n: any): number;
    render(): boolean[] | undefined;
    toJSON(): import("three").Object3DJSON;
}
import { Renderable } from "./renderable.js";
declare class MathBox extends Object3D<import("three").Object3DEventMap> {
    constructor();
    rotationAutoUpdate: boolean;
}
import { WebGLRenderTarget } from "three";
import { PerspectiveCamera } from "three";
import { Object3D } from "three";
export {};
