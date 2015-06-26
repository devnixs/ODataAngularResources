/// <reference path="../typescript/references.d.ts" />
declare module OData {
    class Property implements IExecutable {
        private value;
        constructor(value: string);
        execute(): string;
    }
}
