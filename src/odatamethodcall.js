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
            var lambdaOperators = ["any", "all"];
            var invocation = "";

            if(lambdaOperators.indexOf(this.methodName) > -1) {
                for (var i = 0; i < this.params.length; i++) {
                    if (i === 0) {
                        var navigationPath = this.params[i].execute();
                        var varName = navigationPath.charAt(0).toLowerCase();
                        invocation += navigationPath + "/" + this.methodName + "(" + varName + ":" + varName + "/";
                    } else {
                        var expression = this.params[i].execute();
                        invocation += expression.substring(1, expression.length-1);
                        invocation += ")";
                    }
                }
            } else {
                invocation += this.methodName + "(";

                for (var j = 0; j < this.params.length; j++) {
                    if (j > 0)
                        invocation += ",";

                    invocation += this.params[j].execute();
                }
                invocation += ")";
            }

            return invocation;
        };

        return ODataMethodCall;
    }
]);