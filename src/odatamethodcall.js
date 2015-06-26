/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    var MethodCall = (function () {
        function MethodCall(methodName) {
            if (methodName === undefined || methodName === "")
                throw "Method name should be defined";
            this.params = [];
            if (arguments.length < 2)
                throw "Method should be invoked with arguments";
            for (var i = 1; i < arguments.length; i++) {
                var value = arguments[i];
                if (angular.isFunction(value.execute)) {
                    this.params.push(value);
                }
                else {
                    if (i == 1) {
                        this.params.push(new OData.Property(value));
                    }
                    else {
                        this.params.push(new OData.Value(value));
                    }
                }
            }
            this.methodName = methodName;
        }
        MethodCall.prototype.execute = function () {
            var invocation = this.methodName + "(";
            for (var i = 0; i < this.params.length; i++) {
                if (i > 0) {
                    invocation += ",";
                }
                invocation += this.params[i].execute();
            }
            invocation += ")";
            return invocation;
        };
        return MethodCall;
    })();
    OData.MethodCall = MethodCall;
    angular.module('ODataResources').
        factory('$odataMethodCall', ['$odataProperty', '$odataValue',
        function () { return MethodCall; }
    ]);
})(OData || (OData = {}));
