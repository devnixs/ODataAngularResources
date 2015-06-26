/// <reference path="references.d.ts" />

module OData {
	export interface PropertyFactory {
		new (value: string): Property;
	}

	export class Property implements IExecutable {
		constructor(private value: string) { }

		public execute(): string {
			return this.value;
		}
	}

	angular.module('ODataResources').
		factory('$odataProperty', [() => Property]);

}
