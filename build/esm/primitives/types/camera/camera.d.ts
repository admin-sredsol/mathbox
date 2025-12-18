export class Camera extends Primitive {
    make(): Quaternion;
    camera: any;
    euler: Euler | undefined;
    quat: Quaternion | undefined;
    unmake(): void;
    getCamera(): any;
    change(changed: any, touched: any, init: any): any;
}
import { Primitive } from "../../primitive.js";
import { Quaternion } from "three";
import { Euler } from "three";
