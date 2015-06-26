/// <reference path="../typescript/references.d.ts" />
declare module OData {
    class Operators {
        operators: {
            'eq': string[];
            'ne': string[];
            'gt': string[];
            'ge': string[];
            'lt': string[];
            'le': string[];
            'and': string[];
            'or': string[];
            'not': string[];
            'add': string[];
            'sub': string[];
            'mul': string[];
            'div': string[];
            'mod': string[];
        };
        private rtrim;
        private trim(value);
        convert(from: string): any;
    }
}
