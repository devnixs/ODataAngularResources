/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    var Property = (function () {
        function Property(value) {
            this.value = value;
        }
        Property.prototype.execute = function () {
            return this.value;
        };
        return Property;
    })();
    OData.Property = Property;
    angular.module('ODataResources').
        factory('$odataProperty', [function () { return Property; }]);
})(OData || (OData = {}));
