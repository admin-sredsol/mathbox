export class ClipGeometry extends Geometry {
    _clipUniforms(): {
        type: string;
        value: Vector4;
    };
    geometryClip: Vector4 | undefined;
    geometryResolution: Vector4 | undefined;
    mapSize: Vector4 | undefined;
    _clipGeometry(width: any, height: any, depth: any, items: any): Vector4;
    _clipMap(mapWidth: any, mapHeight: any, mapDepth: any, mapItems: any): Vector4;
    _clipOffsets(factor: any, width: any, height: any, depth: any, items: any, _width: any, _height: any, _depth: any, _items: any): void;
}
import { Geometry } from "./geometry.js";
import { Vector4 } from "three";
