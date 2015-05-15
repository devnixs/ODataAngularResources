//This file is meant to test the actual ODataResource

(function() {
	"use strict";

	var $odataresource;
	var $httpBackend;
	var $odata;

	describe('ODataResources Service', function() {
		beforeEach(module('ODataResources'));


		beforeEach(function() {
			inject(function(_$odataresource_, _$httpBackend_, _$odata_) {
				$odataresource = _$odataresource_;
				$httpBackend = _$httpBackend_;
				$odata = _$odata_;
				configureHttpBackend($httpBackend);
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
				expect(users.length).toBeDefined();
			});


			it('should make an http call', function() {
				$httpBackend.expectGET('/user').respond(200, [1, 2]);
				var users = User.odata().query();
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
				var users = User.odata().filter("Name", "Raphael").query();
				$httpBackend.flush();
				expect(1).toBe(1);
			});

			it('The results should be arrays', function() {
				$httpBackend.expectGET("/user?$filter=Name eq 'Raphael'").respond(200, [1, 2]);
				var users = User.odata().filter("Name", "Raphael").query();
				$httpBackend.flush();
				expect(1).toBe(1);
			});


			it('The results should be Resources', function() {
				$httpBackend.expectGET("/user?$filter=Name eq 'Raphael'").respond(200, [{Name:"Raphael"}, {Name:"Anais"}]);
				var users = User.odata().filter("Name", "Raphael").query();
				$httpBackend.flush();
				expect(users[0].$save).toBeDefined();
			});


			it('filters should work with funcs', function() {
				$httpBackend.expectGET("/user?$filter=endswith(Name,'Raphael') eq true").respond(200, [1, 2]);
				var users = User.odata()
				.filter(new $odata.Func("endswith","Name","Raphael"), true)
				.query();
				$httpBackend.flush();

				expect(1).toBe(1);
			});

			it('should work with complex queries', function() {
				$httpBackend.expectGET("/user?$filter=(Name eq 'Raphael') and (Age gt 20)&$orderby=Name desc&$top=20&$skip=10").respond(200, [1, 2]);
				var users = User.odata()
				.filter("Name", "Raphael")
				.filter("Age",">",20)
				.skip(10)
				.take(20)
				.orderBy("Name","desc")
				.query();
				$httpBackend.flush();

				expect(1).toBe(1);
			});



			it('should call the callback on success', function() {
				$httpBackend.expectGET("/user").respond(200, [1, 2]);

				var success = jasmine.createSpy('success');
				var error = jasmine.createSpy('error');

				var users = User.odata()
				.query(success,error);

				$httpBackend.flush();

				expect(success).toHaveBeenCalled();
				expect(error).not.toHaveBeenCalled();
				
			});


			it('should call the callback on error', function() {
				$httpBackend.expectGET("/user").respond(500);

				var success = jasmine.createSpy('success');
				var error = jasmine.createSpy('error');

				var users = User.odata()
				.query(success,error);
				
				$httpBackend.flush();

				expect(error).toHaveBeenCalled();
				expect(success).not.toHaveBeenCalled();
				
			});

		});



	});

})();