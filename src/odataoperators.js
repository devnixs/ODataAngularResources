if (!String.prototype.trim) {
  (function() {
    // On s'assure de bien retirer BOM et NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}

angular.module('ODataResources').
  factory('$odataOperators', [function() {

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
  			var input = from.trim().toLowerCase();
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
