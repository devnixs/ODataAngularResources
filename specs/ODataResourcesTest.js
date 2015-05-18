/* global it */
/* global describe */
/* global beforeEach */
/* global inject */
/* global module */
/* global expect */
/* global jasmine */
/* global afterEach */

//This file is meant to test the actual ODataResource

(function() {
	"use strict";

	var $odataresource;
	var $httpBackend;
	var $odata;
	var scope;

	describe('ODataResources Service', function() {
		beforeEach(module('ODataResources'));


		beforeEach(function() {
			inject(function(_$odataresource_, _$httpBackend_, _$odata_, $rootScope) {
				$odataresource = _$odataresource_;
				$httpBackend = _$httpBackend_;
				$odata = _$odata_;
				configureHttpBackend($httpBackend);
				scope = $rootScope;
			});
		});


		afterEach(function() {
			$httpBackend.verifyNoOutstandingRequest();
			$httpBackend.verifyNoOutstandingExpectation();
		});

		describe('Resource with param', function() {

			var User;
			beforeEach(function() {
				User = $odataresource('/user/:userId', {
					userId: '@id'
				});
			});


			it('should have a odata method that returns an OData provider', function() {
				var user = User.odata();
				expect(user instanceof $odata.Provider).toBeTruthy();
			});

			it('should return an array', function() {
				$httpBackend.expectGET('/user').respond(200, [1, 2]);
				var users = User.odata().query();
				expect(angular.isArray(users)).toBeTruthy();
			});


			it('should make an http call', function() {
				$httpBackend.expectGET('/user').respond(200, [1, 2]);
				User.odata().query();
				$httpBackend.flush();
				expect(1).toBe(1);
			});

			it('should set the data', function() {
				$httpBackend.expectGET('/user').respond(200, [1, 2]);
				var users = User.odata().query();
				$httpBackend.flush();
				expect(users.length).toBe(2);
			});

			it('should append odata query with a ?', function() {
				$httpBackend.expectGET("/user?$filter=Name eq 'Raphael'").respond(200, [1, 2]);
				User.odata().filter("Name", "Raphael").query();
				$httpBackend.flush();
				expect(1).toBe(1);
			});

			it('The results should be arrays', function() {
				$httpBackend.expectGET("/user?$filter=Name eq 'Raphael'").respond(200, [1, 2]);
				User.odata().filter("Name", "Raphael").query();
				$httpBackend.flush();
				expect(1).toBe(1);
			});


			it('The results should be Resources', function() {
				$httpBackend.expectGET("/user?$filter=Name eq 'Raphael'").respond(200, [{
					Name: "Raphael"
				}, {
					Name: "Anais"
				}]);
				var users = User.odata().filter("Name", "Raphael").query();
				$httpBackend.flush();
				expect(users[0].$save).toBeDefined();
			});


			it('filters should work with funcs', function() {
				$httpBackend.expectGET("/user?$filter=endswith(Name,'Raphael') eq true").respond(200, [1, 2]);
				User.odata()
					.filter(new $odata.Func("endswith", "Name", "Raphael"), true)
					.query();
				$httpBackend.flush();

				expect(1).toBe(1);
			});

			it('should work with complex queries', function() {
				$httpBackend.expectGET("/user?$filter=(Name eq 'Raphael') and (Age gt 20)&$orderby=Name desc&$top=20&$skip=10").respond(200, [1, 2]);
				User.odata()
					.filter("Name", "Raphael")
					.filter("Age", ">", 20)
					.skip(10)
					.take(20)
					.orderBy("Name", "desc")
					.query();
				$httpBackend.flush();

				expect(1).toBe(1);
			});


			it('should call the callback on success', function() {
				$httpBackend.expectGET("/user").respond(200, [1, 2]);

				var success = jasmine.createSpy('success');
				var error = jasmine.createSpy('error');

				User.odata()
					.query(success, error);

				$httpBackend.flush();

				expect(success).toHaveBeenCalled();
				expect(error).not.toHaveBeenCalled();

			});


			it('should query with expand', function() {
				$httpBackend.expectGET("/user?$expand=City/Country,Orders").respond(200, [1, 2]);
				User.odata()
					.expand("City", "Country")
					.expand("Orders")
					.query();

				$httpBackend.flush();

				expect(1).toBe(1);

			});

			it('should query with expand and filters', function() {
				$httpBackend.expectGET("/user?$filter=City eq 'France'&$expand=Orders").respond(200, [1, 2]);
				User.odata()
					.filter("City", "France")
					.expand("Orders")
					.query();

				$httpBackend.flush();

				expect(1).toBe(1);

			});


		});

		describe('Resource with customized url', function() {
			var User;
			beforeEach(function() {
				User = $odataresource(
					'/user/:userId', {
						userId: '@id'
					}, {
						odata: {
							method: 'POST',
							url: '/myCustomUrl'
						}
					}
				);
			});

			it('should call the right url', function() {
				$httpBackend.expectPOST("/myCustomUrl").respond(200);

				User.odata().query();
				$httpBackend.flush();
				expect(1).toBe(1);
			});
		});

		describe('get method', function() {
			it('should allow querying only one element', function() {
				var User = $odataresource('/user/:userId', {
					userId: '@id'
				});

				$httpBackend.expectGET("/user(2)").respond(200);
				var user = User.odata().get(2);
				expect(user).toBeDefined();
			});

			it('should return an object', function() {
				var User = $odataresource('/user/:userId', {
					userId: '@id'
				});

				$httpBackend.expectGET("/user(2)").respond(200);
				var user = User.odata().get(2);
				expect(angular.isArray(user)).toBe(false);
				expect(user).toBeDefined();
			});


			it('should work with multiple queries', function() {
				var User = $odataresource('/user/:userId', {
					userId: '@id'
				});

				$httpBackend.expectGET("/user(2)").respond(200);
				var user = User.odata().get(2);
				$httpBackend.expectGET("/user").respond(200);
				var users = User.odata().query();
				$httpBackend.flush();

				expect(angular.isArray(users)).toBeTruthy();
			});


			it('should throw if server returns an array', function() {
				var User = $odataresource('/user/:userId', {
					userId: '@id'
				});

				$httpBackend.expectGET("/user(2)").respond([]);
				var user = User.odata().get(2);
				expect(function() {
					$httpBackend.flush();
				}).toThrow();
				//Force ending the digest cycle
				scope.$$phase = undefined;
			});

			it('should call the callbacks on success', function() {
				var User = $odataresource('/user/:userId', {
					userId: '@id'
				});
				var success = jasmine.createSpy('success');
				var error = jasmine.createSpy('error');

				$httpBackend.expectGET("/user(2)").respond({});
				User.odata()
					.get(2, success, error);

				$httpBackend.flush();

				expect(success).toHaveBeenCalled();
				expect(error).not.toHaveBeenCalled();
			});

			it('should call the callbacks on error', function() {
				var User = $odataresource('/user/:userId', {
					userId: '@id'
				});
				var success = jasmine.createSpy('success');
				var error = jasmine.createSpy('error');

				$httpBackend.expectGET("/user(2)").respond(500);
				User.odata()
					.get(2, success, error);

				$httpBackend.flush();

				expect(error).toHaveBeenCalled();
				expect(success).not.toHaveBeenCalled();
			});


			it('should convert the element in a resource', function() {
				var User = $odataresource('/user/:userId', {
					userId: '@id'
				});

				$httpBackend.expectGET("/user(2)").respond({
					Name: "John"
				});
				var user = User.odata().get(2);
				$httpBackend.flush();
				expect(user.$save).toBeDefined();
			});

		});

		describe('OData v4', function() {
			var User;
			beforeEach(function() {});

			it('should still returns an array', function() {
				User = $odataresource('/user/', {});
				$httpBackend.expectGET("/user").respond(200, {
					"@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
					"value": [{
						name: 'Test',
						id: 1,
					}, {
						name: 'Foo',
						id: 2,
					}, {
						name: 'Bar',
						id: 3,
					}],
					'count': 10
				});
				var result = User.odata().query();
				$httpBackend.flush();
				expect(angular.isArray(result)).toBeTruthy();
			});

			it('should copy the properties to the array', function() {
				User = $odataresource('/user/', {});
				$httpBackend.expectGET("/user").respond(200, {
					"@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
					"value": [{
						name: 'Test',
						id: 1,
					}, {
						name: 'Foo',
						id: 2,
					}, {
						name: 'Bar',
						id: 3,
					}],
					'count': 10
				});
				var result = User.odata().query();
				$httpBackend.flush();
				console.log(result);
				expect(result.count).toBe(10);
			});

			it('should call the odata endpoint on $update', function() {
				User = $odataresource('/user', 'id');
				$httpBackend.expectGET("/user").respond(200, {
					"@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
					"value": [{
						name: 'Test',
						id: 1,
					}, {
						name: 'Foo',
						id: 2,
					}, {
						name: 'Bar',
						id: 3,
					}],
					'count': 10
				});
				var result = User.odata().query();
				$httpBackend.flush();

				$httpBackend.expectPUT("/user(1)").respond(200);
				result[0].$update();
				$httpBackend.flush();
				expect(result.count).toBe(10);
			});


			it('should work with key specified in options', function() {
				User = $odataresource('/user', {},{},{odatakey : 'id'});
				$httpBackend.expectGET("/user").respond(200, {
					"@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
					"value": [{
						name: 'Test',
						id: 1,
					}, {
						name: 'Foo',
						id: 2,
					}, {
						name: 'Bar',
						id: 3,
					}],
					'count': 10
				});
				var result = User.odata().query();
				$httpBackend.flush();

				$httpBackend.expectPUT("/user(1)").respond(200);
				result[0].$update();
				$httpBackend.flush();
				console.log(result);
				expect(result.count).toBe(10);
			});

			it('should call the odata endpoint on $update with trailing slashes', function() {
				User = $odataresource('/user/', 'id');
				$httpBackend.expectGET("/user").respond(200, {
					"@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
					"value": [{
						name: 'Test',
						id: 1,
					}, {
						name: 'Foo',
						id: 2,
					}, {
						name: 'Bar',
						id: 3,
					}],
					'count': 10
				});
				var result = User.odata().query();
				$httpBackend.flush();

				$httpBackend.expectPUT("/user(1)").respond(200);
				result[0].$update();
				$httpBackend.flush();

				expect(result.count).toBe(10);

			});

			it('should call the default endpoint on $save', function() {
				User = $odataresource('/user/', 'id');
				$httpBackend.expectGET("/user").respond(200, {
					"@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
					"value": [{
						name: 'Test',
						id: 1,
					}, {
						name: 'Foo',
						id: 2,
					}, {
						name: 'Bar',
						id: 3,
					}],
					'count': 10
				});
				var result = User.odata().query();
				$httpBackend.flush();

				$httpBackend.expectPOST("/user").respond(200);
				result[0].$save();
				$httpBackend.flush();

				expect(result.count).toBe(10);

			});


			it('should call the default endpoint on $update if no id is specified', function() {
				User = $odataresource('/user/');
				$httpBackend.expectGET("/user").respond(200, {
					"@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
					"value": [{
						name: 'Test',
						id: 1,
					}, {
						name: 'Foo',
						id: 2,
					}, {
						name: 'Bar',
						id: 3,
					}],
					'count': 10
				});
				var result = User.odata().query();
				$httpBackend.flush();

				$httpBackend.expectPUT("/user").respond(200);
				result[0].$update();
				$httpBackend.flush();

				expect(result.count).toBe(10);

			});
		});

	});

})();