export class DataTexture {
    constructor(renderer: any, width: any, height: any, channels: any, options: any);
    renderer: any;
    width: any;
    height: any;
    channels: any;
    n: number;
    gl: any;
    minFilter: any;
    magFilter: any;
    type: any;
    ctor: Uint8ArrayConstructor | Int8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | undefined;
    build(options: any): void;
    texture: any;
    format: any;
    format3: 1023 | 1028 | 1030 | 1022 | null | undefined;
    data: Float32Array | Uint8Array | Int8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | undefined;
    textureObject: CONST.Texture<HTMLImageElement> | null | undefined;
    textureProperties: any;
    uniforms: {
        dataResolution: {
            type: string;
            value: CONST.Vector2;
        };
        dataTexture: {
            type: string;
            value: CONST.Texture<HTMLImageElement>;
        };
    } | undefined;
    write(data: any, x: any, y: any, w: any, h: any): any;
    dispose(): null;
}
import * as CONST from "three";
