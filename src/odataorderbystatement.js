angular.module('ODataResources').
factory('$odataOrderByStatement', [function($odataOperators,ODataBinaryOperation,ODataPredicate) {

	var ODataOrderByStatement = function(propertyName, sortOrder){
		if(propertyName===undefined){
			throw "Orderby should be passed a property name but got undefined";
		}

		this.propertyName = propertyName;

		this.direction = sortOrder || "asc";
	};

	ODataOrderByStatement.prototype.execute = function() {
		return this.propertyName+" "+this.direction;
	};

	return ODataOrderByStatement;
}]);