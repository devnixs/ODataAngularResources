angular.module('ODataResources').
factory('$odataPredicate', ['$odataBinaryOperation',function(ODataBinaryOperation) {



	var ODataPredicate = function(a1,a2,a3){
		if(angular.isFunction(a1.execute) && a2 === undefined){
			return a1;
		}
		else{
			return new ODataBinaryOperation(a1,a2,a3);
		}
	};

	ODataPredicate.and = function(andStatements){
		if(andStatements.length>0){
			var finalOperation = andStatements[0];

			for (var i = 1; i < andStatements.length; i++) {
				finalOperation = new ODataBinaryOperation(finalOperation,'and',andStatements[i]);
			}
			return finalOperation;
		}
		throw "No statements specified";
	};

	ODataPredicate.or = function(orStatements){
		if(orStatements.length>0){
			var finalOperation = orStatements[0];

			for (var i = 1; i < orStatements.length; i++) {
				finalOperation = new ODataBinaryOperation(finalOperation,'or',orStatements[i]);
			}
			return finalOperation;
		}
		throw "No statements specified for OR predicate";
	};


	ODataPredicate.create = function(a1,a2,a3){
		if(angular.isFunction(a1.execute) && a2 === undefined){
			return a1;
		}
		else{
			return new ODataBinaryOperation(a1,a2,a3);
		}
	};

	return ODataPredicate;

}]);
