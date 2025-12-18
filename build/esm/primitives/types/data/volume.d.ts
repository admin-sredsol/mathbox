export class Volume extends Voxel {
    updateSpan(): any;
    aX: any;
    aY: any;
    aZ: any;
    bX: number | undefined;
    bY: number | undefined;
    bZ: number | undefined;
    callback(callback: any): ((emit: any, i: any, j: any, k: any) => any) | undefined;
    last: any;
    _callback: ((emit: any, i: any, j: any, k: any) => any) | ((emit: any, i: any, j: any, k: any) => any) | undefined;
    unmake(): any;
    change(changed: any, touched: any, init: any): void;
}
import { Voxel } from "./voxel.js";
