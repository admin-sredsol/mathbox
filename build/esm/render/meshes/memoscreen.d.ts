export class MemoScreen extends Screen {
    memo: any;
    uniforms: {
        remapUVScale: {
            type: string;
            value: Vector2;
        };
        remapModulus: {
            type: string;
            value: Vector2;
        };
        remapModulusInv: {
            type: string;
            value: Vector2;
        };
        remapSTPQScale: {
            type: string;
            value: Vector4;
        };
    };
    cover(width: any, height: any, depth: any, items: any): void;
}
import { Screen } from "./screen.js";
import { Vector2 } from "three";
import { Vector4 } from "three";
