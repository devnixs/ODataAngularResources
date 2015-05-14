angular.module('minovateApp')
.factory('ODataEndpoints', ['$lodash', '$http',
	function ($_, $http) {

	    var endpoints = {
	        'assets': '/api/assets/odata/'
		};

        var api = {};

        var generateSortFilterQuery = function(filters){
        	if(filters === undefined)
        		return "";

        	var filterQuery = "";
	            $_.forIn(filters, function(filterValue,filterKey) {
	                if (filterQuery !== "") {
	                    filterQuery += " and ";
	                }

	                filterQuery += filterKey + " eq " + filterValue;
	            });

	            return filterQuery;
	    };

	    var generateSortOrderQuery = function(sortOrders){
	    	if(sortOrders===undefined)
	    		return "";

        	var orderQuery = "";
	            $_.forEach(sortOrders, function(filterValue) {
	            	if (orderQuery !== "") {
	                    orderQuery += ",";
	                }

	                orderQuery += filterValue;
	            });

	            return orderQuery;
	    };


        $_.forIn(endpoints, function( endpoint,element) {
	        api[element] = function(filters,sortOrders,skip,take) {
	            var finalUrl = endpoint;
	            if(arguments.length>0){
	            	finalUrl = finalUrl+"?";
	            }

	            filterQuery = generateSortFilterQuery(filters);

	            if(filterQuery!==""){
	            	finalUrl += "$filter="+filterQuery;
	            }


	            orderQuery = generateSortOrderQuery(sortOrders);

	            if(orderQuery!==""){
	            	finalUrl += "$orderby="+orderQuery;
	            }

	            if(skip!==undefined){
	            	finalUrl += "$skip="+skip;
	            }

	            if(take!==undefined){
	            	finalUrl += "$top="+take;
	            }

	            var data = [];
	            var promise = $http.get(finalUrl);
	            data.$promise = promise;

        		promise.then(function(response){
        			for (var i = 0; i < response.data.length; i++) {
        				data.push(response.data[i]);
        			}
        		});

        		return data;
	        };
	    });

	    return api;
	}
]);