export class RenderTarget {
    constructor(gl: any, width: any, height: any, frames: any, options: any);
    gl: any;
    options: any;
    width: any;
    height: any;
    frames: any;
    buffers: any;
    build(): void;
    targets: any;
    reads: any;
    write: any;
    uniforms: {
        dataResolution: {
            type: string;
            value: Vector2;
        };
        dataTexture: {
            type: string;
            value: any;
        };
        dataTextures: {
            type: string;
            value: any;
        };
    } | undefined;
    cycle(): void;
    warmup(callback: any): void[];
    dispose(): null;
}
import { Vector2 } from "three";
