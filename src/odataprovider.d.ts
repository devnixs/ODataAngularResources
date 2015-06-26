/// <reference path="../typescript/references.d.ts" />
declare module OData {
    interface ProviderCallback<T> {
        (queryString: string, success: () => any, error: () => any): T[];
        (queryString: string, success: () => any, error: () => any, isSingleElement?: boolean, forceSingleElement?: boolean): T;
    }
    class Provider<T> {
        private callback;
        private filters;
        private sortOrders;
        private takeAmount;
        private skipAmount;
        private expandables;
        constructor(callback: ProviderCallback<T>);
        filter(operand1: any, operand2?: any, operand3?: any): Provider<T>;
        orderBy(arg1: any, arg2?: any): Provider<T>;
        take(amount: number): Provider<T>;
        skip(amount: number): Provider<T>;
        private execute();
        query(success?: any, error?: any): T[];
        single(success?: any, error?: any): T;
        get(data: any, success?: any, error?: any): T;
        expand(params: any, otherParam1?: any, otherParam2?: any, otherParam3?: any, otherParam4?: any, otherParam5?: any, otherParam6?: any, otherParam7?: any): Provider<T>;
    }
}
