/// <reference path="references.d.ts" />

module OData {

	export interface IExecutable{
		execute(noParenthesis?): string;
	}

	export class Global {
		public static $inject: string[] = ['$odataBinaryOperation', '$odataProvider', '$odataValue',
			'$odataProperty', '$odataMethodCall', '$odataPredicate', '$odataOrderByStatement'];

		constructor(ODataBinaryOperation, ODataProvider,
			ODataValue, ODataProperty, ODataMethodCall,
			ODataPredicate, ODataOrderByStatement) {
				this.Provider = ODataProvider;
				this.BinaryOperation = ODataBinaryOperation;
				this.Value = ODataValue;
				this.Property = ODataProperty;
				this.Func = ODataMethodCall;
				this.Predicate = ODataPredicate;
				this.OrderBy = ODataOrderByStatement;
		}

		public Provider : Provider<any>;
		public BinaryOperation : typeof BinaryOperation;
		public Value : typeof Value;
		public Property : typeof Property;
		public Func : typeof MethodCall;
		public Predicate : typeof Predicate;
		public OrderBy : typeof OrderByStatement;
	}

	angular.module('ODataResources').service("$odata",Global);
}