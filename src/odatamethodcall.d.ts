/// <reference path="../typescript/references.d.ts" />
declare module OData {
    class MethodCall implements IExecutable {
        private methodName;
        private params;
        execute(): string;
        constructor(methodName: string);
    }
}
