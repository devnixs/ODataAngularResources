/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    var Global = (function () {
        function Global(ODataBinaryOperation, ODataProvider, ODataValue, ODataProperty, ODataMethodCall, ODataPredicate, ODataOrderByStatement) {
            this.Provider = ODataProvider;
            this.BinaryOperation = ODataBinaryOperation;
            this.Value = ODataValue;
            this.Property = ODataProperty;
            this.Func = ODataMethodCall;
            this.Predicate = ODataPredicate;
            this.OrderBy = ODataOrderByStatement;
        }
        Global.$inject = ['$odataBinaryOperation', '$odataProvider', '$odataValue',
            '$odataProperty', '$odataMethodCall', '$odataPredicate', '$odataOrderByStatement'];
        return Global;
    })();
    OData.Global = Global;
    angular.module('ODataResources').service("$odata", Global);
})(OData || (OData = {}));
