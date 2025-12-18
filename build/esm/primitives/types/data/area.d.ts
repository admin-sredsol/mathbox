export class Area extends Matrix {
    updateSpan(): any;
    aX: any;
    aY: any;
    bX: number | undefined;
    bY: number | undefined;
    callback(callback: any): ((emit: any, i: any, j: any) => any) | undefined;
    last: any;
    _callback: ((emit: any, i: any, j: any) => any) | ((emit: any, i: any, j: any) => any) | undefined;
    unmake(): any;
    change(changed: any, touched: any, init: any): void;
}
import { Matrix } from "./matrix.js";
