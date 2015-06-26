/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    var Operators = (function () {
        function Operators() {
            this.operators = {
                'eq': ['=', '==', '==='],
                'ne': ['!=', '!==', '<>'],
                'gt': ['>'],
                'ge': ['>=', '>=='],
                'lt': ['<'],
                'le': ['<=', '<=='],
                'and': ['&&'],
                'or': ['||'],
                'not': ['!'],
                'add': ['+'],
                'sub': ['-'],
                'mul': ['*'],
                'div': ['/'],
                'mod': ['%'],
            };
            this.rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        }
        Operators.prototype.trim = function (value) {
            return value.replace(this.rtrim, '');
        };
        Operators.prototype.convert = function (from) {
            var input = this.trim(from).toLowerCase();
            var key;
            for (key in this.operators) {
                if (input === key)
                    return key;
                var possibleValues = this.operators[key];
                for (var i = 0; i < possibleValues.length; i++) {
                    if (input === possibleValues[i]) {
                        return key;
                    }
                }
            }
            throw "Operator " + from + " not found";
        };
        return Operators;
    })();
    OData.Operators = Operators;
})(OData || (OData = {}));
angular.module('ODataResources').service('$odataOperators', OData.Operators);
