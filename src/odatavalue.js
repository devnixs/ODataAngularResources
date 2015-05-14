angular.module('ODataResources').
factory('$odataValue', [
	function() {

		var illegalChars = {
			'%': '%25',
			'+': '%2B',
			'/': '%2F',
			'?': '%3F',
			'#': '%23',
			'&': '%26'
		};

		var escapeIllegalChars = function(string){
			for(var key in illegalChars){
				string = string.replace(key,illegalChars[key]);
			}
			string = string.replace("'", "''");
			return string;
		};

		var ODataValue = function(input) {
			this.value = input;
		};

		ODataValue.prototype.execute = function() {
			if (typeof this.value === "string") {
				return "'" + escapeIllegalChars(this.value) + "'";
			} else if (this.value === false) {
				return "false";
			} else if (this.value === true) {
				return "true";
			} else if (!isNaN(this.value)) {
				return this.value;
			} else {
				throw "Unrecognized type of " + this.value;
			}
		};
		return ODataValue;
	}
]);