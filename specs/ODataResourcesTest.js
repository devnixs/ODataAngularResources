/* global it */
/* global desc/ibe */
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
    var _config;
    describe('ODataResources Service', function () {
        beforeEach(module('ODataResources'));
        beforeEach(function () {
            inject(function (_$odataresource_, _$httpBackend_, _$odata_, $rootScope) {
                angular.module('ODataResources').config(function ($httpProvider) {
                    $httpProvider.interceptors.push(function () {
                        return {
                            'request': function (config) {
                                _config = config;
                                return config;
                            },
                        };
                    });
                });
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
                expect(user instanceof $odata.Provider)
                    .toBeTruthy();
            });

            it('should return an array', function() {
                $httpBackend.expectGET('/user')
                    .respond(200, [1, 2]);
                var users = User.odata()
                    .query();
                expect(angular.isArray(users))
                    .toBeTruthy();
            });

            it('should make an http call', function() {
                $httpBackend.expectGET('/user')
                    .respond(200, [1, 2]);
                User.odata()
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('should set the data', function() {
                $httpBackend.expectGET('/user')
                    .respond(200, [1, 2]);
                var users = User.odata()
                    .query();
                $httpBackend.flush();
                expect(users.length)
                    .toBe(2);
            });

            it('should append odata query with a ?', function() {
                $httpBackend.expectGET("/user?$filter=Name eq 'Raphael'")
                    .respond(200, [1, 2]);
                User.odata()
                    .filter("Name", "Raphael")
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('The results should be arrays', function() {
                $httpBackend.expectGET("/user?$filter=Name eq 'Raphael'")
                    .respond(200, [1, 2]);
                User.odata()
                    .filter("Name", "Raphael")
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('The results should be Resources', function() {
                $httpBackend.expectGET("/user?$filter=Name eq 'Raphael'")
                    .respond(200, [{
                        Name: "Raphael"
                    }, {
                        Name: "Anais"
                    }]);
                var users = User.odata()
                    .filter("Name", "Raphael")
                    .query();
                $httpBackend.flush();
                expect(users[0].$save)
                    .toBeDefined();
            });

            it('filters should work with funcs', function() {
                $httpBackend.expectGET("/user?$filter=endswith(Name,'Raphael') eq true")
                    .respond(200, [1, 2]);
                User.odata()
                    .filter(new $odata.Func("endswith", "Name", "Raphael"), true)
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('filters should work with custom type', function() {
                $httpBackend.expectGET("/user?$filter=Gender eq Enum.Namespace.Gender'Female'")
                    .respond(200, [1, 2]);
                User.odata()
                    .filter(new $odata.Predicate("Gender", new $odata.Value("Female", "Enum.Namespace.Gender", true)))
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('should work with complex queries', function() {
                $httpBackend.expectGET("/user?$filter=(Name eq 'Raphael') and (Age gt 20)&$orderby=Name desc&$top=20&$skip=10")
                    .respond(200, [1, 2]);
                User.odata()
                    .filter("Name", "Raphael")
                    .filter("Age", ">", 20)
                    .skip(10)
                    .take(20)
                    .orderBy("Name", "desc")
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('should call the callback on success', function() {
                $httpBackend.expectGET("/user")
                    .respond(200, [1, 2]);
                var success = jasmine.createSpy('success');
                var error = jasmine.createSpy('error');
                User.odata()
                    .query(success, error);
                $httpBackend.flush();
                expect(success)
                    .toHaveBeenCalled();
                expect(error)
                    .not.toHaveBeenCalled();
            });

            it('should query with count', function() {
                $httpBackend.expectGET("/user/$count")
                    .respond(200, 15);
                User.odata()
                    .count();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('should query with count and filters', function() {
                $httpBackend.expectGET("/user/$count/?$filter=name eq 'bob'")
                    .respond(200, 25);
                var result = User.odata()
                    .filter('name', 'bob')
                    .count();
                $httpBackend.flush();
                expect(result.result)
                    .toBe(25);
            });

            it('should query with count and filters with strings', function() {
                $httpBackend.expectGET("/user/$count/?$filter=name eq 'bob'")
                    .respond(200, '85');
                var result = User.odata()
                    .filter('name', 'bob')
                    .count();
                $httpBackend.flush();
                expect(result.result)
                    .toBe(85);
            });

            it('should query with inline count', function() {
                $httpBackend.expectGET("/user?$inlinecount=allpages")
                    .respond(200, {
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
                User.odata()
                    .withInlineCount()
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('should query with inline count', function() {
                $httpBackend.expectGET("/user?$filter=Name eq 'Foo'&$inlinecount=allpages")
                    .respond(200, {
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
                User.odata()
                    .filter('Name', 'Foo')
                    .withInlineCount()
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('should not have a result property when querying normally', function() {
                $httpBackend.expectGET("/user(1)")
                    .respond(200, {
                        "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                        "value": {
                            name: 'Test',
                            id: 1,
                        }
                    });
                var user = User.odata()
                    .get(1);
                $httpBackend.flush();
                expect(user.result)
                    .not.toBeDefined();
            });

            it('should query with expand', function() {
                $httpBackend.expectGET("/user?$expand=City/Country,Orders")
                    .respond(200, [1, 2]);
                User.odata()
                    .expand("City", "Country")
                    .expand("Orders")
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('should query with expand and filters', function() {
                $httpBackend.expectGET("/user?$filter=City eq 'France'&$expand=Orders")
                    .respond(200, [1, 2]);
                User.odata()
                    .filter("City", "France")
                    .expand("Orders")
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });
            describe('Single method', function() {

                it('should execute the query but return a single element', function() {
                    $httpBackend.expectGET("/user?$filter=City eq 'France'&$expand=Orders")
                        .respond(200, [1, 2]);
                    var result = User.odata()
                        .filter("City", "France")
                        .expand("Orders")
                        .single();
                    $httpBackend.flush();
                    expect(angular.isArray(result))
                        .not.toBeTruthy();
                });

                it('should throw if answers 0 elements', function() {
                    $httpBackend.expectGET("/user?$filter=City eq 'France'&$expand=Orders")
                        .respond(200, []);
                    expect(function() {
                            var result = User.odata()
                                .filter("City", "France")
                                .expand("Orders")
                                .single();
                            $httpBackend.flush();
                        })
                        .toThrow();
                    //Force ending the digest cycle
                    scope.$$phase = undefined;
                    expect(1)
                        .toBe(1);
                });

                it('should take only the first element', function() {
                    $httpBackend.expectGET("/user?$filter=City eq 'France'&$expand=Orders")
                        .respond(200, [{
                            name: 'Bob'
                        }, {
                            name: 'Jimmy'
                        }]);
                    var result = User.odata()
                        .filter("City", "France")
                        .expand("Orders")
                        .single();
                    $httpBackend.flush();
                    expect(result.name)
                        .toBe('Bob');
                });

                it('should work if return an object', function() {
                    $httpBackend.expectGET("/user?$filter=City eq 'France'&$expand=Orders")
                        .respond(200, {
                            name: 'Bob'
                        });
                    var result = User.odata()
                        .filter("City", "France")
                        .expand("Orders")
                        .single();
                    $httpBackend.flush();
                    expect(result.name)
                        .toBe('Bob');
                });
            });
        });
        describe('Resource with param', function() {
            var User;
            beforeEach(function() {
                User = $odataresource('/user', {});
            });



            it('should not append a ?', function() {
                $httpBackend.expectGET("/user?$filter=Name eq 'Raphael'&foo=bar")
                    .respond(200, [1, 2]);
                User.odata()
                    .filter("Name", "Raphael")
                    .transformUrl(function(url){
                        return url+'&foo=bar';
                    })
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

        });
        describe('Resource with customized url', function() {
            var User;
            beforeEach(function() {
                User = $odataresource('/user/:userId', {
                    userId: '@id'
                }, {
                    odata: {
                        method: 'POST',
                        url: '/myCustomUrl'
                    }
                });
            });

            it('should call the right url', function() {
                $httpBackend.expectPOST("/myCustomUrl")
                    .respond(200);
                User.odata()
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });
        });
        describe('Select', function() {
            var User;
            beforeEach(function() {
                User = $odataresource('/user/:userId', {
                    userId: '@id'
                }, {
                    odata: {
                        method: 'POST',
                        url: '/myCustomUrl'
                    }
                });
            });

            it('should call the right url', function() {
                $httpBackend.expectPOST("/myCustomUrl?$filter=Name eq 'Bob'&$select=Name")
                    .respond(200);
                User.odata()
                    .filter('Name', 'Bob')
                    .select('Name')
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });
        });
        describe('get method', function() {

            it('should allow querying only one element', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user(2)")
                    .respond(200);
                var user = User.odata()
                    .get(2);
                expect(user)
                    .toBeDefined();
            });

            it('should allow querying only one element with expand', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user(2)?$expand=Orders")
                    .respond(200);
                var user = User.odata()
                    .expand('Orders')
                    .get(2);
                expect(user)
                    .toBeDefined();
            });

            it('should return an object', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user(2)")
                    .respond(200);
                var user = User.odata()
                    .get(2);
                expect(angular.isArray(user))
                    .toBe(false);
                expect(user)
                    .toBeDefined();
            });

            it('should work with multiple queries', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user(2)")
                    .respond(200);
                var user = User.odata()
                    .get(2);
                $httpBackend.expectGET("/user")
                    .respond(200);
                var users = User.odata()
                    .query();
                $httpBackend.flush();
                expect(angular.isArray(users))
                    .toBeTruthy();
            });

            it('should throw if server returns an array', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user(2)")
                    .respond([]);
                var user = User.odata()
                    .get(2);
                expect(function() {
                        $httpBackend.flush();
                    })
                    .toThrow();
                //Force ending the digest cycle
                scope.$$phase = undefined;
            });

            it('should call the callbacks on success', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                var success = jasmine.createSpy('success');
                var error = jasmine.createSpy('error');
                $httpBackend.expectGET("/user(2)")
                    .respond({});
                User.odata()
                    .get(2, success, error);
                $httpBackend.flush();
                expect(success)
                    .toHaveBeenCalled();
                expect(error)
                    .not.toHaveBeenCalled();
            });

            it('should call the callbacks on error', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                var success = jasmine.createSpy('success');
                var error = jasmine.createSpy('error');
                $httpBackend.expectGET("/user(2)")
                    .respond(500);
                User.odata()
                    .get(2, success, error);
                $httpBackend.flush();
                expect(error)
                    .toHaveBeenCalled();
                expect(success)
                    .not.toHaveBeenCalled();
            });

            it('should convert the element in a resource', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user(2)")
                    .respond({
                        Name: "John"
                    });
                var user = User.odata()
                    .get(2);
                $httpBackend.flush();
                expect(user.$save)
                    .toBeDefined();
            });
			
        });
        describe('Resources queried with select', function() {
            it('should work with one selected property', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user?$select=name")
                    .respond(200, [{
                        userId: 5,
                        name: 'bob'
                    }]);
                var users = User.odata()
                    .select('name')
                    .query();
                expect(angular.isArray(users))
                    .toBe(true);
                $httpBackend.flush();
            });
            it('should work with two selected property', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user?$select=userId,name")
                    .respond(200, [{
                        userId: 5,
                        name: 'bob'
                    }]);
                var users = User.odata()
                    .select('name', 'userId')
                    .query();
                expect(angular.isArray(users))
                    .toBe(true);
                $httpBackend.flush();
            });
            it('should work with two selected property in an array', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user?$select=userId,name")
                    .respond(200, [{
                        userId: 5,
                        name: 'bob'
                    }]);
                var users = User.odata()
                    .select(['name', 'userId'])
                    .query();
                expect(angular.isArray(users))
                    .toBe(true);
                $httpBackend.flush();
            });
            it('should work with after multiple calls', function() {
                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                });
                $httpBackend.expectGET("/user?$select=userId,name")
                    .respond(200, [{
                        userId: 5,
                        name: 'bob'
                    }]);
                var users = User.odata()
                    .select('userId')
                    .select('name')
                    .query();
                expect(angular.isArray(users))
                    .toBe(true);
                $httpBackend.flush();
            });
        });
        describe('Method call options', function() {
            it('should work with custom urls', function () {
                var successInterceptor = jasmine.createSpy('sucessInterceptor');
                var ProductRating = $odataresource('/Products(:productId)/ProductService.Rate', { productId: "@ProductID" }, { update: { method: 'PUT', interceptor: { response: successInterceptor } } });
                $httpBackend.expectPUT("/Products(5)/ProductService.Rate")
                    .respond(204, undefined, undefined, 'No Content');
                var productRating = new ProductRating();
                productRating.ProductID = 5;
                productRating.Rating = 10;
                var response = productRating.$update();
                $httpBackend.flush();
                console.log(successInterceptor.calls.mostRecent());
                expect(successInterceptor).toHaveBeenCalled();
                expect(successInterceptor.calls.mostRecent().args[0].status).toBe(204);
                expect(successInterceptor.calls.mostRecent().args[0].statusText).toBe('No Content');
            });
            it('should work with custom actions', function () {
                var successInterceptor = jasmine.createSpy('sucessInterceptor');
                var Products = $odataresource('/Products', {}, {
                    rate: {
                        method: 'PUT',
                        url: '/Products(:productId)/ProductService.Rate',
                        params: {
                            productId: '@ProductID',
                        },
                        interceptor: {
                            response: successInterceptor
                        },
                    },
                }, { odatakey: 'ProductID' });
                $httpBackend.expectGET('/Products(5)')
                    .respond(200, { ProductID: 5, Rating: 9 });
                var product = Products.odata().get(5);
                $httpBackend.flush();
                expect(product.ProductID).toBe(5);
                expect(product.Rating).toBe(9);
                $httpBackend.expectPUT("/Products(5)/ProductService.Rate")
                    .respond(204, undefined, undefined, 'No Content');
                product.Rating = 10;
                product.$rate();
                $httpBackend.flush();
                expect(successInterceptor).toHaveBeenCalled();
                expect(successInterceptor.calls.mostRecent().args[0].status).toBe(204);
                expect(successInterceptor.calls.mostRecent().args[0].statusText).toBe('No Content');
            });
        });
        describe('OData v4 not explicitly specified', function() {
            var User;
            beforeEach(function() {});

            it('should still returns an array', function() {
                User = $odataresource('/user/', {});
                $httpBackend.expectGET("/user")
                    .respond(200, {
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
                var result = User.odata()
                    .query();
                $httpBackend.flush();
                expect(angular.isArray(result))
                    .toBeTruthy();
            });

            it('should copy the properties to the array', function() {
                User = $odataresource('/user/', {});
                $httpBackend.expectGET("/user")
                    .respond(200, {
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
                var result = User.odata()
                    .query();
                $httpBackend.flush();
                console.log(result);
                expect(result.count)
                    .toBe(10);
            });

            it('should call the odata endpoint on $update', function() {
                User = $odataresource('/user', 'id');
                $httpBackend.expectGET("/user")
                    .respond(200, {
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
                var result = User.odata()
                    .query();
                $httpBackend.flush();
                $httpBackend.expectPUT("/user(1)")
                    .respond(200);
                result[0].$update();
                $httpBackend.flush();
                expect(result.count)
                    .toBe(10);
            });

            it('should work with key specified in options', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id'
                });
                $httpBackend.expectGET("/user")
                    .respond(200, {
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
                var result = User.odata()
                    .query();
                $httpBackend.flush();
                $httpBackend.expectPUT("/user(1)")
                    .respond(200);
                result[0].$update();
                $httpBackend.flush();
                console.log(result);
                expect(result.count)
                    .toBe(10);
            });

            it('should work with key\'s specified as comma seperated list in options', function () {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id,id2'
                });
                $httpBackend.expectGET("/user")
                    .respond(200, {
                        "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                        "value": [{
                            name: 'Test',
                            id: 1,
                            id2: 1,
                        },{
                            name: 'Test2',
                            id: 1,
                            id2: 2,
                        }, {
                            name: 'Foo',
                            id: 2,
                            id2: 1,
                        }, {
                            name: 'Foo2',
                            id: 2,
                            id2: 2,
                        }, {
                            name: 'Bar',
                            id: 3,
                            id2: 1,
                        }, {
                            name: 'Bar2',
                            id: 3,
                            id2: 2,
                        }],
                        'count': 10
                    });
                var result = User.odata()
                    .query();
                $httpBackend.flush();
                $httpBackend.expectPUT("/user(id=1,id2=1)")
                    .respond(200);
                result[0].$update();
                $httpBackend.flush();
                console.log(result);
                expect(result.count)
                    .toBe(10);
            });

            it('should delete', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id'
                });
                $httpBackend.expectGET("/user")
                    .respond(200, {
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
                var result = User.odata()
                    .query();
                $httpBackend.flush();
                $httpBackend.expectDELETE("/user(1)")
                    .respond(200);
                result[0].$delete();
                $httpBackend.flush();
                console.log(result);
                expect(result.count)
                    .toBe(10);
            });

            it('should post', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id'
                });
                var user = new User();

                $httpBackend.expectPOST("/user")
                    .respond(200);

                console.log(user);
                user.$save();
                $httpBackend.flush();
                expect(10)
                    .toBe(10);
            });

            it('should call the odata endpoint on $update with trailing slashes', function() {
                User = $odataresource('/user/', 'id');
                $httpBackend.expectGET("/user")
                    .respond(200, {
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
                var result = User.odata()
                    .query();
                $httpBackend.flush();
                $httpBackend.expectPUT("/user(1)")
                    .respond(200);
                result[0].$update();
                $httpBackend.flush();
                expect(result.count)
                    .toBe(10);
            });

            it('should call the default endpoint on $save', function() {
                User = $odataresource('/user/', 'id');
                $httpBackend.expectGET("/user")
                    .respond(200, {
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
                var result = User.odata()
                    .query();
                $httpBackend.flush();
                $httpBackend.expectPOST("/user")
                    .respond(200);
                result[0].$save();
                $httpBackend.flush();
                expect(result.count)
                    .toBe(10);
            });

            it('should call the default endpoint on $update if no id is specified', function() {
                User = $odataresource('/user/');
                $httpBackend.expectGET("/user")
                    .respond(200, {
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
                var result = User.odata()
                    .query();
                $httpBackend.flush();
                $httpBackend.expectPUT("/user")
                    .respond(200);
                result[0].$update();
                $httpBackend.flush();
                expect(result.count)
                    .toBe(10);
            });
        });
        describe('OData v4 explicitly specified', function() {
            var User;
            beforeEach(function() {});

            it('with query and 1 nested element', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id',
                    isodatav4: true
                });
                $httpBackend.expectGET("/user?$expand=roles($expand=role)")
                    .respond(200, {
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
                var result = User.odata()
                    .expand("roles", "role")
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('with query and 2 nested element', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id',
                    isodatav4: true
                });
                $httpBackend.expectGET("/user?$expand=roles($expand=role($expand=users))")
                    .respond(200, {
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
                var result = User.odata()
                    .expand("roles", "role", "users")
                    .query();
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('with get and 1 nested element', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id',
                    isodatav4: true
                });
                $httpBackend.expectGET("/user(1)?$expand=roles($expand=role)")
                    .respond(200, {
                        "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                        "value": {
                            name: 'Test',
                            id: 1,
                        },
                        'count': 10
                    });
                var result = User.odata()
                    .expand("roles", "role")
                    .get(1);
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('with get and 2 nested element', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id',
                    isodatav4: true
                });
                $httpBackend.expectGET("/user(1)?$expand=roles($expand=role($expand=users))")
                    .respond(200, {
                        "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                        "value": {
                            name: 'Test',
                            id: 1,
                        },
                        'count': 10
                    });
                var result = User.odata()
                    .expand("roles", "role", "users")
                    .get(1);
                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('should query with odata v4 datetime', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id',
                    isodatav4: true
                });
                $httpBackend.expectGET("/user(1)?$filter=date eq 2015-07-28T10:23:00Z")
                    .respond(200, {
                        "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                        "value": {
                            name: 'Test',
                            id: 1,
                        },
                        'count': 10
                    });
                var result = User.odata()
                    .filter("date", new $odata.Value(new Date("07/28/2015 10:23")))
                    .get(1);

                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('should query with odata v4 inlinecount', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id',
                    isodatav4: true
                });
                $httpBackend.expectGET("/user?$count=true")
                    .respond(200, {
                        "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                        "@odata.count": 2,
                        "value": [{
                            name: 'Test',
                            id: 1,
                        }]
                    });
                var data = User.odata()
                    .withInlineCount()
                    .query();

                $httpBackend.flush();
                expect(data.count)
                    .toBe(2);
            });

            it('should query with nested odata v4 datetime', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id',
                    isodatav4: true
                });
                $httpBackend.expectGET("/user(1)?$filter=(date eq 2015-07-28T10:23:00Z) and (date eq 2016-07-28T10:23:00Z)")
                    .respond(200, {
                        "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                        "value": {
                            name: 'Test',
                            id: 1,
                        },
                        'count': 10
                    });
                var result = User.odata()
                    .filter("date", new $odata.Value(new Date("07/28/2015 10:23")))
                    .filter("date", new $odata.Value(new Date("07/28/2016 10:23")))
                    .get(1);

                $httpBackend.flush();
                expect(1)
                    .toBe(1);
            });

            it('shouldn\'t fail if the response contains a value property', function() {
                User = $odataresource('/user', {}, {}, {
                    odatakey: 'id',
                    isodatav4: true
                });
                $httpBackend.expectGET("/user(1)")
                    .respond(200, {
                        '@odata.context': 'http://host/service/$metadata#Collection(Edm.String)',
                        'value': 'test',
                        'someOtherData': 'foobar',
                    });

                var result = User.odata()
                    .get(1);

                $httpBackend.flush();
                expect(result.value)
                    .toBe('test');
            });

            it('Should work with null values', function() {

                var User = $odataresource('/user/:userId', {
                    userId: '@id'
                }, {
                    odata: {
                        method: 'POST',
                        url: '/myCustomUrl'
                    }
                });

                $httpBackend.expectPOST("/myCustomUrl?$filter=Name eq null")
                    .respond(200);

                User.odata()
                    .filter('Name', null)
                    .query();
                $httpBackend.flush();
                expect(1).toBe(1);
            });
        });
        describe('OData $refresh feature', function() {
            var User;
            beforeEach(function () { });
            // should run re() on the odata method automatically if options.persistence
            it('shouldn\'t apply $refresh to initial odataresource object', function() {
                User = $odataresource('/user', {}, {}, { persistence: true });
                expect(User.$refresh).not.toBeDefined();
            });
            it('should add limited persisted $refresh to individual odataresource objects of query response', function() {
                User = $odataresource('/user', {}, {}, { persistence: true });
                $httpBackend.expectGET('/user?$top=10&$select=name,id').respond(200, {
                    "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                    "value": [
                        {
                            name: 'Test',
                            id: 1,
                        }, {
                            name: 'Foo',
                            id: 2,
                        }, {
                            name: 'Bar',
                            id: 3,
                        }
                    ],
                    'count': 3
                });
                var result = User.odata().select('name').select('id').take(10).query(function (response) {
                    expect(result.$refresh).toBeDefined();
                    expect(result[0].$refresh).toBeDefined();
                    expect(result.$refresh.$$persistence).not.toBe(result[0].$refresh.$$persistence);
                    expect(result[0].$odata().execute()).toBe('$select=name,id');
                });
                $httpBackend.flush();
            });
            it('should add full persisted $refresh to non get query response', function () {
                User = $odataresource('/user', {}, {}, {persistence: true });
                $httpBackend.expectGET('/user?$top=10&$select=name,id').respond(200, {
                    "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                    "value": [
                        {
                            name: 'Test',
                            id: 1,
                        }, {
                            name: 'Foo',
                            id: 2,
                        }, {
                            name: 'Bar',
                            id: 3,
                        }
                    ],
                    'count': 3
                });
                var result = User.odata().select('name').select('id').take(10).query(function(response) {
                    expect(result.$refresh).toBeDefined();
                    expect(result.$refresh.$$persistence.takeAmount).toBe(10);
                });
                $httpBackend.flush();
            });
            it('should return individual item with individual item instance $refresh', function() {
                User = $odataresource('/user', {}, {}, { isodatav4: true, odatakey: 'id', persistence: true });
                $httpBackend.expectGET('/user?$top=10&$select=name,id').respond(200, {
                    "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                    "value": [
                        {
                            name: 'Test',
                            id: 1,
                        }, {
                            name: 'Foo',
                            id: 2,
                        }, {
                            name: 'Bar',
                            id: 3,
                        }
                    ],
                    'count': 3
                });
                
                var result = User.odata().select('name').select('id').take(10).query(function(response) {
                    expect(result[0].$refresh).toBeDefined();
                    $httpBackend.expectGET('/user(1)?$select=name,id').respond(200, {
                        name: 'Test',
                        id: 1,
                    });
                    result[0].$refresh(function(response2) {
                        expect(response2.id).toBe(1);
                        expect(response2.$refresh).toBeDefined();
                    });
                });

                $httpBackend.flush();
            });
            it('should return an array when array instance $refresh', function() {
                User = $odataresource('/user', {}, {}, { isodatav4: true, odatakey: 'id', persistence: true });
                $httpBackend.expectGET('/user?$top=3&$select=name,id').respond(200, {
                    "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                    "value": [
                        {
                            name: 'Test',
                            id: 1,
                        }, {
                            name: 'Foo',
                            id: 2,
                        }, {
                            name: 'Bar',
                            id: 3,
                        }
                    ],
                    'count': 3
                });
                
                var result = User.odata().select('name').select('id').take(3).query(function(response) {
                    expect(result.$refresh).toBeDefined();
                    $httpBackend.expectGET('/user?$top=3&$select=name,id').respond(200, {
                        "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                        "value": [
                            {
                                name: 'Test',
                                id: 1,
                            }, {
                                name: 'Foo',
                                id: 2,
                            }, {
                                name: 'Bar',
                                id: 3,
                            }
                        ],
                        'count': 3
                    });
                    result.$refresh(function(response2) {
                        expect(response2.count).toBe(3);
                        expect(response2.$refresh).toBeDefined();
                    });
                });

                $httpBackend.flush();
            });
            it('should return a single response when single instance $refresh', function() {
                User = $odataresource('/user', {}, {}, { isodatav4: true, odatakey: 'id', persistence: true });
                $httpBackend.expectGET('/user?$top=3&$select=name,id').respond(200, {
                    "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                    "value": [
                        {
                            name: 'Test',
                            id: 1,
                        }, {
                            name: 'Foo',
                            id: 2,
                        }, {
                            name: 'Bar',
                            id: 3,
                        }
                    ],
                    'count': 3
                });

                var result = User.odata().select('name').select('id').take(3).single(function(response) {
                    expect(result.$refresh).toBeDefined();
                    $httpBackend.expectGET('/user?$top=3&$select=name,id').respond(200, {
                        "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
                        "value": [
                            {
                                name: 'Test',
                                id: 1,
                            }, {
                                name: 'Foo',
                                id: 2,
                            }, {
                                name: 'Bar',
                                id: 3,
                            }
                        ],
                        'count': 3
                    });
                    result.$refresh(function(response2) {
                        expect(response2.id).toBe(1);
                        expect(response2.$refresh).toBeDefined();
                    });
                });

                $httpBackend.flush();
            });
            it('should return an new count on a count instance $refresh', function() {
                User = $odataresource('/user', {}, {}, { isodatav4: true, odatakey: 'id', persistence: true });
                $httpBackend.expectGET("/user/$count/?$top=3&$select=name,id").respond(200, 15);
                
                var result = User.odata().select('name').select('id').take(3).count(function(response) {
                    expect(result.$refresh).toBeDefined();
                    $httpBackend.expectGET("/user/$count/?$top=3&$select=name,id").respond(200, 15);
                    result.$refresh(function(response2) {
                        expect(response2.result).toBe(15);
                        expect(response2.$refresh0.toBeDefined());
                    });
                });

                $httpBackend.flush();
            });
        });
        describe('HttpConfig options', function () {
            var User;
            beforeEach(function() {});
            it('should have noLoadingBar property when option set.', function () {
                $httpBackend.expectGET("/user").respond(200);
                User = $odataresource("/user", {}, {}, { ignoreLoadingBar: true });
                User.odata().query();
                $httpBackend.flush();
                expect(_config.ignoreLoadingBar).toBeDefined();
                expect(_config.ignoreLoadingBar).toBe(true);
            });
            it('should not have noLoadingBar property when option not set.', function () {
                $httpBackend.expectGET("/user").respond(200);
                User = $odataresource("/user");
                User.odata().query();
                $httpBackend.flush();
                expect(_config.ignoreLoadingBar).not.toBeDefined();
            });
        });
        describe('Configuration and Options', function() {
            var User, Metadata;
            beforeEach(function () { });
            it('should allow post initialization updates', function() {
                $httpBackend.whenGET('/user$metadata').respond(200, '<metadata>test meteadata<metadata>');
                $httpBackend.whenGET('/user').respond(200, [{ UserId: 5 }]);
                Metadata = $odataresource('/user$metadata', {}, {
                    get: {
                        transformResponse: function(data) {
                            return data.replace('<metadata>', '');
                        },
                    },
                }, {});
                User = $odataresource('/user', {}, {}, { isodatav4: true });
                var user = User.odata().query();
                $httpBackend.flush();
                expect(user[0].UserId).toBe(5);
                $httpBackend.expectPUT('/user').respond(500, undefined, undefined, 'Internal Server Error');
                user[0].$update();
                $httpBackend.flush();
                var metadata = Metadata.odata().single(function (response) {
                    expect(User.store.updateConfig(user)).toBe(false);
                    User.store.updateConfig(user, '/user', {}, {}, { odatakey: 'UserId' });
                });
                $httpBackend.flush();
                $httpBackend.expectPUT('/user(6)').respond(204, undefined, undefined, 'No Content');
                user[0].UserId = 6;
                user[0].$update();
                $httpBackend.flush();
            });
        });
    });
})();
