angular.module('ODataResources').
factory('$odata', ['$odataBinaryOperation','$odataProvider','$odataValue',
	'$odataProperty','$odataMethodCall','$odataPredicate','$odataOrderByStatement',
	function(ODataBinaryOperation,ODataProvider,ODataValue,ODataProperty,ODataMethodCall,ODataPredicate,ODataOrderByStatement) {

		return {
			Provider : ODataProvider,
			BinaryOperation : ODataBinaryOperation,
			Value : ODataValue,
			Property : ODataProperty,
			Func : ODataMethodCall,
			Predicate : ODataPredicate,
			OrderBy : ODataOrderByStatement,
		};

	}]);