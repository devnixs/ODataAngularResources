/// <reference path="../typescript/references.d.ts" />
declare module OData {
    interface IExecutable {
        execute(noParenthesis?: any): string;
    }
    class Global {
        static $inject: string[];
        constructor(ODataBinaryOperation: any, ODataProvider: any, ODataValue: any, ODataProperty: any, ODataMethodCall: any, ODataPredicate: any, ODataOrderByStatement: any);
        Provider: Provider<any>;
        BinaryOperation: typeof BinaryOperation;
        Value: typeof Value;
        Property: typeof Property;
        Func: typeof MethodCall;
        Predicate: typeof Predicate;
        OrderBy: typeof OrderByStatement;
    }
}
