/// <reference path="../typescript/references.d.ts" />
declare module OData {
    class Predicate extends BinaryOperation {
        constructor(propertyOrValueOrPredicate: any, valueOrOperator?: any, value?: any);
        static or(orStatements: any[]): IExecutable;
        static create(a1: any, a2: any, a3: any): IExecutable;
        static and(andStatements: any): IExecutable;
    }
}
