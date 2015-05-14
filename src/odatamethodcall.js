angular.module('ODataResources').
factory('$odataMethodCall', ['$odataProperty', '$odataValue',
    function(ODataProperty, ODataValue) {

        var ODataMethodCall = function(methodName) {
            if (methodName === undefined || methodName === "")
                throw "Method name should be defined";

            this.params = [];

            if (arguments.length < 2)
                throw "Method should be invoked with arguments";

            for (var i = 1; i < arguments.length; i++) {
                var value = arguments[i];
                if (angular.isFunction(value.execute)) {
                    this.params.push(value);
                } else {
                    //We assume the first one is the object property;
                    if (i == 1) {
                        this.params.push(new ODataProperty(value));
                    } else {
                        this.params.push(new ODataValue(value));
                    }
                }
            }

            this.methodName = methodName;
        };

        ODataMethodCall.prototype.execute = function() {
            var invocation = this.methodName + "(";
            for (var i = 0; i < this.params.length; i++) {
                if (i > 0)
                    invocation += ",";

                invocation += this.params[i].execute();
            }
            invocation += ")";
            return invocation;
        };

        return ODataMethodCall;
    }
]);