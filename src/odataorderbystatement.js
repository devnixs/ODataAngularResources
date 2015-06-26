/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    var OrderByStatement = (function () {
        function OrderByStatement(propertyName, sortOrder) {
            this.propertyName = propertyName;
            if (propertyName === undefined) {
                throw "Orderby should be passed a property name but got undefined";
            }
            this.propertyName = propertyName;
            this.direction = sortOrder || "asc";
        }
        OrderByStatement.prototype.execute = function () {
            return this.propertyName + " " + this.direction;
        };
        return OrderByStatement;
    })();
    OData.OrderByStatement = OrderByStatement;
})(OData || (OData = {}));
angular.module('ODataResources').factory('$odataOrderByStatement', [function () { return OData.OrderByStatement; }]);
