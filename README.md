[![Build Status](https://travis-ci.org/devnixs/ODataAngularResources.svg?branch=master)](https://travis-ci.org/devnixs/ODataAngularResources)
[![Coverage Status](https://coveralls.io/repos/devnixs/ODataAngularResources/badge.svg?branch=master&15)](https://coveralls.io/r/devnixs/ODataAngularResources?branch=master)

# ODataAngularResources

ODataAngularResources is a fork of Angular's $resource that allows to make OData queries in a fluent way.
It does everything Angular Resources does but add some features:

  - Fluent API
  - Generate proper OData queries without worrying about escaping the right characters
  - Allows filtering, skipping, ordering, expanding, and selecting only N elements (with top)
  - Able to generate complex queries with OR, AND and method calls

##How to install

1. include the file **build/odataresources.js** into your project

2. Be sure to register the module "ODataResources" in your module definition : 
```javascript
var myModule = angular.module('myModule',['ODataResources']);
```
3. Then replace your dependency to "$resource" by "$odataresource"
```javascript
myModule.controller('MyController', ['$scope','$odataresource',function($scope,$odataresource){}]);
```

##How to use

###Simple query
* Call the odata() method on your resource.
```javascript
var User = $odataresource('/user/:userId', {userId:'@id'});
var myUsers =   User.odata()
                    .filter("Name","John")
                    .query(); 
//Queries /user?$filter=Name eq 'John'
```
* The first parameter of the filter method is assumed to be the property and the second to be the value. But that behavior can be overriden by passing special parameters. See advanced queries for more informations.

* Returned objects from the query() method are regular Resource object which can be used for saving, updating etc...
```javascript
myUsers[0].$save();
```

* Like regular Resource requests you can pass callback that will be called on success and on error
```javascript
var myUsers =   User.odata()
                    .query(function(){
                        console.log("Everything went ok!")
                    },function(){
                        console.log("Oops, something wrong happened!")
                    }); 
```

### Retrieving a single element
* Simply call the get method with the entity key
```javascript
var userId = 10;
var myUsers =   User.odata().get(userId);
//Queries /user(10)
```
* You can also provide callbacks
```javascript
var userId = 10;
var myUsers =   User.odata().get(userId,
                          function(){
                            console.log("Everything went ok!")
                        },function(){
                            console.log("Oops, something wrong happened!")
                        });
```

###Query with top, orderBy and skip
```javascript
var User = $odataresource('/user/:userId', {userId:'@id'});
var myUsers =   User.odata()
    				.filter("Name", "John")
    				.filter("Age",">",20)
    				.skip(10)
    				.take(20)
    				.orderBy("Name","desc")
    				.query();
                    
//Queries /user?$filter=(Name eq 'John') and (Age gt 20)&$orderby=Name desc&$top=20&$skip=10
```
- Multiple chained filters are executed with **and** between.
- orderBy assumes the order to be asc if the second parameter is not specified.

###Including related models (expanding)
* You can easily include related models by calling the expand method
```javascript
var User = $odataresource('/user/:userId', {userId:'@id'});
var myUsers =   User.odata()
                    .expand("City")
                    .query();
                    
//Queries /user?$expand=City
```
* You can also expand nested related models like the Country of the City of the User
```javascript
var User = $odataresource('/user/:userId', {userId:'@id'});
var myUsers =   User.odata()
                    .expand("City","Country")
                    .query();
                    
//Queries /user?$expand=City/Country
```

* You can also include multiple related models into your query

```javascript
var User = $odataresource('/user/:userId', {userId:'@id'});
var myUsers =   User.odata()
                    .expand("City")
                    .expand("Orders")
                    .query();
                    
//Queries /user?$expand=City,Orders
```

###Specifying a custom url and method
* Want a custom url for your odata queries? easy! It works just like angular resources:
```javascript
User = $odataresource('/user/:userId',
                     { userId: '@id'},
                	 {
                		odata: {
                			method: 'POST',
                			url: '/myCustomUrl'
                		}
                	 }
	);
```

##Advanced queries

###Predicates
* If you need to write or statements in your queries, you need to use the Predicate class.
First, be sure to reference the **$odata** dependency.
```javascript
myModule.controller('MyController', ['$scope','$odataresource','$odata',function($scope,$odataresource,$odata){}]);
```
* Now you can use the **$odata.Predicate** class wich allow advanced filtering.
```javascript
var predicate1 = new $odata.Predicate("FirstName", "John");
var predicate2 = new $odata.Predicate("LastName", '!=', "Doe");
//
combination = $odata.Predicate.or([predicate1,predicate2]);
User.odata().filter(combination).query();
//Queries /user?$filter=(FirstName eq 'John') or (LastName ne 'Doe');
```

* You can even combine predicates with predicates
```javascript
var predicate1 = new $odata.Predicate("FirstName", "John");
var predicate2 = new $odata.Predicate("LastName", '!=', "Doe");
var predicate3 = new $odata.Predicate("Age", '>', 10);
//
combination1 = $odata.Predicate.or([predicate1,predicate2]);
combination2 = $odata.Predicate.and([combination1,predicate2]);
User.odata().filter(combination).query();
//Queries /user?$filter=((FirstName eq 'John') or (LastName ne 'Doe')) and Age gt 10
```


* You can also achieve the same results with the fluent api
```javascript
var predicate = new $odata.Predicate("FirstName", "John")
                            .or(new $odata.Predicate("LastName", '!=', "Doe"))
                            .and(new $odata.Predicate("Age", '>', 10));
//
User.odata().filter(predicate).query();
//Queries /user?$filter=((FirstName eq 'John') or (LastName ne 'Doe')) and Age gt 10
```

### Overriding default Predicate or Filter behavior
It is sometime necessary to compare two properties or two values in a query.
To do so, you can use the $odata.Value or $odata.Property classes
```javascript
var predicate = new $odata.Predicate(
                            new $odata.Value('Foo'),
                            new $odata.Value('Bar')
                            );
//
User.odata().filter(predicate).query();
//Queries /user?$filter='Foo' eq 'Bar'
```
Or with two properties : 
```javascript
User.odata().filter(
                    new $odata.Property('Name'),
                    new $odata.Property('Surname')
                    ).query();
//Queries /user?$filter=Name eq Surname
```

###Function calls
* You can call functions like endswith or length on an OData query.
To do so, use the **$odata.Func** class.
```javascript
var users = User.odata()
.filter(new $odata.Func("endswith","FullName","Doe"), true)
.query();
//Queries /user?$filter=endswith(FullName eq 'Doe') eq true
```

####Definition

new $odata.Func(**MethodName**, **PropertyName**, **Value1**, **Value2**,...)


The parameters are assumed to be first, a property and then a value.
This behavior can be overriden by specifying explicit values or properties : 
```javascript
new $odata.Func('substringof',
                            new $odata.Value('Alfreds'),
                            new $odata.Property('CompanyName')
                );
```

####List of available functions

Function | Example | Example value
--------- | --------- | -----------
**String Functions** |  |  
bool substringof(string po, string p1) | new $odata.Func('substringof',new $odata.Value('Alfreds'), new $odata.Property(CompanyName)) | true
bool endswith(string p0, string p1) | new $odata.Func('endswith','CompanyName', 'Futterkiste') | true
bool startswith(string p0, string p1) | new $odata.Func('startswith','CompanyName', 'Alfr') | true
int length(string p0) | new $odata.Func('length','CompanyName') | 19
int indexof(string p0, string p1) | new $odata.Func('indexof','CompanyName', 'lfreds') | 1
string replace(string p0, string find, string replace) | new $odata.Func('replace','CompanyName', ' ', '') | AlfredsFutterkiste
string substring(string p0, int pos) | new $odata.Func('substring','CompanyName', 1) | lfreds Futterkiste
string substring(string p0, int pos, int length) | new $odata.Func('substring','CompanyName', 1, 2) | lf
string tolower(string p0) | new $odata.Func('tolower','CompanyName') | alfreds futterkiste
string toupper(string p0) | new $odata.Func('toupper','CompanyName') | ALFREDS FUTTERKISTE
string trim(string p0) | new $odata.Func('trim','CompanyName') | Alfreds Futterkiste 
string concat(string p0, string p1) | new $odata.Func('concat','City', new $odata.Property('Country')) | Berlin Germany
**Date Functions** |  | 
int day(DateTime p0) | new $odata.Func('day','BirthDate')  | 8
int hour(DateTime p0) | new $odata.Func('hour','BirthDate')  | 0
int minute(DateTime p0) | new $odata.Func('minute','BirthDate')  | 0
int month(DateTime p0) | new $odata.Func('month','BirthDate')  | 12
int second(DateTime p0) | new $odata.Func('second','BirthDate')  | 0
int year(DateTime p0) | new $odata.Func('year','BirthDate')  | 1948
**Math Functions** | | 
double round(double p0) | new $odata.Func('round','Freight')  | 32d
decimal round(decimal p0) | new $odata.Func('round','Freight')  | 32
double floor(double p0) | new $odata.Func('round','Freight')  | 32d
decimal floor(decimal p0) | new $odata.Func('floor','Freight')  | 32
double ceiling(double p0) | new $odata.Func('ceiling','Freight')  | 33d
decimal ceiling(decimal p0) | new $odata.Func('floor','Freight')  | 33
**Type Functions** | | 
bool IsOf(expression p0, type p1) | new $odata.Func('isof','ShipCountry', 'Edm.String') | true


### Build from the source

1. You need Grunt installed globally:
```sh
> npm install -g grunt
```
2. Then run
```sh
> npm install
> grunt build
```

### Run the tests
* Simply run
```sh
> grunt test
```

### Contribute

Want to contribute? Great!
Be sure to write tests before submitting your pull request.
