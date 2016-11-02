[![Build Status](https://travis-ci.org/devnixs/ODataAngularResources.svg?branch=master)](https://travis-ci.org/devnixs/ODataAngularResources)
[![Coverage Status](https://coveralls.io/repos/devnixs/ODataAngularResources/badge.svg?branch=master&15)](https://coveralls.io/r/devnixs/ODataAngularResources?branch=master)
[![CDNJS](https://img.shields.io/cdnjs/v/ODataResources.svg)](https://cdnjs.com/libraries/ODataResources)


# <a name="odataangularresource"></a>ODataAngularResources

ODataAngularResources is a fork of Angular's $resource that allows to make OData queries in a fluent way.
It does everything Angular Resources does but add some features:

  - Fluent API
  - Generate proper OData queries without worrying about escaping the right characters
  - Allows filtering, skipping, ordering, expanding, and selecting only N elements (with top)
  - Able to generate complex queries with OR, AND and method calls

[Simple JSFiddle Demo](http://jsfiddle.net/h22f7596/)


# Table of Contents
* [How to install](#how-to-install)
* [How to use](#how-to-use)
 * [Simple query](#simple-query)
 * [Retrieving a single element](#retrieving-a-single-element)
 * [Query with top, orderBy and skip](#query-with-top-orderby-and-skip)
 * [Count and InlineCount](#count-and-inlinecount)
 * [Including related models (Expanding)](#expanding)
 * [Pick a subset of the properties (Selecting)](#selecting)
 * [Specifying a custom url and method](#custom-url)
 * [Specifying the response format](#format)
* [Advanced queries](#advanced-queries)
 * [Predicates](#predicates)
 * [Overriding default Predicate or Filter behavior](#override-default-predicate-or-filter-behavior)
 * [Specifying the type of the data](#specifying-data-types)
 * [Function calls](#function-calls)
  * [Function calls definition](#function-calls-definition)
  * [List of available functions](#function-calls-available-list)
 * [Lambda Operators](#lambda-operators)
* [OData V4 support](#odata-v4)
 * [Updating entries with OData v4](#odata-v4-action-methods)
 * [Expand and Odata v4](#odata-v4-expand)
 * [InlineCount with OData v4](#odata-v4-inlinecount)
 * [Transform the final query url](#odata-v4-transform-url)
* [The Promise Chain](#promise-chain)
 * [Interceptors](#promise-chain-interceptors)
 * [Callbacks](#promise-chain-callbacks)
 * [Error Correction](#promise-chain-error-correction)
* [Refreshing Responses & Odata Query Persistence](#saving-query-settings)
 * [Persistence](#persistence)
 * [$refresh](#refresh-data)
* [Build from the source](#build-from-source)
* [Run the tests](#unit-testing)
* [Contribute](#contribute)
 
## <a name="how-to-install"></a>How to install

1. Download the repository or install the **bower package** : 
```Shell
bower install angular-odata-resources --save
```
or
```Shell
npm install angular-odata-resources --save
```
2. Include the file **build/odataresources.js** into your project
3. Be sure to register the module "ODataResources" in your module definition : 
```javascript
var myModule = angular.module('myModule',['ODataResources']);
```
4. Then replace your dependency to "$resource" by "$odataresource"
```javascript
myModule.controller('MyController', ['$scope','$odataresource',function($scope,$odataresource){}]);
```

## <a name="how-to-use"></a>How to use

### <a name="simple-query"></a>Simple query
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

### <a name="retrieving-a-single-element"></a>Retrieving a single element
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
If you want to retrieve a single element after a query you can use the single() method which will take the first elements of the response. This method will throw if the reponse returns an empty array.
```javascript
var User = $odataresource('/user/:userId', {userId:'@id'});
var myUser =   User.odata()
                    .filter("Name","John")
                    .single(); 
//Queries /user?$filter=Name eq 'John' and put the first element into myUser

```


### <a name="query-with-top-orderby-and-skip"></a>Query with top, orderBy and skip
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

### <a name="count-and-inlinecount"></a>Count and InlineCount
- It's possible to query the number of elements
```javascript
                var data = User.odata().filter('name','bob').count();
                    
//Queries /user/$count/?$filter=name eq 'bob'
// data.result == 25
```
- You can also ask for an inline count to have the count aside with the data
```javascript
                var users = User.odata().withInlineCount().query();
                
//Queries /user?$inlinecount=allpages
// users is an array but also contains the count property
// The server may reply by
// {
//     "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
//     "value": [{
//         name: 'Test',
//         id: 1,
//     }, {
//         name: 'Foo',
//         id: 2,
//     }],
//     'count': 10
// }
// And then, the count will be defined as followed
// users.count == 10
```

### <a name="expanding"></a>Including related models (Expanding)
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
var myUsers =   User.odata()
                    .expand("City")
                    .expand("Orders")
                    .query();
                    
//Queries /user?$expand=City,Orders
```
### <a name="selecting"></a>Pick a subset of the properties (Selecting)
* You can use the select method to retrieve only some properties of the entities.
```javascript
var User = $odataresource('/user/:userId', {
        userId: '@id'
    });
    
    var users = User.odata().select(['name','userId']).query();
    //OR
    var users = User.odata().select('name','userId').query();                    

//Queries /user?$select=userId,name
```

### <a name="custom-url"></a>Specifying a custom url and method
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

### <a name="format"></a>Specifying the response format
```javascript
var myUsers =   User.odata()
					.format("json")
                    .expand("City")
                    .expand("Orders")
                    .query();
                    
//Queries /user?$format=json&$expand=City,Orders
```
	

## <a name="advanced-queries"></a>Advanced queries

### <a name="predicates"></a>Predicates
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

### <a name="override-default-predicate-or-filter-behavior"></a>Overriding default Predicate or Filter behavior
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

### <a name="specifying-data-types"></a>Specifying the type of the data

This library is clever enough to figure out the types from the data passed and format them accordingly.
But sometimes you may need to have a specific output type. In this case you can pass a second argument to the $odata.Value() constructor : 
```javascript
User.odata().filter(
                    'Latitude',
                    new $odata.Value(40.765150,"Decimal")
                    ).query();
//Queries /user?$filter=Latitude eq 40.765150M

User.odata().filter(
                    'Latitude',
                    new $odata.Value("75.42","Int32")
                    ).query();
//Queries /user?$filter=Latitude eq 75


User.odata().filter(
                    'Latitude',
                    new $odata.Value("true","Boolean")
                    ).query();
//Queries /user?$filter=Latitude eq true


User.odata().filter(
                    'Latitude',
                    new $odata.Value(10,"Boolean")
                    ).query();
//Queries /user?$filter=Latitude eq true

```

Here is the complete list of supported types :

Type Name       | Output example
----------------|---------------
Boolean         | true 
Byte            | FE
DateTime        | datetime'2000-12-12T12:00'
Decimal         | 2.345M
Double          | 2.0d
Single          | 2.0f
Guid            | guid'12345678-aaaa-bbbb-cccc-ddddeeeeffff'
Int32           | 51358
String          | 'Hello OData'


### <a name="function-calls"></a>Function calls
* You can call functions like endswith or length on an OData query.
To do so, use the **$odata.Func** class.
```javascript
var users = User.odata()
              .filter(new $odata.Func("endswith","FullName","Doe"), true)
              .query();
//Queries /user?$filter=endswith(FullName, 'Doe') eq true
```

#### <a name="function-calls-definition"></a>Definition

new $odata.Func(**MethodName**, **PropertyName**, **Value1**, **Value2**,...)


The parameters are assumed to be first, a property and then a value.
This behavior can be overriden by specifying explicit values or properties : 
```javascript
new $odata.Func('substringof',
                  new $odata.Value('Alfreds'),
                  new $odata.Property('CompanyName'));
```

#### <a name="function-calls-available-list"></a>List of available functions

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

### <a name="lambda-operators"></a>Lambda Operators
The **$odata.Func** class also supports the lambda operators **any** and **all**

new $odata.Func(**LambdaOperator**, **PropertyName**, **LambdaVariable**, **Expression**)

The parameters are assumed to be first, a lambda operator, a property name, a lambda variable, and a boolean expression.
The boolean expression must use the lambda variable to refer to properties of the related entities identified by the navigation path.

```javascript
var predicate1 = new $odata.Predicate("c/FirstName", "Bobby");
var predicate2 = new $odata.Predicate("c/LastName", "McGee");
//
var combination = $odata.Predicate.and([predicate1,predicate2]);
//
var func = new $odata.Func('any', 'clients', 'c', combination);
//
Jobs.odata().filter(func).query();
//Queries /Jobs?$filter=clients/any(c:((c/FirstName eq 'Bobby') and (c/LastName eq 'McGee')))
```


## <a name="odata-v4"></a>OData V4 support
This project supports basic odata v4 queries and responses.
If the server responds with an array wrapped inside an object :
```json
{
  "@odata.context":"http://local.testsite.com/odata/$metadata#TestData",
   "value":[
    {
      "TestId":1,"name":"test 1"
    },{
      "TestId":2,"name":"test 2"
    }
  ],
"totalCount":10
}
```

The api will still return the array provided in the **value** property and everything else will be set as properties of the array.
```javascript
var User = $odataresource('/user/:userId', {userId:'@id'});
var myUsers =   User.odata()
                    .filter("Name","John")
                    .query(); 

//... later

console.log(myUsers[0].name);
console.log(myUsers.totalCount);

```

### <a name="odata-v4-action-methods"></a>Updating entries with OData v4
 You can use the $update method on an object.
 But for that you need to specify what is the property that contains the key.

 There is two way of doing so :

 * Provide the key property as a second argument.
```javascript
User = $odataresource('/user', 'id');
var myUsers = User.odata.query();

//... later
myUsers[0].$update();
//Will issue a PUT /user(1)
```
 * Or provide it as a property of the 4th argument.
```javascript
User = $odataresource('/user', {},{},{odatakey : 'id'});
var myUser = new User();

myUser.$save();
//Will issue a POST /user

myUser.$update();
//Will issue a PUT /user(1)

myUser.$delete();
//Will issue a DELETE /user(1)
```
 * You can provide a comma seperated list of id's for complex key tables.
```javascript
User = $odataresoure('/userroles', {},{},{odatakey: 'id,roleid'});
var myUser = new User();

myUser.$update();
//will issue a POST /user(id=1,roleid=2)
```

### <a name="odata-v4-expand"></a>Expand and Odata v4

With odatav4 expanding nested entities is done with a different query
```
/user?$expand=Order/Items
```
becomes
```
/user?$expand=Order($expand=Items)
```
To enable this behavior set the isodatav4 property to true when invoking the $odataresource method:
```javascript
User = $odataresource('/user', {}, {}, {
    odatakey: 'id',
    isodatav4: true
});

var result = User.odata().expand("roles", "role").query();
//  /user?$expand=roles($expand=role)
```
You can use the expand predicate for complex expand scenarios (such as parsing your metadata and applying a default schema to a query):
```javascript
var result = User.odata().expandPredicate("roles").select("name").finish().query();
// /user?$expand=roles($select=name)
```
ExpandPredicate returns the Expand context and finish returns the base OdataProvider context, so make sure to finish the expandPredicate.

You can nest expands as well:
```javascript
// grab odata context
var query = User.odata();
// add expand roles table and select roles.name
query.expandPredicate("roles").select("name").finish();
// add and save the context for the provider table and select provider.name, also expand provider -> settings (automatically calls finish())
var providertype = query.expandPredicate("provider").select("name").expand("settings");
// add provider type table and finish out both the provider type and provider expandPredicate contexts
providertype.expandPredicate("providertype").finish().finish();
// run the query
query.query();

// or inline

var query = User.odata().expandPredicate("roles").select("name").finish().expandPredicate("provider").select("name").expand("settings")
  .expandPredicate("providertype").finish().finish().query();

// /user?$expand=roles($select=name),provider($select=name;expand=settings,providertype)
```

### <a name="odata-v4-inlinecount"></a>InlineCount with OData v4

- With OData v4 inlinecount issues a $count=true parameter
```javascript
                var users = User.odata().withInlineCount().query();
                
//Queries /user?$count=true
// users is an array but also contains the count property
// The server may reply by
// {
//     "@odata.context": "http://host/service/$metadata#Collection(Edm.String)",
//     "@odata.count":10,
//     "value": [{
//         name: 'Test',
//         id: 1,
//     }, {
//         name: 'Foo',
//         id: 2,
//     }]
// }
// And then, the count will be defined as followed
// users.count == 10
```
### <a name="odata-v4-transform-url"></a>Transform the final query url

- It is possible to transform the query that will be made to the server by calling the method transformUrl
```javascript

User.odata()
    .filter("Name", "Raphael")
    .transformUrl(function(url){
        return url+'&foo=bar';
    })
    .query();

// queries /user?$filter=Name eq 'Raphael'&foo=bar                    
```

## <a name="promise-chain"></a>The Promise Chain
When you retrieve a resource from the API, you are returned a Resource object or Array of Resources with the $http call being appended to the
$promise property.  This promise has already been chained through two phases.  A intereptor phase for $http request success or errors. These
are not to be confused with $http request and response interceptors, but follow the same ceonepts with argumets and return values.  After the
interceptor phase is the callback phase for per request success or error handling.

### <a name="promise-chain-interceptors"></a>Interceptors
Interceptor handlers can be defined for each action you define for the actions object argument to $odataresource.  Both succes and error
interceptor handlers get called withe the $http response object passed as their single argument.  There is a default handler defined for the
success interceptor phase on each action defined with $odataresource that returns argument.resource.  To maintain continuous support from
$odataresource prototype methods (save, update, delete, etc), you should return this object from you success interceptor if you override the
default one.
```javascript
User = $odataresource('/user', {}, {
    odata: {
      interceptor: {
        response: function(response) {
          // response is the returned $http result with the parsed Resource object on response.resource.
          apiLog.logSuccess(response);
          return response.resource;
        },
        responseError: function(response) {
          // response is the returned $http result
          apiLog.logError(response, response.headers());
        },
      },
    },
  }, {});
```

### <a name="promise-chain-callbacks"></a>Callbacks
Callbacks can be provided to each API call by passing a method reference in the parameters to the $odataresource api call.  The success callback
is provided if you want a convient way to inject into the promise chain when calling the api query.  Both the final Resource object and the $http
response headers are provided as parameters an available success callback handler.  The error callback handler will provide you with any error
message that might get thrown during parsing the $http response and building the Resource object.
```javascript
var User = $odataresource("/user", {}, {}, {});
var user = User.odata().select("FirstName","LastName").query(function(resource, headers) {
    resource.Name = resource.FirstName + ' ' + resource.LasstName;
  }, function(error) {
    apiLog.logError(error);
  });
```

### <a name="promise-chain-error-correction"></a>Error Correction
The error interceptor and callback handling has been enhanced to provide an opportunity for error handling and correction measures to be applied
to the original $odataresource settings.  The response from both the error interceptor and the error callback can provide corrected data back to
the promise chain to merge into the final Resource object.  The correction can be in the form of a new Resource object, a new Resource object
promise, an $http promise, or an object with a property named $correction containing new arguments for the $oataresource object (url, defaultParams,
actions, options).  If the new promise, or correction results in another error, the error correction attempt will stop and reject, preventing
an infinate loop.
```javascript
User = $odataresource('/user', {}, {
    odata: {
      interceptor: {
        response: function(response) {
          // response is the returned $http result with the parsed Resource object on response.resource.
          apiLog.logSuccess(response);
          return response.resource;
        },
        responseError: function(response) {
          // response is the returned $http result
          apiLog.logError(response, response.headers());
          return { $correction: { url: 'https://fixedUrl.com/' } };
        },
      },
    },
  }, {});
```

## <a name="saving-query-settings"></a>Refreshing Responses & Odata Query Persistence
Support has been added to keep track of queries used to retrieve entities.  You can call the $refresh method on a returned array of resources,
or an individual resource object itself to get an updated entity from the API.  The odata query applied to the refresh GET will depend on how
the object you're calling the $refresh method on was retrieved.  There are two types of persisted queries, full and limited.  Full will store
the entire list of odata arguments you supplied to reproduce the same result set.  Limited will limit the query to selects, expands, and
format.  Limited assumes you're getting a single entity from a larger query, and want to keep the response equal to the initial object, ie
same selects, expands, but dont need the filter/take/skip/etc odata arguments.

### <a name="persistence"></a>Persistence

To apply persisted query arguments to the provider manually call the 're' method.
```javascript
var newUser = userResource.$odata().re().query();
```

Or you can enable this behavior by default.
```javascript
var User = $odataresource("/user", {}, {}, { isodatav4: true, odatakey: "id", persistence: true } );
var user = User.odata().select("name").query();
var newUser = user.$odata().query();
```

### <a name="refresh-data"></a>$refresh

Persistence is applied automatically with or without the persistence options flag when using $refresh.

Use the following table to determine the query that will be appllied to the refresh:

Initial OdataProvider Call              | Target                            | Persistence 
:---------------------------------------|:----------------------------------|------------:
var array = resource.odata().query();   | var array = array.$refresh();     | full   
var array = resource.odata().query();   | var entity = array[0].$refresh(); | limited
var entity = resource.odata().get(1);   | var entity = entity.$refresh();   | limited
var entity = resource.odata().single(); | var entity = entity.$refresh();   | full   
var count = resource.odata().count();   | var count = count.$refresh();     | full   



## <a name="build-from-source"></a>Build from the source

1. You need Grunt installed globally:
```sh
> npm install -g grunt
```
2. Then run
```sh
> npm install
> grunt build
```

## <a name="unit-testing"></a>Run the tests
* Simply run
```sh
> grunt test
```

## <a name="contribute"></a>Contribute

Want to contribute? Great!
Be sure to write tests before submitting your pull request.
