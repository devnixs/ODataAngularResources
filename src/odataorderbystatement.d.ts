/// <reference path="../typescript/references.d.ts" />
declare module OData {
    class OrderByStatement implements IExecutable {
        private propertyName;
        private direction;
        execute(): string;
        constructor(propertyName: string, sortOrder?: string);
    }
}
