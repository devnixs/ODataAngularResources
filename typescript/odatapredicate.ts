/// <reference path="references.d.ts" />

module OData{
	export interface PredicateFactory{
		new (propertyOrValueOrPredicate:any,valueOrOperator?:any,value?:any): Predicate;
		or(orStatements: any[]): IExecutable;
		create(propertyOrPredicate:any,operatorOrValue?:any,value?:any): IExecutable;
		and(andStatements:any): IExecutable;
	}

	
	export class Predicate extends BinaryOperation{

		constructor(propertyOrValueOrPredicate,valueOrOperator?,value?){
			if(angular.isFunction(propertyOrValueOrPredicate.execute) && valueOrOperator === undefined){
				return propertyOrValueOrPredicate;
			}
			else{
				super(propertyOrValueOrPredicate,valueOrOperator,value);
			}
		}


		public static or(orStatements:any[]): IExecutable{
			if(orStatements.length>0){
				var finalOperation = orStatements[0];
				
				for (var i = 1; i < orStatements.length; i++)
				{
					finalOperation = new BinaryOperation(finalOperation,'or',orStatements[i]);
				}
				return finalOperation;
			}
			throw "No statements specified for OR predicate";
		}


		public static create(propertyOrPredicate :any,operatorOrValue?:any,value?:any): IExecutable{
			if(angular.isFunction(propertyOrPredicate.execute) && operatorOrValue === undefined){
				return propertyOrPredicate;
			}
			else{
				return new BinaryOperation(propertyOrPredicate,operatorOrValue,value);
			}
		}

		public static and(andStatements): IExecutable{
			if(andStatements.length>0){
				var finalOperation = andStatements[0];

				for (var i = 1; i < andStatements.length; i++) {
					finalOperation = new BinaryOperation(finalOperation,'and',andStatements[i]);
				}
				return finalOperation;
			}
			throw "No statements specified";
		}

	}
}


	angular.module('ODataResources').factory('$odataPredicate', [()=>OData.Predicate]);
