/// <reference path="references.d.ts" />

module OData{
	export class Predicate extends BinaryOperation{

		constructor(a1,a2,a3){
			if(angular.isFunction(a1.execute) && a2 === undefined){
				return a1;
			}
			else{
				super(a1,a2,a3);
			}
		}


		public static or(orStatements): IExecutable{
			if(orStatements.length>0){
				var finalOperation = orStatements[0];

				for (var i = 1; i < orStatements.length; i++) {
					finalOperation = new BinaryOperation(finalOperation,'or',orStatements[i]);
				}
				return finalOperation;
			}
			throw "No statements specified for OR predicate";
		};


		public static create(a1,a2,a3): IExecutable{
			if(angular.isFunction(a1.execute) && a2 === undefined){
				return a1;
			}
			else{
				return new BinaryOperation(a1,a2,a3);
			}
		};

		public static and(andStatements): IExecutable{
			if(andStatements.length>0){
				var finalOperation = andStatements[0];

				for (var i = 1; i < andStatements.length; i++) {
					finalOperation = new BinaryOperation(finalOperation,'and',andStatements[i]);
				}
				return finalOperation;
			}
			throw "No statements specified";
		};

	}
}


	angular.module('ODataResources').factory('$odataPredicate', [()=>OData.Predicate]);
