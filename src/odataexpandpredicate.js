angular.module('ODataResources').
factory('$odataExpandPredicate', [function () {

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
            expand: this.expandables,
        };
        this.context = context;
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

    ODataExpandPredicate.prototype.expand = function (tableName) {
        if (tableName === undefined) {
            throw "ExpandPredicate.expand should be passed a table name but got undefined.";
        }

        new ODataExpandPredicate(tableName, this).finish();
        return this;
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
                sub.push("$" + option + "=" + this.options[option].join(','));
            }
        }
        if (sub.length) {
            query += "(" + sub.join(';') + ")";
        }
        return query;
    };

    ODataExpandPredicate.prototype.finish = function () {
        var query = this.build();
        if (this.expandables.some(function (value) { return value === query; }))
            return this;
        this.context.expandables.push(query);
        return this.context;
    };

    return ODataExpandPredicate;
}]);