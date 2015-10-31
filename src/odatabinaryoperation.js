angular.module('ODataResources').
factory('$odataBinaryOperation', ['$odataOperators','$odataProperty','$odataValue',function($odataOperators,ODataProperty,ODataValue) {

	var ODataBinaryOperation = function(a1,a2,a3){
		if(a1===undefined){
			throw "The property of a filter cannot be undefined";
		}

		if(a2 === undefined){
			throw "The value of a filter cannot be undefined";
		}

		if(a3 === undefined){
			//If strings are specified, we assume that the first one is the object property and the second one its value

			if(angular.isFunction(a1.execute)){
				this.operandA = a1;
			}else{
				this.operandA = new ODataProperty(a1);
			}
			if(a2!==null && angular.isFunction(a2.execute)){ 
				this.operandB = a2;
			}else{
				this.operandB = new ODataValue(a2);
			}

			this.filterOperator = 'eq';
		}
		else{
			if(angular.isFunction(a1.execute)){
				this.operandA = a1;
			}else{
				this.operandA = new ODataProperty(a1);
			}
			if(a3!==null && angular.isFunction(a3.execute)){
				this.operandB = a3;
			}else{
				this.operandB = new ODataValue(a3);
			}

			this.filterOperator = $odataOperators.convert(a2);
		}
	};


	ODataBinaryOperation.prototype.execute = function(isODatav4,noParenthesis){
		var result = this.operandA.execute(isODatav4)+" "+this.filterOperator+" " +this.operandB.execute(isODatav4);
		if(!noParenthesis)
			result = "("+result+")";

		return result;
	};

	ODataBinaryOperation.prototype.or = function(a1,a2,a3){
		var other;
		if(a2!==undefined){
			other = new ODataBinaryOperation(a1,a2,a3);
		}
		else if(angular.isFunction(a1.execute)){
			other = a1;
		}
		else{
			throw "The object " +a1 +" passed as a parameter of the or method is not valid";
		}
		return new ODataBinaryOperation(this,"or",other);
	};

	ODataBinaryOperation.prototype.and = function(a1,a2,a3){
		var other;
		if(a2!==undefined){
			other = new ODataBinaryOperation(a1,a2,a3);
		}
		else if(angular.isFunction(a1.execute)){
			other = a1;
		}
		else{
			throw "The object " +a1 +" passed as a parameter of the and method is not valid";
		}
		return new ODataBinaryOperation(this,"and",other);
	};

	return ODataBinaryOperation;
}

]);