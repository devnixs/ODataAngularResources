/// <reference path="references.d.ts" />

module OData {


	export class BinaryOperation implements IExecutable{

		private operandA;
		private operandB;
		private filterOperator;

		constructor(a1, a2, a3) {
			if (a1 === undefined) {
				throw "The property of a filter cannot be undefined";
			}

			if (a2 === undefined) {
				throw "The value of a filter cannot be undefined";
			}

			if (a3 === undefined) {
				//If strings are specified, we assume that the first one is the object property and the second one its value

				if (angular.isFunction(a1.execute)) {
					this.operandA = a1;
				} else {
					this.operandA = new OData.Property(a1);
				}
				if (angular.isFunction(a2.execute)) {
					this.operandB = a2;
				} else {
					this.operandB = new OData.Value(a2);
				}

				this.filterOperator = 'eq';
			}
			else {
				if (angular.isFunction(a1.execute)) {
					this.operandA = a1;
				} else {
					this.operandA = new OData.Property(a1);
				}
				if (angular.isFunction(a3.execute)) {
					this.operandB = a3;
				} else {
					this.operandB = new OData.Value(a3);
				}
				var operators = new OData.Operators();
				this.filterOperator = operators.convert(a2);
			}
		}

		public execute(noParenthesis?):string {
			var result = this.operandA.execute() + " " + this.filterOperator + " " + this.operandB.execute();
			if (!noParenthesis)
				result = "(" + result + ")";

			return result;
		}

		public or(a1, a2, a3) {
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
		}

		public and(a1, a2, a3) {
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
		}
	}

	angular.module('ODataResources').
		factory('$odataBinaryOperation',
			['$odataOperators', '$odataProperty', '$odataValue',
				function($odataOperators, ODataProperty, ODataValue) {
					return BinaryOperation;
				}
			]);


}
