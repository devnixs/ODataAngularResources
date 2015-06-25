/// <reference path="references.d.ts" />

module OData {

	interface ProviderCallback {
		(queryString: string,
			success: () => any,
			error: () => any,
			isSingleElement?: boolean,
			forceSingleElement?: boolean): void;
	}

	export class Provider implements IExecutable {
		private filters = [];
		private sortOrders = [];
		private takeAmount = undefined;
		private skipAmount = undefined;
		private expandables = [];

		constructor(private callback: ProviderCallback) { }

		public filter(operand1, operand2, operand3) {
			if (operand1 === undefined)
				throw "The first parameted is undefined. Did you forget to invoke the method as a constructor by adding the 'new' keyword?";

			var predicate;
			if (angular.isFunction(operand1.execute) && operand2 === undefined) {
				predicate = operand1;
			} else {
				predicate = new BinaryOperation(operand1, operand2, operand3);
			}
			this.filters.push(predicate);
			return this;
		};

		public orderBy(arg1, arg2) {
			this.sortOrders.push(new OrderByStatement(arg1, arg2));
			return this;
		};

		public take(amount) {
			this.takeAmount = amount;
			return this;
		};
		public skip(amount) {
			this.skipAmount = amount;
			return this;
		};

		public execute() {
			var queryString = '';
			var i;
			if (this.filters.length > 0) {
				queryString = "$filter=" + Predicate.and(this.filters).execute(true);
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

		public query(success, error) {
			if (!angular.isFunction(this.callback))
				throw "Cannot execute query, no callback was specified";


			success = success || angular.noop;
			error = error || angular.noop;

			return this.callback(this.execute(), success, error);
		};


		public single(data, success, error) {
			if (!angular.isFunction(this.callback))
				throw "Cannot execute get, no callback was specified";

			success = success || angular.noop;
			error = error || angular.noop;

			return this.callback(this.execute(), success, error, true, true);
		};

		public get(data, success, error) {
			if (!angular.isFunction(this.callback))
				throw "Cannot execute get, no callback was specified";

			success = success || angular.noop;
			error = error || angular.noop;

			return this.callback("(" + data + ")", success, error, true);
		};

		public expand(params) {
			if (!angular.isString(params) && !angular.isArray(params)) {
				throw "Invalid parameter passed to expand method (" + params + ")";
			}
			if (params === "") {
				return;
			}

			var expandQuery = params;
			if (angular.isArray(params)) {
				expandQuery = params.join('/');
			} else {
				expandQuery = Array.prototype.slice.call(arguments).join('/');
			}

			for (var i = 0; i < this.expandables.length; i++) {
				if (this.expandables[i] === expandQuery)
					return this;
			}

			this.expandables.push(expandQuery);
			return this;
		};
	}

}

angular.module('ODataResources').
	factory('$odataProvider', [() => OData.Provider]);