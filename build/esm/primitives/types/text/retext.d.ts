export class Retext extends Resample {
    init(): {
        to: string;
        trait: string;
    }[];
    textShader(shader: any): any;
    textIsSDF(): boolean;
    textHeight(): any;
}
import { Resample } from "../operator/resample.js";
