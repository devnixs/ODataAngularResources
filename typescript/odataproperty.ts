/// <reference path="references.d.ts" />

module OData{
	export class Property implements IExecutable{
		constructor(private input:string){}
		
		public execute():string{
			return this.input;
		}	
	}

	angular.module('ODataResources').
	factory('$odataProperty', [()=>Property]);
	
}
