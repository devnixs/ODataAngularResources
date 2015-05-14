angular.module('ODataResources').
factory('$odataProvider', ['$odataOperators', '$odataBinaryOperation', '$odataPredicate', '$odataOrderByStatement',
	function($odataOperators, ODataBinaryOperation, ODataPredicate, ODataOrderByStatement) {
		var ODataProvider = function(callback) {
			this.callback = callback;

			this.filters = [];
			this.sortOrders = [];
			this.takeAmount = undefined;
			this.skipAmount = undefined;
		};

		ODataProvider.prototype.filter = function(operand1, operand2, operand3) {
			if(operand1 ===undefined)
				throw "The first parameted is undefined. Did you forget to invoke the method as a constructor by adding the 'new' keyword?";

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
			if (this.filters.length > 0) {
				queryString = "$filter=" + ODataPredicate.and(this.filters).execute(true);
			}

			if (this.sortOrders.length > 0) {
				if (queryString !== "") queryString += "&";

				queryString += "$orderby=";
				for (var i = 0; i < this.sortOrders.length; i++) {
					if (i > 0) {
						queryString += ",";
					}
					queryString += this.sortOrders[i].execute();
				};
			}

			if (this.takeAmount) {
				if (queryString !== "") queryString += "&";
				queryString += "$top=" + this.takeAmount;
			}


			if (this.skipAmount) {
				if (queryString !== "") queryString += "&";
				queryString += "$skip=" + this.skipAmount;
			}


			return queryString;
		};

		ODataProvider.prototype.query = function() {
			if (angular.isFunction(this.callback))
				return this.callback(this.execute());
		};

		return ODataProvider;
	}
]);