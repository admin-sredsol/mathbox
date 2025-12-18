export class Latch extends Parent {
    data: any;
    isDirty: boolean | void | undefined;
    unmake(): void;
    swap(): void;
    update(): void;
}
import { Parent } from "../base/parent.js";
