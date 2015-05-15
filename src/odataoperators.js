

angular.module('ODataResources').
  factory('$odataOperators', [function() {

      var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
      trim = function(value) {
        return value.replace(rtrim, '');
      };
        

  		var filterOperators =  {
  			'eq':['=','==','==='],
			'ne':['!=','!==','<>'],
			'gt':['>'],
			'ge':['>=','>=='],
			'lt':['<'],
			'le':['<=','<=='],
			'and':['&&'],
			'or':['||'],
			'not':['!'],
			'add':['+'],
			'sub':['-'],
			'mul':['*'],
			'div':['/'],
			'mod':['%'],
  		};

  		var convertOperator = function(from){
  			var input = trim(from).toLowerCase();
  			var key;
  			for(key in filterOperators)
  			{
  				if(input === key) return key;

  				var possibleValues = filterOperators[key];
  				for (var i = 0; i < possibleValues.length; i++) {
  					if(input === possibleValues[i]){
  						return key;
  					}
  				}
  			}

  			throw "Operator "+ from+" not found";
  		};

  		return {
  			operators : filterOperators,
  			convert:convertOperator,
  		};
  	}]);
