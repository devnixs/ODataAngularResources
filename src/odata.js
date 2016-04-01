angular.module('ODataResources').
factory('$odata', ['$odataBinaryOperation','$odataProvider','$odataValue',
	'$odataProperty','$odataMethodCall','$odataPredicate','$odataOrderByStatement','$odataExpandPredicate',
	function(ODataBinaryOperation,ODataProvider,ODataValue,ODataProperty,ODataMethodCall,ODataPredicate,ODataOrderByStatement,ODataExpandPredicate) {

		return {
			Provider : ODataProvider,
			BinaryOperation : ODataBinaryOperation,
			Value : ODataValue,
			Property : ODataProperty,
			Func : ODataMethodCall,
			Predicate : ODataPredicate,
			OrderBy : ODataOrderByStatement,
            ExpandPredicate : ODataExpandPredicate,
		};

	}]);