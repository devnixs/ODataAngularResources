/// <reference path="references.d.ts" />
//This is a file used to test the typescript version of every classes

class User{

}

var resources: OData.IResourceService;
var user=resources<User>("/users");
var response1 = user.odata().filter("a", "=", "3").query();
var response2 = user.odata().filter("a", "=", "3").get(10);
var response3 = user.odata().filter("a", "b", "c").take(10).skip(5).orderBy("Name").single();
var response4 = user.odata().expand("City","Country").single();
var response5 = user.odata().expand(["City","Country"]).single();
var response6 = user.odata().expand(["City","Country"]).single();

var predicate1 = new OData.Predicate("FirstName","John");

var predicate1 = new OData.Predicate(
	new OData.Value("Foo"),
	new OData.Value("Bar"));

user.odata().filter(
                    'Latitude',
                    new OData.Value("75.42",OData.ValueTypes.Int32)
                    ).query();


user.odata().filter(
                    new OData.MethodCall("endswith","FullName","Doe"), true
                    ).query();
