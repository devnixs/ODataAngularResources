/// <reference path="references.d.ts" />

module OData {
  export class Operators {
    public operators = {
      'eq': ['=', '==', '==='],
      'ne': ['!=', '!==', '<>'],
      'gt': ['>'],
      'ge': ['>=', '>=='],
      'lt': ['<'],
      'le': ['<=', '<=='],
      'and': ['&&'],
      'or': ['||'],
      'not': ['!'],
      'add': ['+'],
      'sub': ['-'],
      'mul': ['*'],
      'div': ['/'],
      'mod': ['%'],
    };

    private rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    private trim(value: string): string {
      return value.replace(this.rtrim, '');
    };

    public convert(from: string) {
      var input = this.trim(from).toLowerCase();
      var key;
      for (key in this.operators) {
        if (input === key) return key;

        var possibleValues = this.operators[key];
        for (var i = 0; i < possibleValues.length; i++) {
          if (input === possibleValues[i]) {
            return key;
          }
        }
      }

      throw "Operator " + from + " not found";
    };

  }
}



angular.module('ODataResources').service('$odataOperators', OData.Operators);
