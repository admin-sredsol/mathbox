export class OverlayFactory {
    constructor(classes: any, canvas: any);
    classes: any;
    canvas: any;
    div: HTMLDivElement;
    inject(): any;
    unject(): void;
    getTypes(): string[];
    make(type: any, options: any): any;
}
