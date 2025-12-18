export class BackedTexture extends DataTexture {
    data: Float32Array | Uint8Array | Int8Array | Int16Array | Uint16Array | Int32Array | Uint32Array;
    resize(width: any, height: any): any;
}
import { DataTexture } from "./datatexture.js";
