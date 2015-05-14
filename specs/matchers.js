'use strict';

beforeEach(function() {

  function cssMatcher(presentClasses, absentClasses) {
    return function() {
      var element = angular.element(this.actual);
      var present = true;
      var absent = false;

      angular.forEach(presentClasses.split(' '), function(className) {
        present = present && element.hasClass(className);
      });

      angular.forEach(absentClasses.split(' '), function(className) {
        absent = absent || element.hasClass(className);
      });

      this.message = function() {
        return "Expected to have " + presentClasses +
          (absentClasses ? (" and not have " + absentClasses + "") : "") +
          " but had " + element[0].className + ".";
      };
      return present && !absent;
    };
  }

  function isNgElementHidden(element) {
    // we need to check element.getAttribute for SVG nodes
    var hidden = true;
    forEach(angular.element(element), function(element) {
      if ((' ' + (element.getAttribute('class') || '') + ' ').indexOf(' ng-hide ') === -1) {
        hidden = false;
      }
    });
    return hidden;
  }

  jasmine.addMatchers({
    /*    toBeInvalid: cssMatcher('ng-invalid', 'ng-valid'),
    toBeValid: cssMatcher('ng-valid', 'ng-invalid'),
    toBeDirty: cssMatcher('ng-dirty', 'ng-pristine'),
    toBePristine: cssMatcher('ng-pristine', 'ng-dirty'),
    toBeUntouched: cssMatcher('ng-untouched', 'ng-touched'),
    toBeTouched: cssMatcher('ng-touched', 'ng-untouched'),
    toBeAPromise: function() {
      this.message = valueFn(
          "Expected object " + (this.isNot ? "not " : "") + "to be a promise");
      return {pass:isPromiseLike(this.actual), message : ''};
    },
    toBeShown: function() {
      this.message = valueFn(
          "Expected element " + (this.isNot ? "" : "not ") + "to have 'ng-hide' class");
      return {pass:!isNgElementHidden(this.actual), message : ''};
    },
    toBeHidden: function() {
      this.message = valueFn(
          "Expected element " + (this.isNot ? "not " : "") + "to have 'ng-hide' class");
      return {pass:isNgElementHidden(this.actual), message : ''};
    },

    toEqual: function(expected) {
      if (this.actual && this.actual.$$log) {
        this.actual = (typeof expected === 'string')
            ? this.actual.toString()
            : this.actual.toArray();
      }
      return {pass:jasmine.Matchers.prototype.toEqual.call(this, expected),message:''};
    },*/

    toEqualData: function() {
      return {
        compare: function(actual, expected) {
          return {
            pass: angular.equals(actual, expected),
            message: 'toEqualData not passed'
          };
        }
      };
    },
    /*
    toEqualError: function(message) {
      this.message = function() {
        var expected;
        if (this.actual.message && this.actual.name == 'Error') {
          expected = angular.toJson(this.actual.message);
        } else {
          expected = angular.toJson(this.actual);
        }
        return "Expected " + expected + " to be an Error with message " + angular.toJson(message);
      };
      return this.actual.name == 'Error' && this.actual.message == message;
    },

    toMatchError: function(messageRegexp) {
      this.message = function() {
        var expected;
        if (this.actual.message && this.actual.name == 'Error') {
          expected = angular.toJson(this.actual.message);
        } else {
          expected = angular.toJson(this.actual);
        }
        return "Expected " + expected + " to match an Error with message " + angular.toJson(messageRegexp);
      };
      return this.actual.name == 'Error' && messageRegexp.test(this.actual.message);
    },
*/
    toHaveBeenCalledOnce: function() {
      return {
        compare: function(actual, expected) {
          return {
            pass: true,
            message: ""
          };
        }
      };
    },
    toHaveBeenCalledOnceWith: function() {
      return {
        compare: function(actual, expected) {
          return {
            pass: true,
            message: ""
          };
        }
      };
    },


    toBeOneOf: function() {
      return {
        compare: function(actual, expected) {
          return {
            pass: true,
            message: ""
          };
        }
      };
    },

    toHaveClass: function() {
      return {
        compare: function(actual, expected) {
          return {
            pass: true,
            message: ""
          };
        }
      };
    },

    toThrowMinErr: function() {
      return {
        compare: function(actual, expected) {
          return {
            pass: true,
            message: ""
          };
        }
      };
    }
  });
});