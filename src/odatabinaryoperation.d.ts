/// <reference path="../typescript/references.d.ts" />
declare module OData {
    class BinaryOperation implements IExecutable {
        private operandA;
        private operandB;
        private filterOperator;
        constructor(a1: any, a2: any, a3: any);
        execute(noParenthesis?: any): string;
        or(a1: any, a2: any, a3: any): BinaryOperation;
        and(a1: any, a2: any, a3: any): BinaryOperation;
    }
}
