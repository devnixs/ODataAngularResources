/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    angular.module('ODataResources', ['ng']);
})(OData || (OData = {}));
;/// <reference path="references.d.ts" />
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
;/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    var ValueTypes = (function () {
        function ValueTypes() {
        }
        ValueTypes.Boolean = "Boolean";
        ValueTypes.Byte = "Byte";
        ValueTypes.DateTime = "DateTime";
        ValueTypes.Decimal = "Decimal";
        ValueTypes.Double = "Double";
        ValueTypes.Single = "Single";
        ValueTypes.Guid = "Guid";
        ValueTypes.Int32 = "Int32";
        ValueTypes.String = "String";
        return ValueTypes;
    })();
    OData.ValueTypes = ValueTypes;
    var Value = (function () {
        function Value(value, type) {
            this.value = value;
            this.type = type;
            this.illegalChars = {
                '%': '%25',
                '+': '%2B',
                '/': '%2F',
                '?': '%3F',
                '#': '%23',
                '&': '%26'
            };
        }
        Value.prototype.escapeIllegalChars = function (haystack) {
            for (var key in this.illegalChars) {
                haystack = haystack.replace(key, this.illegalChars[key]);
            }
            haystack = haystack.replace("'", "''");
            return haystack;
        };
        Value.prototype.generateDate = function (date) {
            return "datetime'" + date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2) + "'";
        };
        Value.prototype.executeWithUndefinedType = function () {
            if (angular.isString(this.value)) {
                return "'" + this.escapeIllegalChars(this.value) + "'";
            }
            else if (this.value === false) {
                return "false";
            }
            else if (this.value === true) {
                return "true";
            }
            else if (angular.isDate(this.value)) {
                return this.generateDate(this.value);
            }
            else if (!isNaN(this.value)) {
                return this.value;
            }
            else {
                throw "Unrecognized type of " + this.value;
            }
        };
        Value.prototype.executeWithType = function () {
            if (this.value === true || this.value === false) {
                if (this.type.toLowerCase() === "boolean") {
                    return !!this.value + "";
                }
                else if (this.type.toLowerCase() === "string") {
                    return "'" + !!this.value + "'";
                }
                else {
                    throw "Cannot convert bool (" + this.value + ") into " + this.type;
                }
            }
            if (angular.isDate(this.value)) {
                if (this.type.toLowerCase() === "decimal") {
                    return this.value.getTime() + "M";
                }
                else if (this.type.toLowerCase() === "int32") {
                    return this.value.getTime() + "";
                }
                else if (this.type.toLowerCase() === "single") {
                    return this.value.getTime() + "f";
                }
                else if (this.type.toLowerCase() === "double") {
                    return this.value.getTime() + "d";
                }
                else if (this.type.toLowerCase() === "datetime") {
                    return this.generateDate(this.value);
                }
                else if (this.type.toLowerCase() === "string") {
                    return "'" + this.value.toISOString() + "'";
                }
                else {
                    throw "Cannot convert date (" + this.value + ") into " + this.type;
                }
            }
            if (angular.isString(this.value)) {
                if (this.type.toLowerCase() === "guid") {
                    return "guid'" + this.value + "'";
                }
                else if (this.type.toLowerCase() === "datetime") {
                    return this.generateDate(new Date(this.value));
                }
                else if (this.type.toLowerCase() === "single") {
                    return parseFloat(this.value) + "f";
                }
                else if (this.type.toLowerCase() === "double") {
                    return parseFloat(this.value) + "d";
                }
                else if (this.type.toLowerCase() === "decimal") {
                    return parseFloat(this.value) + "M";
                }
                else if (this.type.toLowerCase() === "boolean") {
                    return this.value;
                }
                else if (this.type.toLowerCase() === "int32") {
                    return parseInt(this.value) + "";
                }
                else {
                    throw "Cannot convert " + this.value + " into " + this.type;
                }
            }
            else if (!isNaN(this.value)) {
                if (this.type.toLowerCase() === "boolean") {
                    return !!this.value + "";
                }
                else if (this.type.toLowerCase() === "decimal") {
                    return this.value + "M";
                }
                else if (this.type.toLowerCase() === "double") {
                    return this.value + "d";
                }
                else if (this.type.toLowerCase() === "single") {
                    return this.value + "f";
                }
                else if (this.type.toLowerCase() === "byte") {
                    return (this.value % 255).toString(16);
                }
                else if (this.type.toLowerCase() === "datetime") {
                    return this.generateDate(new Date(this.value));
                }
                else if (this.type.toLowerCase() === "string") {
                    return "'" + this.value + "'";
                }
                else {
                    throw "Cannot convert number (" + this.value + ") into " + this.type;
                }
            }
            else {
                throw "Source type of " + this.value + " to be conververted into " + this.type + "is not supported";
            }
        };
        Value.prototype.execute = function () {
            if (this.type === undefined) {
                return this.executeWithUndefinedType();
            }
            else {
                return this.executeWithType();
            }
        };
        return Value;
    })();
    OData.Value = Value;
})(OData || (OData = {}));
angular.module('ODataResources').factory('$odataValue', [function () { return OData.Value; }]);
;/// <reference path="references.d.ts" />
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
;/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    var BinaryOperation = (function () {
        function BinaryOperation(a1, a2, a3) {
            if (a1 === undefined) {
                throw "The property of a filter cannot be undefined";
            }
            if (a2 === undefined) {
                throw "The value of a filter cannot be undefined";
            }
            if (a3 === undefined) {
                if (angular.isFunction(a1.execute)) {
                    this.operandA = a1;
                }
                else {
                    this.operandA = new OData.Property(a1);
                }
                if (angular.isFunction(a2.execute)) {
                    this.operandB = a2;
                }
                else {
                    this.operandB = new OData.Value(a2);
                }
                this.filterOperator = 'eq';
            }
            else {
                if (angular.isFunction(a1.execute)) {
                    this.operandA = a1;
                }
                else {
                    this.operandA = new OData.Property(a1);
                }
                if (angular.isFunction(a3.execute)) {
                    this.operandB = a3;
                }
                else {
                    this.operandB = new OData.Value(a3);
                }
                var operators = new OData.Operators();
                this.filterOperator = operators.convert(a2);
            }
        }
        BinaryOperation.prototype.execute = function (noParenthesis) {
            var result = this.operandA.execute() + " " + this.filterOperator + " " + this.operandB.execute();
            if (!noParenthesis)
                result = "(" + result + ")";
            return result;
        };
        BinaryOperation.prototype.or = function (a1, a2, a3) {
            var other;
            if (a2 !== undefined) {
                other = new BinaryOperation(a1, a2, a3);
            }
            else if (angular.isFunction(a1.execute)) {
                other = a1;
            }
            else {
                throw "The object " + a1 + " passed as a parameter of the or method is not valid";
            }
            return new BinaryOperation(this, "or", other);
        };
        BinaryOperation.prototype.and = function (a1, a2, a3) {
            var other;
            if (a2 !== undefined) {
                other = new BinaryOperation(a1, a2, a3);
            }
            else if (angular.isFunction(a1.execute)) {
                other = a1;
            }
            else {
                throw "The object " + a1 + " passed as a parameter of the and method is not valid";
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
;/// <reference path="references.d.ts" />
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
;/// <reference path="references.d.ts" />
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
;/// <reference path="references.d.ts" />
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
;/// <reference path="references.d.ts" />
var OData;
(function (OData) {
    var Provider = (function () {
        function Provider(callback) {
            this.callback = callback;
            this.filters = [];
            this.sortOrders = [];
            this.takeAmount = undefined;
            this.skipAmount = undefined;
            this.expandables = [];
        }
        Provider.prototype.filter = function (operand1, operand2, operand3) {
            if (operand1 === undefined)
                throw "The first parameted is undefined. Did you forget to invoke the method as a constructor by adding the 'new' keyword?";
            var predicate;
            if (angular.isFunction(operand1.execute) && operand2 === undefined) {
                predicate = operand1;
            }
            else {
                predicate = new OData.BinaryOperation(operand1, operand2, operand3);
            }
            this.filters.push(predicate);
            return this;
        };
        Provider.prototype.orderBy = function (arg1, arg2) {
            this.sortOrders.push(new OData.OrderByStatement(arg1, arg2));
            return this;
        };
        Provider.prototype.take = function (amount) {
            this.takeAmount = amount;
            return this;
        };
        Provider.prototype.skip = function (amount) {
            this.skipAmount = amount;
            return this;
        };
        Provider.prototype.execute = function () {
            var queryString = '';
            var i;
            if (this.filters.length > 0) {
                queryString = "$filter=" + OData.Predicate.and(this.filters).execute(true);
            }
            if (this.sortOrders.length > 0) {
                if (queryString !== "")
                    queryString += "&";
                queryString += "$orderby=";
                for (i = 0; i < this.sortOrders.length; i++) {
                    if (i > 0) {
                        queryString += ",";
                    }
                    queryString += this.sortOrders[i].execute();
                }
            }
            if (this.takeAmount) {
                if (queryString !== "")
                    queryString += "&";
                queryString += "$top=" + this.takeAmount;
            }
            if (this.skipAmount) {
                if (queryString !== "")
                    queryString += "&";
                queryString += "$skip=" + this.skipAmount;
            }
            if (this.expandables.length > 0) {
                if (queryString !== "")
                    queryString += "&";
                queryString += "$expand=";
                for (i = 0; i < this.expandables.length; i++) {
                    if (i > 0) {
                        queryString += ",";
                    }
                    queryString += this.expandables[i];
                }
            }
            return queryString;
        };
        Provider.prototype.query = function (success, error) {
            if (!angular.isFunction(this.callback))
                throw "Cannot execute query, no callback was specified";
            success = success || angular.noop;
            error = error || angular.noop;
            return this.callback(this.execute(), success, error);
        };
        Provider.prototype.single = function (success, error) {
            if (!angular.isFunction(this.callback))
                throw "Cannot execute get, no callback was specified";
            success = success || angular.noop;
            error = error || angular.noop;
            return this.callback(this.execute(), success, error, true, true);
        };
        Provider.prototype.get = function (data, success, error) {
            if (!angular.isFunction(this.callback))
                throw "Cannot execute get, no callback was specified";
            success = success || angular.noop;
            error = error || angular.noop;
            return this.callback("(" + data + ")", success, error, true);
        };
        Provider.prototype.expand = function (params, otherParam1, otherParam2, otherParam3, otherParam4, otherParam5, otherParam6, otherParam7) {
            if (!angular.isString(params) && !angular.isArray(params)) {
                throw "Invalid parameter passed to expand method (" + params + ")";
            }
            if (params === "") {
                return;
            }
            var expandQuery = params;
            if (angular.isArray(params)) {
                expandQuery = params.join('/');
            }
            else {
                expandQuery = Array.prototype.slice.call(arguments).join('/');
            }
            for (var i = 0; i < this.expandables.length; i++) {
                if (this.expandables[i] === expandQuery)
                    return this;
            }
            this.expandables.push(expandQuery);
            return this;
        };
        return Provider;
    })();
    OData.Provider = Provider;
})(OData || (OData = {}));
angular.module('ODataResources').
    factory('$odataProvider', [function () { return OData.Provider; }]);
;/**
 * @license AngularJS v1.3.15
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {
  'use strict';

  var $resourceMinErr = angular.$$minErr('$resource');

  // Helper functions and regex to lookup a dotted path on an object
  // stopping at undefined/null.  The path must be composed of ASCII
  // identifiers (just like $parse)
  var MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;

  function isValidDottedPath(path) {
    return (path !== null && path !== '' && path !== 'hasOwnProperty' &&
      MEMBER_NAME_REGEX.test('.' + path));
  }

  function lookupDottedPath(obj, path) {
    if (!isValidDottedPath(path)) {
      throw $resourceMinErr('badmember', 'Dotted member path "@{0}" is invalid.', path);
    }
    var keys = path.split('.');
    for (var i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
      var key = keys[i];
      obj = (obj !== null) ? obj[key] : undefined;
    }
    return obj;
  }

  /**
   * Create a shallow copy of an object and clear other fields from the destination
   */
  function shallowClearAndCopy(src, dst) {
    dst = dst || {};

    angular.forEach(dst, function(value, key) {
      delete dst[key];
    });

    for (var key in src) {
      if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
        dst[key] = src[key];
      }
    }

    return dst;
  }


  angular.module('ODataResources').
  provider('$odataresource', function() {
    var provider = this;

    this.defaults = {
      // Strip slashes by default
      stripTrailingSlashes: true,

      // Default actions configuration
      actions: {
        'get': {
          method: 'GET'
        },
        'save': {
          method: 'POST'
        },
        'query': {
          method: 'GET',
          isArray: true
        },
        'remove': {
          method: 'DELETE'
        },
        'delete': {
          method: 'DELETE'
        },
        'update': {
          method: 'PUT'
        },
        'odata': {
          method: 'GET',
          isArray: true
        }
      }
    };

    this.$get = ['$http', '$q', '$odata',
      function($http, $q, $odata) {

        var noop = angular.noop,
          forEach = angular.forEach,
          extend = angular.extend,
          copy = angular.copy,
          isFunction = angular.isFunction;

        /**
         * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
         * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set
         * (pchar) allowed in path segments:
         *    segment       = *pchar
         *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
         *    pct-encoded   = "%" HEXDIG HEXDIG
         *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
         *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
         *                     / "*" / "+" / "," / ";" / "="
         */
        function encodeUriSegment(val) {
          return encodeUriQuery(val, true).
          replace(/%26/gi, '&').
          replace(/%3D/gi, '=').
          replace(/%2B/gi, '+');
        }


        /**
         * This method is intended for encoding *key* or *value* parts of query component. We need a
         * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
         * have to be encoded per http://tools.ietf.org/html/rfc3986:
         *    query       = *( pchar / "/" / "?" )
         *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
         *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
         *    pct-encoded   = "%" HEXDIG HEXDIG
         *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
         *                     / "*" / "+" / "," / ";" / "="
         */
        function encodeUriQuery(val, pctEncodeSpaces) {
          return encodeURIComponent(val).
          replace(/%40/gi, '@').
          replace(/%3A/gi, ':').
          replace(/%24/g, '$').
          replace(/%2C/gi, ',').
          replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
        }

        function Route(template, defaults) {
          this.template = template;
          this.defaults = extend({}, provider.defaults, defaults);
          this.urlParams = {};
        }

        Route.prototype = {
          setUrlParams: function(config, params, actionUrl, data, isOData) {
            var self = this,
              url = actionUrl || self.template,
              val,
              encodedVal;



            if (url === self.template &&
              (config.method === 'PUT' || (config.method == 'GET' && !isOData) || config.method == 'PATCH') && angular.isString(self.defaults.odatakey)) {
              
            // strip trailing slashes and set the url (unless this behavior is specifically disabled)
            if (self.defaults.stripTrailingSlashes) {
              url = url.replace(/\/+$/, '') || '/';
            }

              url = url + '(:' + self.defaults.odatakey + ')';

              if (data) {
                params[self.defaults.odatakey] = data[self.defaults.odatakey];
              }
            }

            var urlParams = self.urlParams = {};
            forEach(url.split(/\W/), function(param) {
              if (param === 'hasOwnProperty') {
                throw $resourceMinErr('badname', "hasOwnProperty is not a valid parameter name.");
              }
              if (!(new RegExp("^\\d+$").test(param)) && param &&
                (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
                urlParams[param] = true;
              }
            });
            url = url.replace(/\\:/g, ':');

            params = params || {};
            forEach(self.urlParams, function(_, urlParam) {
              val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
              if (angular.isDefined(val) && val !== null) {
                encodedVal = encodeUriSegment(val);
                url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), function(match, p1) {
                  return encodedVal + p1;
                });
              } else {
                url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function(match,
                  leadingSlashes, tail) {
                  if (tail.charAt(0) == '/') {
                    return tail;
                  } else {
                    return leadingSlashes + tail;
                  }
                });
              }
            });

            // strip trailing slashes and set the url (unless this behavior is specifically disabled)
            if (self.defaults.stripTrailingSlashes) {
              url = url.replace(/\/+$/, '') || '/';
            }
            

            // then replace collapse `/.` if found in the last URL path segment before the query
            // E.g. `http://url.com/id./format?q=x` becomes `http://url.com/id.format?q=x`
            url = url.replace(/\/\.(?=\w+($|\?))/, '.');
            // replace escaped `/\.` with `/.`
            config.url = url.replace(/\/\\\./, '/.');


            // set params - delegate param encoding to $http
            forEach(params, function(value, key) {
              if (!self.urlParams[key]) {
                config.params = config.params || {};
                config.params[key] = value;
              }
            });
          }
        };


        function resourceFactory(url, paramDefaults, actions, options) {
          options = options || {};

          if (angular.isString(paramDefaults)) {
            options.odatakey = paramDefaults;
            paramDefaults = {};
          }

          var route = new Route(url, options);

          actions = extend({}, provider.defaults.actions, actions);

          function extractParams(data, actionParams) {
            var ids = {};
            actionParams = extend({}, paramDefaults, actionParams);
            forEach(actionParams, function(value, key) {
              if (isFunction(value)) {
                value = value();
              }
              ids[key] = value && value.charAt && value.charAt(0) == '@' ?
                lookupDottedPath(data, value.substr(1)) : value;
            });
            return ids;
          }

          function defaultResponseInterceptor(response) {
            return response.resource;
          }

          function Resource(value) {
            shallowClearAndCopy(value || {}, this);
          }

          Resource.prototype.toJSON = function() {
            var data = extend({}, this);
            delete data.$promise;
            delete data.$resolved;
            return data;
          };

          forEach(actions, function(action, name) {

            var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);

            Resource[name] = function(a1, a2, a3, a4, isOdata, odataQueryString, isSingleElement,forceSingleElement) {
              var params = {}, data, success, error;

              /* jshint -W086 */
              /* (purposefully fall through case statements) */
              switch (arguments.length) {
                case 8:
                case 7:
                case 6:
                case 4:
                  error = a4;
                  success = a3;
                  //fallthrough
                case 3:
                case 2:
                  if (isFunction(a2)) {
                    if (isFunction(a1)) {
                      success = a1;
                      error = a2;
                      break;
                    }

                    success = a2;
                    error = a3;
                    //fallthrough
                  } else {
                    params = a1;
                    data = a2;
                    success = a3;
                    break;
                  }
                case 1:
                  if (isFunction(a1)) success = a1;
                  else if (hasBody) data = a1;
                  else params = a1;
                  break;
                case 0:
                  break;
                default:
                  throw $resourceMinErr('badargs',
                    "Expected up to 4 arguments [params, data, success, error], got {0} arguments",
                    arguments.length);
              }
              /* jshint +W086 */
              /* (purposefully fall through case statements) */

              var isInstanceCall = this instanceof Resource;
              var value = isInstanceCall ? data : ((!isSingleElement && action.isArray) ? [] : new Resource(data));
              var httpConfig = {};
              var responseInterceptor = action.interceptor && action.interceptor.response ||
                defaultResponseInterceptor;
              var responseErrorInterceptor = action.interceptor && action.interceptor.responseError ||
                undefined;

              forEach(action, function(value, key) {
                if (key != 'params' && key != 'isArray' && key != 'interceptor') {
                  httpConfig[key] = copy(value);
                }
              });

              if (hasBody) httpConfig.data = data;


              route.setUrlParams(httpConfig,
                extend({}, extractParams(data, action.params || {}), params),
                action.url,
                data,
                isOdata);

              if (isOdata && odataQueryString !== "" && (!isSingleElement || forceSingleElement)) {
                httpConfig.url += "?" + odataQueryString;
              } else if (isOdata && odataQueryString !== "" && isSingleElement) {
                httpConfig.url += odataQueryString;
              }

              var promise = $http(httpConfig).then(function(response) {
                var data = response.data,
                  promise = value.$promise;

                if (data && angular.isString(data['@odata.context']) && data.value) {
                  var fullObject = data;
                  data = data.value;
                  for (var property in fullObject) {
                    if (property !== "value") {
                      value[property] = fullObject[property];

                    }
                  }
                }

                if (data) {
                  // Need to convert action.isArray to boolean in case it is undefined
                  // jshint -W018
                  if (angular.isArray(data) !== (!isSingleElement && !! action.isArray) && !forceSingleElement) {
                    throw $resourceMinErr('badcfg',
                      'Error in resource configuration for action `{0}`. Expected response to ' +
                      'contain an {1} but got an {2} (Request: {3} {4})', name, (!isSingleElement && action.isArray) ? 'array' : 'object',
                      angular.isArray(data) ? 'array' : 'object', httpConfig.method, httpConfig.url);
                  }

                  if(angular.isArray(data) && forceSingleElement){
                    if(data.length>0){
                      data = data[0];
                    }else{
                      throw "The response returned no result";
                    }
                  }

                  // jshint +W018
                  if (!isSingleElement && action.isArray) {
                    value.length = 0;
                    forEach(data, function(item) {
                      if (typeof item === "object") {
                        value.push(new Resource(item));
                      } else {
                        // Valid JSON values may be string literals, and these should not be converted
                        // into objects. These items will not have access to the Resource prototype
                        // methods, but unfortunately there
                        value.push(item);
                      }
                    });
                  } else {
                    shallowClearAndCopy(data, value);
                    value.$promise = promise;
                  }
                }

                value.$resolved = true;

                response.resource = value;

                return response;
              }, function(response) {
                value.$resolved = true;

                (error || noop)(response);

                return $q.reject(response);
              });

              promise = promise.then(
                function(response) {
                  var value = responseInterceptor(response);
                  (success || noop)(value, response.headers);
                  return value;
                },
                responseErrorInterceptor);

              if (!isInstanceCall) {
                // we are creating instance / collection
                // - set the initial promise
                // - return the instance / collection
                value.$promise = promise;
                value.$resolved = false;

                return value;
              }

              // instance call
              return promise;
            };


            Resource.prototype['$' + name] = function(params, success, error) {
              if (isFunction(params)) {
                error = success;
                success = params;
                params = {};
              }
              var result = Resource[name].call(this, params, this, success, error);
              return result.$promise || result;
            };
          });

          var oldOdataResource = Resource.odata;
          Resource.odata = function() {
            var onQuery = function(queryString, success, error, isSingleElement,forceSingleElement) {
              return oldOdataResource({}, {}, success, error, true, queryString, isSingleElement,forceSingleElement);
            };


            return new $odata.Provider(onQuery);
          };

          Resource.bind = function(additionalParamDefaults) {
            return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
          };

          return Resource;
        }

        return resourceFactory;
      }
    ];
  });


})(window, window.angular);;/// <reference path="references.d.ts" />
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
