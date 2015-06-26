/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    var BinaryOperation = (function () {
        function BinaryOperation(propertyOrPredicate, valueOrOperator, value) {
            if (propertyOrPredicate === undefined) {
                throw "The property of a filter cannot be undefined";
            }
            if (valueOrOperator === undefined) {
                throw "The value of a filter cannot be undefined";
            }
            if (value === undefined) {
                if (angular.isFunction(propertyOrPredicate.execute)) {
                    this.operandA = propertyOrPredicate;
                }
                else {
                    this.operandA = new OData.Property(propertyOrPredicate);
                }
                if (angular.isFunction(valueOrOperator.execute)) {
                    this.operandB = valueOrOperator;
                }
                else {
                    this.operandB = new OData.Value(valueOrOperator);
                }
                this.filterOperator = 'eq';
            }
            else {
                if (angular.isFunction(propertyOrPredicate.execute)) {
                    this.operandA = propertyOrPredicate;
                }
                else {
                    this.operandA = new OData.Property(propertyOrPredicate);
                }
                if (angular.isFunction(value.execute)) {
                    this.operandB = value;
                }
                else {
                    this.operandB = new OData.Value(value);
                }
                var operators = new OData.Operators();
                this.filterOperator = operators.convert(valueOrOperator);
            }
        }
        BinaryOperation.prototype.execute = function (noParenthesis) {
            var result = this.operandA.execute() + " " + this.filterOperator + " " + this.operandB.execute();
            if (!noParenthesis)
                result = "(" + result + ")";
            return result;
        };
        BinaryOperation.prototype.or = function (propertyOrPredicate, operatorOrValue, value) {
            var other;
            if (operatorOrValue !== undefined) {
                other = new BinaryOperation(propertyOrPredicate, operatorOrValue, value);
            }
            else if (angular.isFunction(propertyOrPredicate.execute)) {
                other = propertyOrPredicate;
            }
            else {
                throw "The object " + propertyOrPredicate + " passed as a parameter of the or method is not valid";
            }
            return new BinaryOperation(this, "or", other);
        };
        BinaryOperation.prototype.and = function (propertyOrPredicate, operatorOrValue, value) {
            var other;
            if (operatorOrValue !== undefined) {
                other = new BinaryOperation(propertyOrPredicate, operatorOrValue, value);
            }
            else if (angular.isFunction(propertyOrPredicate.execute)) {
                other = propertyOrPredicate;
            }
            else {
                throw "The object " + propertyOrPredicate + " passed as a parameter of the and method is not valid";
            }
            return new BinaryOperation(this, "and", other);
        };
        return BinaryOperation;
    })();
    OData.BinaryOperation = BinaryOperation;
    angular.module('ODataResources').
        factory('$odataBinaryOperation', ['$odataOperators', '$odataProperty', '$odataValue',
        function ($odataOperators, ODataProperty, ODataValue) {
            return BinaryOperation;
        }
    ]);
})(OData || (OData = {}));
