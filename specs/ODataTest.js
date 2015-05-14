/* global it */
/* global describe */
/* global beforeEach */
/* global inject */
/* global module */
/* global spyOn */
/* global expect */
/* global jasmine */

(function() {
	"use strict";
	var $odata;
	describe('OData', function() {
		beforeEach(module('ODataResources'));
		beforeEach(function() {
			inject(function(_$odata_) {
				$odata = _$odata_;
			});
		});
		describe('OrderBy', function() {
			it('should throw if passed undefined', function() {
				expect(function() {
					new $odata.OrderBy();
				}).toThrow();
			});
			it('should have the property name inside', function() {
				var sortOrder = new $odata.OrderBy("Name");
				expect(sortOrder.propertyName).toBe("Name");
			});
			it('should to be asc by default', function() {
				var sortOrder = new $odata.OrderBy("Name");
				expect(sortOrder.direction).toBe("asc");
			});
			it('should to be the passed direction', function() {
				var sortOrder = new $odata.OrderBy("Name", "desc");
				expect(sortOrder.direction).toBe("desc");
			});
			it('should execute', function() {
				var sortOrder = new $odata.OrderBy("Name", "desc");
				expect(sortOrder.execute()).toBe("Name desc");
			});
		});
		describe("BinaryOperation", function() {
			it('should allow 3 parameters', function() {
				var filter = new $odata.BinaryOperation("a", "eq", "c");
				expect(filter.operandA.value).toBe("a");
				expect(filter.filterOperator).toBe("eq");
				expect(filter.operandB.value).toBe("c");
			});
			it('should allow 2 parameters', function() {
				var filter = new $odata.BinaryOperation("a", "b");
				expect(filter.operandA.value).toBe("a");
				expect(filter.filterOperator).toBe("eq");
				expect(filter.operandB.value).toBe("b");
			});
			it('should replace operator = by its corresponding OData value', function() {
				var filter = new $odata.BinaryOperation("a", "=", "c");
				expect(filter.operandA.value).toBe("a");
				expect(filter.filterOperator).toBe("eq");
				expect(filter.operandB.value).toBe("c");
			});
			it('should replace operator < by its corresponding OData value', function() {
				var filter = new $odata.BinaryOperation("a", "<", "c");
				expect(filter.operandA.value).toBe("a");
				expect(filter.filterOperator).toBe("lt");
				expect(filter.operandB.value).toBe("c");
			});
			it('should work with spaces in operator', function() {
				var filter = new $odata.BinaryOperation("a", "< ", "c");
				expect(filter.operandA.value).toBe("a");
				expect(filter.filterOperator).toBe("lt");
				expect(filter.operandB.value).toBe("c");
			});
			it('should work with capitals in operator', function() {
				var filter = new $odata.BinaryOperation("a", "AND", "c");
				expect(filter.operandA.value).toBe("a");
				expect(filter.filterOperator).toBe("and");
				expect(filter.operandB.value).toBe("c");
			});
			it('should throw if operator not defined', function() {
				expect(function() {
					new $odata.BinaryOperation("a", "abc", "c");
				}).toThrow();
			});
			it('should generate correct query with strings', function() {
				var filter = new $odata.BinaryOperation("a", "AND", "c");
				expect(filter.execute()).toBe("(a and 'c')");
				filter = new $odata.BinaryOperation("a", "=", "c");
				expect(filter.execute()).toBe("(a eq 'c')");
			});
			it('should generate correct query with number', function() {
				var filter = new $odata.BinaryOperation("a", "=", 10);
				expect(filter.execute()).toBe("(a eq 10)");
			});
			describe('should generate correct query if both properties are specified', function() {
				it('with explicit operator', function() {
					var filter = new $odata.BinaryOperation(new $odata.Property("test"), "=", new $odata.Property("anothervalue"));
					expect(filter.execute()).toBe("(test eq anothervalue)");
				});
				it('with implicit operator', function() {
					var filter = new $odata.BinaryOperation(new $odata.Property("test"), new $odata.Property("anothervalue"));
					expect(filter.execute()).toBe("(test eq anothervalue)");
				});
			});
			describe('should generate correct query with string that have illegal or legal chars', function() {
				it('with quotes [illegal]', function() {
					var filter = new $odata.BinaryOperation("a", "=", 'thisis\'avalue');
					expect(filter.execute()).toBe("(a eq 'thisis\'\'avalue')");
				});
				it('with backslashes [legal]', function() {
					var filter = new $odata.BinaryOperation("a", "=", '\\ hello');
					expect(filter.execute()).toBe("(a eq '\\ hello')");
				});
				it('with slashes [illegal]', function() {
					var filter = new $odata.Value('abc/');
					expect(filter.execute()).toBe("'abc%2F'");
				});
				it('with plus [illegal]', function() {
					var filter = new $odata.Value('abc+');
					expect(filter.execute()).toBe("'abc%2B'");
				});
				it('with question mark [illegal]', function() {
					var filter = new $odata.Value('abc?');
					expect(filter.execute()).toBe("'abc%3F'");
				});
				it('with percent [illegal]', function() {
					var filter = new $odata.Value('abc%');
					expect(filter.execute()).toBe("'abc%25'");
				});
				it('with sharp [illegal]', function() {
					var filter = new $odata.Value('abc#');
					expect(filter.execute()).toBe("'abc%23'");
				});
				it('with and [illegal]', function() {
					var filter = new $odata.Value('abc&');
					expect(filter.execute()).toBe("'abc%26'");
				});
			});
			describe('Method calls', function() {
				it('should throw if no method name is specified', function() {
					expect(function() {
						new $odata.Func("", 'prop');
					}).toThrow();
				});
				it('should throw if no params are specified', function() {
					expect(function() {
						new $odata.Func("endswith");
					}).toThrow();
				});
				it('should allow implicit parameters', function() {
					var func = new $odata.Func("endswith", 'prop');
					expect(func.methodName).toBe("endswith");
					expect(func.params[0].execute()).toBe("prop");
				});
				it('should allow special parameters', function() {
					var func = new $odata.Func("endswith", new $odata.Value("abc"));
					expect(func.methodName).toBe("endswith");
					expect(func.params[0].execute()).toBe("'abc'");
				});
				it('should allow special multiple parameters', function() {
					var func = new $odata.Func("endswith", new $odata.Value("abc"), new $odata.Property("Name"));
					expect(func.methodName).toBe("endswith");
					expect(func.params[0].execute()).toBe("'abc'");
					expect(func.params[1].execute()).toBe("Name");
				});
				it('should execute', function() {
					var func = new $odata.Func("endswith", new $odata.Value("abc"), new $odata.Property("Name"));
					expect(func.execute()).toBe("endswith('abc',Name)");
				});
			});
		});
		describe('ODataProperty', function() {
			it('should not encode the result', function() {
				var property = new $odata.Property("test");
				expect(property.execute()).toBe("test");
			});
			it('should not encode the result nor change the case', function() {
				var property = new $odata.Property("Test");
				expect(property.execute()).toBe("Test");
			});
		});
		describe('ODataValue', function() {
			it('should encode strings', function() {
				var value = new $odata.Value("test");
				expect(value.execute()).toBe("'test'");
			});
			it('should encode strings', function() {
				var value = new $odata.Value("'test");
				expect(value.execute()).toBe("'''test'");
			});
		});
		describe('Provider', function() {
			describe('filter', function() {
				it('should add to the filters', function() {
					var provider = new $odata.Provider();
					provider.filter("a", "b");
					expect(provider.filters.length).toBe(1);
				});
				it('should be chainable', function() {
					var provider = new $odata.Provider();
					provider.filter("a", "b").filter("c", "eq", "d");
					expect(provider.filters.length).toBe(2);
				});
				it('should accept a predicate as a parameter', function() {
					var provider = new $odata.Provider();
					var predicate = new $odata.Predicate("Name", "Raphael").and("Age", 23);
					provider.filter(predicate);
					expect(provider.execute(true)).toBe("$filter=(Name eq 'Raphael') and (Age eq 23)");
				});
				it('should throw if passed undefined', function() {
					var provider = new $odata.Provider();
					expect(function(){
						provider.filter(undefined);
					}).toThrow();
				});
			});
			describe('Execute', function() {
				it('should generate a query with one parameter', function() {
					var provider = new $odata.Provider();
					var query = provider.filter("a", "b").execute();
					expect(query).toBe("$filter=a eq 'b'");
				});
			});
			describe('Query', function() {
				it('should call execute', function() {
					var provider = new $odata.Provider(function(){});
					spyOn(provider, 'execute');
					provider.query();
					expect(provider.execute).toHaveBeenCalled();
				});
				it('should call callback', function() {
					var spy = jasmine.createSpy("callback");
					var provider = new $odata.Provider(spy);
					spyOn(provider, 'execute');
					provider.query();
					expect(provider.execute).toHaveBeenCalled();
					expect(spy).toHaveBeenCalled();
				});
			});
			it('Should generate a complex query', function() {
				var provider = new $odata.Provider();
				var query = provider.filter("Name", "Raphael").filter("Age", ">", 20).filter(new $odata.Property("NumberOfFeet"), "=", new $odata.Property("NumberOfHands")).filter(new $odata.Func("endswith", 'Name', 'phael'), true).execute();
				expect(query).toBe("$filter=(((Name eq 'Raphael') and (Age gt 20)) and (NumberOfFeet eq NumberOfHands)) and (endswith(Name,'phael') eq true)");
			});
			describe('Ordering', function() {
				it('should add to the order collection', function() {
					var provider = new $odata.Provider();
					provider.orderBy("Name");
					expect(provider.sortOrders.length).toBe(1);
				});
				it('should be chainable', function() {
					var provider = new $odata.Provider();
					provider.orderBy("Name").orderBy("Age desc");
					expect(provider.sortOrders.length).toBe(2);
				});
				it('should execute', function() {
					var provider = new $odata.Provider();
					provider.orderBy("Name").orderBy("Age", "desc");
					expect(provider.execute()).toBe("$orderby=Name asc,Age desc");
				});
			});
			describe('Take', function() {
				it('should add to the property', function() {
					var provider = new $odata.Provider();
					provider.take(10);
					expect(provider.takeAmount).toBe(10);
				});
				it('should be chainable', function() {
					var provider = new $odata.Provider();
					provider.take(10).filter("Name", "Raphael");
					expect(1).toBe(1);
				});
				it('should execute', function() {
					var provider = new $odata.Provider();
					provider.take(10).filter("Name", "Raphael");
					expect(provider.execute()).toBe("$filter=Name eq 'Raphael'&$top=10");
				});
			});
			describe('Skip', function() {
				it('should add to the property', function() {
					var provider = new $odata.Provider();
					provider.skip(10);
					expect(provider.skipAmount).toBe(10);
				});
				it('should be chainable', function() {
					var provider = new $odata.Provider();
					provider.skip(10).filter("Name", "Raphael");
					expect(1).toBe(1);
				});
				it('should execute', function() {
					var provider = new $odata.Provider();
					provider.take(10).skip(5);
					expect(provider.execute()).toBe("$top=10&$skip=5");
				});
			});
		});
		describe('Predicates', function() {
			it('should generate and statements', function() {
				var predicate = $odata.Predicate.and([
					new $odata.BinaryOperation("Name", "Raphael"),
					new $odata.BinaryOperation("Age", 23),
				]);
				expect(predicate.execute()).toBe("((Name eq 'Raphael') and (Age eq 23))");
			});
			it('should allow not generating parenthesis', function() {
				var predicate = $odata.Predicate.and([
					new $odata.BinaryOperation("Name", "Raphael"),
					new $odata.BinaryOperation("Age", 23),
				]);
				expect(predicate.execute(true)).toBe("(Name eq 'Raphael') and (Age eq 23)");
			});
			it('should generate or statements', function() {
				var predicate = $odata.Predicate.or([
					new $odata.BinaryOperation("Name", "Raphael"),
					new $odata.BinaryOperation("Age", 23),
				]);
				expect(predicate.execute(true)).toBe("(Name eq 'Raphael') or (Age eq 23)");
			});
			it('should generate and statements', function() {
				var predicate = $odata.Predicate.and([
					new $odata.BinaryOperation("Name", "Raphael"),
					new $odata.BinaryOperation("Age", 23),
				]);
				expect(predicate.execute(true)).toBe("(Name eq 'Raphael') and (Age eq 23)");
			});
			it('should allow combining predicates with other predicates', function() {
				var predicate = $odata.Predicate.and([
					new $odata.BinaryOperation("Name", "Raphael"),
					new $odata.BinaryOperation("Age", 23),
				]);
				var predicate2 = $odata.Predicate.or([
					predicate,
					new $odata.Predicate("Age", 25),
				]);
				expect(predicate2.execute(true)).toBe("((Name eq 'Raphael') and (Age eq 23)) or (Age eq 25)");
			});
			describe('.create', function() {
				it('Generates a binary operator', function() {
					var predicate = $odata.Predicate.create("A", "=", "b");
					expect(predicate.execute(true)).toBe("A eq 'b'");
				});
			});
			describe('.or', function() {
				it('Should allow or chaining with explicit operation', function() {
					var predicate = $odata.Predicate.create("A", "=", "b").or(new $odata.BinaryOperation("Name", "eq", 'test'));
					expect(predicate.execute(true)).toBe("(A eq 'b') or (Name eq 'test')");
				});
				it('Should allow or chaining with unexplicit operation', function() {
					var predicate = $odata.Predicate.create("A", "=", "b").or("Name", 'test');
					expect(predicate.execute(true)).toBe("(A eq 'b') or (Name eq 'test')");
				});
			});
			describe('.and', function() {
				it('Should allow and chaining with explicit operation', function() {
					var predicate = $odata.Predicate.create("A", "=", "b").and(new $odata.BinaryOperation("Name", "eq", 'test'));
					expect(predicate.execute(true)).toBe("(A eq 'b') and (Name eq 'test')");
				});
				it('Should allow and chaining with unexplicit operation', function() {
					var predicate = $odata.Predicate.create("A", "=", "b").and("Name", 'test');
					expect(predicate.execute(true)).toBe("(A eq 'b') and (Name eq 'test')");
				});
				it('Should throw if passed an array', function() {
					expect(function() {
						var predicate = $odata.Predicate.create("A", "=", "b").and([new $odata.BinaryOperation("Name", "eq", 'test')]);
					}).toThrow();
				});
			});
			it('should allow new on predicate', function() {
				expect(new $odata.Predicate("a", "b").execute()).toBe("(a eq 'b')");
			});
			it('Should generate a complex query', function() {
				var provider = new $odata.Provider();
				var predicate1 = $odata.Predicate.create("Name", "Raphael").and("Age", 23);
				var predicate2 = new $odata.Predicate("Name", "Anais").and("Age", '>', 20);
				var methodCall = new $odata.Func("substringof", new $odata.Value("Spider"), new $odata.Property("CompanyName"));
				var predicate3 = new $odata.Predicate(methodCall, true);
				//This
				var finalPredicate = predicate1.or(predicate2).and(predicate3);
				//Is equivalent to this :
				var orResult = $odata.Predicate.or([predicate1, predicate2]);
				finalPredicate = $odata.Predicate.and([orResult, predicate3]);
				provider.filter(finalPredicate);
				expect(provider.execute(true)).toBe("$filter=(((Name eq 'Raphael') and (Age eq 23)) or ((Name eq 'Anais') and (Age gt 20))) and (substringof('Spider',CompanyName) eq true)");
			});
		});
	});
})();