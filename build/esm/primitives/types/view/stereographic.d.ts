export class Stereographic extends View {
    make(): (position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => import("three").Matrix4;
    uniforms: {
        stereoBend: any;
        viewMatrix: any;
    } | undefined;
    viewMatrix: any;
    composer: ((position: any, rotation: any, quaternion: any, scale: any, matrix: any, eulerOrder: any) => import("three").Matrix4) | undefined;
    unmake(): boolean;
    change(changed: any, touched: any, init: any): any;
    bend: any;
}
import { View } from "./view.js";
