/// <reference path="references.d.ts" />

module OData {
	export interface ValueFactory {
		new ( value, type?: string): Value;
	}

	export class ValueTypes {
		public static Boolean = "Boolean";
		public static Byte = "Byte";
		public static DateTime = "DateTime";
		public static Decimal = "Decimal";
		public static Double = "Double";
		public static Single = "Single";
		public static Guid = "Guid";
		public static Int32 = "Int32";
		public static String = "String";
	}

	export class Value {
        private illegalChars = {
            '%': '%25',
            '+': '%2B',
            '/': '%2F',
            '?': '%3F',
            '#': '%23',
            '&': '%26'
        };

        private escapeIllegalChars(haystack: string) {
            for (var key in this.illegalChars) {
                haystack = haystack.replace(key, this.illegalChars[key]);
            }
            haystack = haystack.replace("'", "''");
            return haystack;
        }

		private generateDate(date) {
			return "datetime'" + date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2) + "'";
        }

        public executeWithUndefinedType() {
            if (angular.isString(this.value)) {
                return "'" + this.escapeIllegalChars(this.value) + "'";
            } else if (this.value === false) {
                return "false";
            } else if (this.value === true) {
                return "true";
            } else if (angular.isDate(this.value)) {
                return this.generateDate(this.value);
            } else if (!isNaN(this.value)) {
                return this.value;
            } else {
                throw "Unrecognized type of " + this.value;
            }
        }

        public executeWithType() {
			if (this.value === true || this.value === false) {
				if (this.type.toLowerCase() === "boolean") {
					return !!this.value + "";
				} else if (this.type.toLowerCase() === "string") {
					return "'" + !!this.value + "'";
				} else {
					throw "Cannot convert bool (" + this.value + ") into " + this.type;
				}
			}
			if (angular.isDate(this.value)) {
				if (this.type.toLowerCase() === "decimal") {
					return this.value.getTime() + "M";
				} else if (this.type.toLowerCase() === "int32") {
					return this.value.getTime() + "";
				} else if (this.type.toLowerCase() === "single") {
					return this.value.getTime() + "f";
				} else if (this.type.toLowerCase() === "double") {
					return this.value.getTime() + "d";
				} else if (this.type.toLowerCase() === "datetime") {
					return this.generateDate(this.value);
				} else if (this.type.toLowerCase() === "string") {
					return "'" + this.value.toISOString() + "'";
				} else {
					throw "Cannot convert date (" + this.value + ") into " + this.type;
				}
			}
			if (angular.isString(this.value)) {
				if (this.type.toLowerCase() === "guid") {
					return "guid'" + this.value + "'";
				} else if (this.type.toLowerCase() === "datetime") {
					return this.generateDate(new Date(this.value));
				} else if (this.type.toLowerCase() === "single") {
					return parseFloat(this.value) + "f";
				} else if (this.type.toLowerCase() === "double") {
					return parseFloat(this.value) + "d";
				} else if (this.type.toLowerCase() === "decimal") {
					return parseFloat(this.value) + "M";
				} else if (this.type.toLowerCase() === "boolean") {
					return this.value;
				} else if (this.type.toLowerCase() === "int32") {
					return parseInt(this.value) + "";
				} else {
					throw "Cannot convert " + this.value + " into " + this.type;
				}
			} else if (!isNaN(this.value)) {
				if (this.type.toLowerCase() === "boolean") {
					return !!this.value + "";
				} else if (this.type.toLowerCase() === "decimal") {
					return this.value + "M";
				} else if (this.type.toLowerCase() === "double") {
					return this.value + "d";
				} else if (this.type.toLowerCase() === "single") {
					return this.value + "f";
				} else if (this.type.toLowerCase() === "byte") {
					return (this.value % 255).toString(16);
				} else if (this.type.toLowerCase() === "datetime") {
					return this.generateDate(new Date(this.value));
				} else if (this.type.toLowerCase() === "string") {
					return "'" + this.value + "'";
				} else {
					throw "Cannot convert number (" + this.value + ") into " + this.type;
				}
			}
			else {
				throw "Source type of " + this.value + " to be conververted into " + this.type + "is not supported";
			}
        }

		public execute():string {
            if (this.type === undefined) {
				return this.executeWithUndefinedType();
            } else {
				return this.executeWithType();
            }
        }

		constructor(private value, private type?: string) {}
	}
}


angular.module('ODataResources').factory('$odataValue', [()=>OData.Value]);