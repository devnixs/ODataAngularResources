/// <reference path="references.d.ts" />
module OData{
	export class OrderByStatement implements IExecutable{
		private direction: string;
		public execute():string{
			return this.propertyName+" "+this.direction;
		}
		constructor(private propertyName:string,sortOrder:string){
		if(propertyName===undefined){
			throw "Orderby should be passed a property name but got undefined";
		}

		this.propertyName = propertyName;

		this.direction = sortOrder || "asc";
	};
	}
}

angular.module('ODataResources').factory('$odataOrderByStatement', [()=>OData.OrderByStatement]);