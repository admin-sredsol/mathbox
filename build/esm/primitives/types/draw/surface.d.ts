export class Surface extends Primitive {
    lineX: any;
    lineY: any;
    surface: any;
    resize(): any;
    make(): any;
    wireColor: any;
    wireZBias: any;
    wireScratch: Color | undefined;
    proximity: any;
    made(): any;
    unmake(): null;
    _convertGammaToLinear(color: any, gammaFactor?: number): any;
    _convertLinearToGamma(color: any, gammaFactor?: number): any;
}
import { Primitive } from "../../primitive.js";
import { Color } from "three";
