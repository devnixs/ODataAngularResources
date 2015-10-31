angular.module('ODataResources').
factory('$odataValue', [

    function() {
        var illegalChars = {
            '%': '%25',
            '+': '%2B',
            '/': '%2F',
            '?': '%3F',
            '#': '%23',
            '&': '%26'
        };
        var escapeIllegalChars = function(string) {
            for (var key in illegalChars) {
                string = string.replace(key, illegalChars[key]);
            }
            string = string.replace("'", "''");
            return string;
        };
        var ODataValue = function(input, type) {
            this.value = input;
            this.type = type;
        };

        var generateDate = function(date,isOdataV4){
        	if(!isOdataV4){
        		return "datetime'" + date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)+':'+("0" + date.getSeconds()).slice(-2) + "'";
        	}else{
        		return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)+':'+("0" + date.getSeconds()).slice(-2) + "Z";
        	}
        };
        
        var generateGuid = function(guidValue, isOdataV4){
            if(!isOdataV4){
                return "guid'"+guidValue+"'";
            }else{
                return guidValue;
            } 
        };
		
		var generateDateOffset = function (date, isOdataV4) {
            if (!isOdataV4) {
                return "datetimeoffset'" + date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2) + "'";
            } else {
                return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2) + "Z";
            }
        };

        ODataValue.prototype.executeWithUndefinedType = function(isOdataV4) {
            if (angular.isString(this.value)) {
                return "'" + escapeIllegalChars(this.value) + "'";
            } else if (this.value === false) {
                return "false";
            } else if (this.value === true) {
                return "true";
            } else if (angular.isDate(this.value)) {
                return generateDate(this.value,isOdataV4);
            } else if (!isNaN(this.value)) {
                return this.value;
            } else {
                throw "Unrecognized type of " + this.value;
            }
        };

        ODataValue.prototype.executeWithType = function(isOdataV4){
        	if(this.value === true || this.value === false){
	        	if(this.type.toLowerCase() === "boolean"){
	        		return !!this.value+"";
	        	}else if(this.type.toLowerCase() === "string"){
	        		return "'"+!!this.value+"'";
	        	}else {
	        		throw "Cannot convert bool ("+this.value+") into "+this.type;
	        	}
	        }
	        if(angular.isDate(this.value)){
	        	if(this.type.toLowerCase() === "decimal"){
	        		return this.value.getTime()+"M";
	        	}else if(this.type.toLowerCase() === "int32"){
	        		return this.value.getTime()+"";
	        	}else if(this.type.toLowerCase() === "single"){
	        		return this.value.getTime()+"f";
	        	}else if(this.type.toLowerCase() === "double"){
	        		return this.value.getTime()+"d";
	        	}else if(this.type.toLowerCase() === "datetime"){
	        		return generateDate(this.value,isOdataV4);
	        	} else if (this.type.toLowerCase() === "datetimeoffset") {
	        	    return generateDateOffset(new Date(this.value), isOdataV4);					
	        	}else if(this.type.toLowerCase()==="string"){
	        		return "'"+this.value.toISOString()+"'";
	        	}else {
	        		throw "Cannot convert date ("+this.value+") into "+this.type;
	        	}
	        }
	        if(angular.isString(this.value)){
	        	if(this.type.toLowerCase() === "guid"){
                    return generateGuid(this.value,isOdataV4);
	        	}else if(this.type.toLowerCase() === "datetime"){
	        		return generateDate(new Date(this.value),isOdataV4);
	        	} else if (this.type.toLowerCase() === "datetimeoffset") {
	        	    return generateDateOffset(new Date(this.value), isOdataV4);					
	        	}else if(this.type.toLowerCase() === "single"){
	        		return parseFloat(this.value)+"f";
	        	}else if(this.type.toLowerCase() === "double"){
	        		return parseFloat(this.value)+"d";
	        	}else if(this.type.toLowerCase() === "decimal"){
	        		return parseFloat(this.value)+"M";
	        	}else if(this.type.toLowerCase() === "boolean"){
	        		return this.value;
	        	}else if(this.type.toLowerCase() === "int32"){
	        		return parseInt(this.value)+"";
	        	}else {
	        		throw "Cannot convert "+this.value+" into "+this.type;
	        	}
        	}else if(!isNaN(this.value)){
	        	if(this.type.toLowerCase() === "boolean"){
	        		return !!this.value+"";
	        	}else if(this.type.toLowerCase() === "decimal"){
	        		return this.value+"M";
	        	}else if(this.type.toLowerCase() === "double"){
	        		return this.value+"d";
	        	}else if(this.type.toLowerCase() === "single"){
	        		return this.value+"f";
	        	}else if(this.type.toLowerCase() === "byte"){
	        		return (this.value%255).toString(16);
	        	}else if(this.type.toLowerCase() === "datetime"){
	        		return generateDate(new Date(this.value),isOdataV4);
	        	}else if(this.type.toLowerCase() === "string"){
	        		return "'"+this.value+"'";
	        	}else {
	        		throw "Cannot convert number ("+this.value+") into "+this.type;
	        	}
        	}
        	else{
        		throw "Source type of "+this.value+" to be conververted into "+this.type+"is not supported";
        	}
        };

        ODataValue.prototype.execute = function(isOdataV4) {
            if(this.value === null){
                return 'null';
            }

            if (this.type === undefined) {
            	return this.executeWithUndefinedType(isOdataV4);
            } else {
            	return this.executeWithType(isOdataV4);
            }
        };
        return ODataValue;

    }
]);