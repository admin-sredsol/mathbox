export class Reverse extends Operator {
    _resolveScale(key: any, _dims: any): 1 | -1;
    _resolveOffset(key: any, dims: any): number;
    make(): {
        reverseScale: any;
        reverseOffset: any;
    } | undefined;
    uniforms: {
        reverseScale: any;
        reverseOffset: any;
    } | undefined;
    resize(): any;
    change(_changed: any, touched: any, _init: any): any;
}
import { Operator } from "./operator.js";
