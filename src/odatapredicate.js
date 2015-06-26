/// <reference path="references.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OData;
(function (OData) {
    var Predicate = (function (_super) {
        __extends(Predicate, _super);
        function Predicate(propertyOrValueOrPredicate, valueOrOperator, value) {
            if (angular.isFunction(propertyOrValueOrPredicate.execute) && valueOrOperator === undefined) {
                return propertyOrValueOrPredicate;
            }
            else {
                _super.call(this, propertyOrValueOrPredicate, valueOrOperator, value);
            }
        }
        Predicate.or = function (orStatements) {
            if (orStatements.length > 0) {
                var finalOperation = orStatements[0];
                for (var i = 1; i < orStatements.length; i++) {
                    finalOperation = new OData.BinaryOperation(finalOperation, 'or', orStatements[i]);
                }
                return finalOperation;
            }
            throw "No statements specified for OR predicate";
        };
        Predicate.create = function (a1, a2, a3) {
            if (angular.isFunction(a1.execute) && a2 === undefined) {
                return a1;
            }
            else {
                return new OData.BinaryOperation(a1, a2, a3);
            }
        };
        Predicate.and = function (andStatements) {
            if (andStatements.length > 0) {
                var finalOperation = andStatements[0];
                for (var i = 1; i < andStatements.length; i++) {
                    finalOperation = new OData.BinaryOperation(finalOperation, 'and', andStatements[i]);
                }
                return finalOperation;
            }
            throw "No statements specified";
        };
        return Predicate;
    })(OData.BinaryOperation);
    OData.Predicate = Predicate;
})(OData || (OData = {}));
angular.module('ODataResources').factory('$odataPredicate', [function () { return OData.Predicate; }]);
