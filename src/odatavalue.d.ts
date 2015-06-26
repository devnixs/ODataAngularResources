/// <reference path="../typescript/references.d.ts" />
declare module OData {
    class ValueTypes {
        static Boolean: string;
        static Byte: string;
        static DateTime: string;
        static Decimal: string;
        static Double: string;
        static Single: string;
        static Guid: string;
        static Int32: string;
        static String: string;
    }
    class Value {
        private value;
        private type;
        private illegalChars;
        private escapeIllegalChars(haystack);
        private generateDate(date);
        executeWithUndefinedType(): any;
        executeWithType(): any;
        execute(): string;
        constructor(value: any, type?: string);
    }
}
