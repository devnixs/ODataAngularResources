angular.module('ODataResources').
factory('$odataProvider', ['$odataOperators', '$odataBinaryOperation', '$odataPredicate', '$odataOrderByStatement',
    function($odataOperators, ODataBinaryOperation, ODataPredicate, ODataOrderByStatement) {
        var ODataProvider = function(callback, isv4) {
            this.callback = callback;
            this.filters = [];
            this.sortOrders = [];
            this.takeAmount = undefined;
            this.skipAmount = undefined;
            this.expandables = [];
            this.isv4 = isv4;
            this.hasInlineCount = false;
            this.selectables = [];
        };
        ODataProvider.prototype.filter = function(operand1, operand2, operand3) {
            if (operand1 === undefined) throw "The first parameted is undefined. Did you forget to invoke the method as a constructor by adding the 'new' keyword?";
            var predicate;
            if (angular.isFunction(operand1.execute) && operand2 === undefined) {
                predicate = operand1;
            } else {
                predicate = new ODataBinaryOperation(operand1, operand2, operand3);
            }
            this.filters.push(predicate);
            return this;
        };
        ODataProvider.prototype.orderBy = function(arg1, arg2) {
            this.sortOrders.push(new ODataOrderByStatement(arg1, arg2));
            return this;
        };
        ODataProvider.prototype.take = function(amount) {
            this.takeAmount = amount;
            return this;
        };
        ODataProvider.prototype.skip = function(amount) {
            this.skipAmount = amount;
            return this;
        };
        ODataProvider.prototype.execute = function() {
            var queryString = '';
            var i;
            if (this.filters.length > 0) {
                queryString = "$filter=" + ODataPredicate.and(this.filters).execute(this.isv4,true);
            }
            if (this.sortOrders.length > 0) {
                if (queryString !== "") queryString += "&";
                queryString += "$orderby=";
                for (i = 0; i < this.sortOrders.length; i++) {
                    if (i > 0) {
                        queryString += ",";
                    }
                    queryString += this.sortOrders[i].execute();
                }
            }
            if (this.takeAmount) {
                if (queryString !== "") queryString += "&";
                queryString += "$top=" + this.takeAmount;
            }
            if (this.skipAmount) {
                if (queryString !== "") queryString += "&";
                queryString += "$skip=" + this.skipAmount;
            }
            if (this.expandables.length > 0) {
                if (queryString !== "") queryString += "&";
                queryString += "$expand="+ this.expandables.join(',');
            }
            if(this.selectables.length>0){
                if (queryString !== "") queryString += "&";
                queryString += "$select=" + this.selectables.join(',');
            }


            if (this.hasInlineCount > 0) {
                if (queryString !== "") queryString += "&";
                queryString += this.isv4 ? "$count=true" : "$inlinecount=allpages";
            }

            return queryString;
        };
        ODataProvider.prototype.query = function(success, error) {
            if (!angular.isFunction(this.callback)) throw "Cannot execute query, no callback was specified";
            success = success || angular.noop;
            error = error || angular.noop;
            return this.callback(this.execute(), success, error);
        };
        ODataProvider.prototype.single = function(data, success, error) {
            if (!angular.isFunction(this.callback)) throw "Cannot execute get, no callback was specified";
            success = success || angular.noop;
            error = error || angular.noop;
            return this.callback(this.execute(), success, error, true, true);
        };
        ODataProvider.prototype.get = function(data, success, error) {
            if (!angular.isFunction(this.callback)) throw "Cannot execute count, no callback was specified";
            success = success || angular.noop;
            error = error || angular.noop;
            // The query string from this.execute() should be included even
            //  when fetching just a single element.
            var queryString = this.execute();
            if (queryString.length > 0) {
                queryString = "?" + queryString;
            }
            return this.callback("(" + data + ")" + queryString, success, error, true);
        };

        ODataProvider.prototype.count = function(success, error) {
            if (!angular.isFunction(this.callback)) throw "Cannot execute get, no callback was specified";
            success = success || angular.noop;
            error = error || angular.noop;
            // The query string from this.execute() should be included even
            //  when fetching just a single element.
            var queryString = this.execute();
            if (queryString.length > 0) {
                queryString = "/?" + queryString;
            }

            return this.callback("/$count"+queryString, success, error, true);
        };

        ODataProvider.prototype.withInlineCount = function() {
            this.hasInlineCount = true;
            return this;
        };

        var expandOdatav4 = function(navigationProperties){
        	var first = navigationProperties.shift();
        	var current = first;
        	if(navigationProperties.length>0){
        		current = current + "($expand="+expandOdatav4(navigationProperties)+")";
        	}
        	return current;
        };

        ODataProvider.prototype.expand = function(params) {
            if (!angular.isString(params) && !angular.isArray(params)) {
                throw "Invalid parameter passed to expand method (" + params + ")";
            }
            if (params === "") {
                return;
            }
            var expandQuery = params;
            if (this.isv4) {
            	//Make it an array
            	if (!angular.isArray(params)) {
                    params = Array.prototype.slice.call(arguments);
                }
                expandQuery = expandOdatav4(params);


            } else {
                if (angular.isArray(params)) {
                    expandQuery = params.join('/');
                } else {
                    expandQuery = Array.prototype.slice.call(arguments).join('/');
                }
                for (var i = 0; i < this.expandables.length; i++) {
                    if (this.expandables[i] === expandQuery) return this;
                }
            }

            this.expandables.push(expandQuery);
            return this;
        };


        ODataProvider.prototype.select = function(params) {
            if (!angular.isString(params) && !angular.isArray(params)) {
                throw "Invalid parameter passed to select method (" + params + ")";
            }

            if (params === "") {
                return;
            }

            var selectQuery = params;

            if (!angular.isArray(params)) {
                params = Array.prototype.slice.call(arguments);
            }   

            for (var i = params.length - 1; i >= 0; i--) {
                    this.selectables.push(params[i]);
            }   

            return this;
        };

        return ODataProvider;
    }
]);