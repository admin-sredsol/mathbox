export class Transform3 extends Transform {
    make(): (position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => import("three").Matrix4;
    uniforms: {
        transformMatrix: any;
    } | undefined;
    composer: ((position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => import("three").Matrix4) | undefined;
    unmake(): boolean;
    change(changed: any, touched: any, init: any): void | import("three").Matrix4;
}
import { Transform } from "./transform.js";
