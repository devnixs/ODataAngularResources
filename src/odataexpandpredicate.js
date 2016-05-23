angular.module('ODataResources').
factory('$odataExpandPredicate', ['$odataPredicate', '$odataBinaryOperation', '$odataOrderByStatement', function (ODataPredicate, ODataBinaryOperation, ODataOrderByStatement) {

    var ODataExpandPredicate = function (tableName, context) {
        if (tableName === undefined) {
            throw "ExpandPredicate should be passed a table name but got undefined.";
        }

        if (context === undefined) {
            throw "ExpandPredicate should be passed a context but got undefined.";
        }

        this.name = tableName;
        this.expandables = []; // To maintain recursion compatibility with base OdataResourceProvider
        this.options = {
            select: [],
            filter: [],
            orderby: [],
            expand: this.expandables,
        };
        this.context = context;
    };

    ODataExpandPredicate.prototype.filter = function(operand1, operand2, operand3) {
        if (operand1 === undefined) throw "The first parameter is undefined. Did you forget to invoke the method as a constructor by adding the 'new' keyword?";

        var predicate;

        if (angular.isFunction(operand1.execute) && operand2 === undefined) {
            predicate = operand1;
        } else {
            predicate = new ODataBinaryOperation(operand1, operand2, operand3);
        }

        this.options.filter.push(predicate);

        return this;
    };

    ODataExpandPredicate.prototype.select = function (propertyName) {
        if (propertyName === undefined) {
            throw "ExpandPredicate.select should be passed a property name but got undefined.";
        }

        if (!angular.isArray(propertyName))
            propertyName = propertyName.split(',');

        function checkArray(i, value) {
            return value === propertyName[i];
        }

        for (var i = 0; i < propertyName.length; i++) {
            if (!this.options.select.some(checkArray.bind(this, i)))
                this.options.select.push(propertyName[i]);
        }
        return this;
    };

    ODataExpandPredicate.prototype.orderBy = function (arg1, arg2) {
        this.options.orderby.push((new ODataOrderByStatement(arg1, arg2)).execute());
        return this;
    };

    ODataExpandPredicate.prototype.expand = function (tableName) {
        if (tableName === undefined) {
            throw "ExpandPredicate.expand should be passed a table name but got undefined.";
        }
        return new ODataExpandPredicate(tableName, this).finish();
    };

    ODataExpandPredicate.prototype.expandPredicate = function (tableName) {
        if (tableName === undefined) {
            throw "ExpandPredicate.expandPredicate should be passed a table name but got undefined.";
        }
        return new ODataExpandPredicate(tableName, this);
    };

    ODataExpandPredicate.prototype.build = function () {
        var query = this.name;
        var sub = [];
        for (var option in this.options) {
            if (this.options[option].length) {
                if (option === 'filter') {
                    sub.push("$filter=" + ODataPredicate.and(this.options.filter).execute(this.isv4, true));
                } else {
                    sub.push("$" + option + "=" + this.options[option].join(','));
                }
            }
        }
        if (sub.length) {
            query += "(" + sub.join(';') + ")";
        }
        return query;
    };

    ODataExpandPredicate.prototype.finish = function () {
        var query = this.build();
        this.context.expandables.push(query);
        return this.context;
    };

    return ODataExpandPredicate;
}]);