angular.module('ODataResources').
factory('$odataProperty', [function() {

var ODataProperty = function(input){
		this.value = input;
	};

	ODataProperty.prototype.execute = function(){
		return this.value;
	};
	return ODataProperty;
}]);
	