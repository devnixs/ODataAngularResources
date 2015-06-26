/// <reference path="references.d.ts" />

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

