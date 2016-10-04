/**
 * @license AngularJS v1.3.15
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular, undefined) {
  'use strict';

  var $resourceMinErr = angular.$$minErr('$resource');

  // Helper functions and regex to lookup a dotted path on an object
  // stopping at undefined/null.  The path must be composed of ASCII
  // identifiers (just like $parse)
  var MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;

  function isValidDottedPath(path) {
    return (path !== null && path !== '' && path !== 'hasOwnProperty' &&
      MEMBER_NAME_REGEX.test('.' + path));
  }

  function lookupDottedPath(obj, path) {
    if (!isValidDottedPath(path)) {
      throw $resourceMinErr('badmember', 'Dotted member path "@{0}" is invalid.', path);
    }
    var keys = path.split('.');
    for (var i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
      var key = keys[i];
      obj = (obj !== null) ? obj[key] : undefined;
    }
    return obj;
  }

  /**
   * Create a shallow copy of an object and clear other fields from the destination
   */
  function shallowClearAndCopy(src, dst) {
    dst = dst || {};

    angular.forEach(dst, function(value, key) {
      delete dst[key];
    });

    for (var key in src) {
      if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
        dst[key] = src[key];
      }
    }

    return dst;
  }


  angular.module('ODataResources').
  provider('$odataresource', function() {
    var provider = this;

    this.defaults = {
      // Strip slashes by default
      stripTrailingSlashes: true,

      // Default actions configuration
      actions: {
        'get': {
          method: 'GET'
        },
        'save': {
          method: 'POST'
        },
        'query': {
          method: 'GET',
          isArray: true
        },
        'remove': {
          method: 'DELETE'
        },
        'delete': {
          method: 'DELETE'
        },
        'update': {
          method: 'PUT'
        },
        'odata': {
          method: 'GET',
          isArray: true
        }
      }
    };

    this.$get = ['$http', '$q', '$odata',
      function($http, $q, $odata) {

        var noop = angular.noop,
          forEach = angular.forEach,
          extend = angular.extend,
          copy = angular.copy,
          isFunction = angular.isFunction,
          resourceStore = [];

        /**
         * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
         * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set
         * (pchar) allowed in path segments:
         *    segment       = *pchar
         *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
         *    pct-encoded   = "%" HEXDIG HEXDIG
         *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
         *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
         *                     / "*" / "+" / "," / ";" / "="
         */
        function encodeUriSegment(val) {
          return encodeUriQuery(val, true).
          replace(/%26/gi, '&').
          replace(/%3D/gi, '=').
          replace(/%2B/gi, '+');
        }


        /**
         * This method is intended for encoding *key* or *value* parts of query component. We need a
         * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
         * have to be encoded per http://tools.ietf.org/html/rfc3986:
         *    query       = *( pchar / "/" / "?" )
         *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
         *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
         *    pct-encoded   = "%" HEXDIG HEXDIG
         *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
         *                     / "*" / "+" / "," / ";" / "="
         */
        function encodeUriQuery(val, pctEncodeSpaces) {
          return encodeURIComponent(val).
          replace(/%40/gi, '@').
          replace(/%3A/gi, ':').
          replace(/%24/g, '$').
          replace(/%2C/gi, ',').
          replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
        }

        function Route(template, defaults) {
          this.template = template;
          this.defaults = extend({}, provider.defaults, defaults);
          this.urlParams = {};
        }

        Route.prototype = {
          setUrlParams: function(config, params, actionUrl, data, isOData) {
            var self = this,
              url = actionUrl || self.template,
              val,
              encodedVal;



            if (url === self.template &&
              (config.method === 'PUT' ||
              config.method === 'DELETE' ||
              (config.method == 'GET' && !isOData) ||
              config.method == 'PATCH') && angular.isString(self.defaults.odatakey)) {
              
            // strip trailing slashes and set the url (unless this behavior is specifically disabled)
            if (self.defaults.stripTrailingSlashes) {
              url = url.replace(/\/+$/, '') || '/';
            }

            var odatakeySplit = self.defaults.odatakey.split(',');
            var splitKey = odatakeySplit.map(function (key) { return odatakeySplit.length > 1 ? key + '=:' + key : ':' + key; });
            url = url + '(' + splitKey.join(',') + ')';

              if (data) {
                  forEach(odatakeySplit, function (param) {
                      params[param] = data[param];
                  });
              }
            }

            var urlParams = self.urlParams = {};
            forEach(url.split(/\W/), function(param) {
              if (param === 'hasOwnProperty') {
                throw $resourceMinErr('badname', "hasOwnProperty is not a valid parameter name.");
              }
              if (!(new RegExp("^\\d+$").test(param)) && param &&
                (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
                urlParams[param] = true;
              }
            });
            url = url.replace(/\\:/g, ':');

            params = params || {};
            forEach(self.urlParams, function(_, urlParam) {
              val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
              if (angular.isDefined(val) && val !== null) {
                encodedVal = encodeUriSegment(val);
                url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), function(match, p1) {
                  return encodedVal + p1;
                });
              } else {
                url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function(match,
                  leadingSlashes, tail) {
                  if (tail.charAt(0) == '/') {
                    return tail;
                  } else {
                    return leadingSlashes + tail;
                  }
                });
              }
            });

            // strip trailing slashes and set the url (unless this behavior is specifically disabled)
            if (self.defaults.stripTrailingSlashes) {
              url = url.replace(/\/+$/, '') || '/';
            }
            

            // then replace collapse `/.` if found in the last URL path segment before the query
            // E.g. `http://url.com/id./format?q=x` becomes `http://url.com/id.format?q=x`
            url = url.replace(/\/\.(?=\w+($|\?))/, '.');
            // replace escaped `/\.` with `/.`
            config.url = url.replace(/\/\\\./, '/.');


            // set params - delegate param encoding to $http
            forEach(params, function(value, key) {
              if (!self.urlParams[key]) {
                config.params = config.params || {};
                config.params[key] = value;
              }
            });
          }
        };


        function resourceFactory(url, paramDefaults, actions, options) {
          options = options || {};

          if (angular.isString(paramDefaults)) {
            options.odatakey = paramDefaults;
            paramDefaults = {};
          }

          var route = new Route(url, options);

          actions = extend({}, provider.defaults.actions, actions);

          function extractParams(data, actionParams) {
            var ids = {};
            actionParams = extend({}, paramDefaults, actionParams);
            forEach(actionParams, function(value, key) {
              if (isFunction(value)) {
                value = value();
              }
              ids[key] = value && value.charAt && value.charAt(0) == '@' ?
                lookupDottedPath(data, value.substr(1)) : value;
            });
            return ids;
          }

          function defaultResponseInterceptor(response) {
            return response.resource;
          }

          function Resource(value) {
              shallowClearAndCopy(value || {}, this);
          }

          Resource.prototype.toJSON = function() {
            var data = extend({}, this);
            delete data.$promise;
            delete data.$resolved;
            return data;
          };

          Resource.store = function (resource) {
              var exists = resourceStore.filter(function (filter) {
                  return filter.resource === resource;
              });
              if (exists.length) {
                  Array.prototype.splice.call(arguments, 0, 1, exists[0]);
                  return angular.extend.apply(angular, arguments);
              }
              Array.prototype.splice.call(arguments, 0, 1, { resource: resource });
              exists = angular.extend.apply(angular, arguments);
              resourceStore.push(exists);
              return exists;
          };

          Resource.isResource = function(target) {
              return resourceStore.filter(function(filter) {
                  return filter.resource === target;
              }).length;
          };

          Resource.store.get = function(target) {
              var hash = resourceStore.filter(function(filter) {
                  return filter.resource === target;
              });
              return hash.length ? hash[0] : null;
          };

          Resource.store.getHeaders = function(target) {
              var stored = Resource.store.get(target);
              return stored ? stored.headers : null;
          };

          Resource.store.copyHeaders = function(target, source) {
              return Resource.store(target, { headers: Resource.store.getHeaders(source) });
          };

          Resource.store.getConfig = function(target) {
              var stored = Resource.store.get(target);
              return stored ? stored.config : null;
          };

          Resource.store.pendingCorrection = function (target) {
              var stored = Resource.store.get(target);
              return stored ? stored.pendingCorrection || false : false;
          };

          Resource.store.getRefreshingResource = function(target) {
              var stored = resourceStore.filter(function(filter) {
                  return filter.refreshedAs === target;
              });
              return stored ? stored[0] : null;
          };

          forEach(actions, function(action, name) {

            var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);

            Resource[name] = function(a1, a2, a3, a4, isOdata, odataQueryString, isSingleElement, forceSingleElement, persistence) {
              var params = {}, data, success, error;

              /* jshint -W086 */
              /* (purposefully fall through case statements) */
              switch (arguments.length) {
                case 9:
                case 8:
                case 7:
                case 6:
                case 4:
                  error = a4;
                  success = a3;
                  //fallthrough
                case 3:
                case 2:
                  if (isFunction(a2)) {
                    if (isFunction(a1)) {
                      success = a1;
                      error = a2;
                      break;
                    }

                    success = a2;
                    error = a3;
                    //fallthrough
                  } else {
                    params = a1;
                    data = a2;
                    success = a3;
                    break;
                  }
                case 1:
                  if (isFunction(a1)) success = a1;
                  else if (hasBody) data = a1;
                  else params = a1;
                  break;
                case 0:
                  break;
                default:
                  throw $resourceMinErr('badargs',
                    "Expected up to 4 arguments [params, data, success, error], got {0} arguments",
                    arguments.length);
              }
              /* jshint +W086 */
              /* (purposefully fall through case statements) */

              var isInstanceCall = this instanceof Resource;
              var value = isInstanceCall ? data : ((!isSingleElement && action.isArray) ? [] : new Resource(data));
              var httpConfig = {};
              var responseInterceptor = action.interceptor && action.interceptor.response ||
                defaultResponseInterceptor;
              var responseErrorInterceptor = action.interceptor && action.interceptor.responseError ||
                undefined;

              addRefreshMethod(value, persistence);

              forEach(action, function(value, key) {
                if (key != 'params' && key != 'isArray' && key != 'interceptor') {
                  httpConfig[key] = copy(value);
                }
              });

              if (hasBody) httpConfig.data = data;


              route.setUrlParams(httpConfig,
                extend({}, extractParams(data, action.params || {}), params),
                action.url,
                data,
                isOdata);

              //if (angular.isString(odataQueryString) && odataQueryString !== "" && !isOdata || (isOdata && (!isSingleElement || forceSingleElement))) {
              if (isOdata && odataQueryString !== "" && (!isSingleElement || forceSingleElement)) {
                httpConfig.url += "?" + odataQueryString;
              } else if (odataQueryString !== "" && isSingleElement) {
                httpConfig.url += odataQueryString;
              }

              //chieffancypants / angular-loading-bar
              //https://github.com/chieffancypants/angular-loading-bar
              if (options.ignoreLoadingBar)
                httpConfig.ignoreLoadingBar = true;

                function httpSuccessHandler(response) {
                    var data = response.data,
                        promise = value.$promise;

                    if(data && angular.isNumber(data['@odata.count'])) {
                        data.count = data['@odata.count'];
                    }

                    if (data && (angular.isString(data['@odata.context']) || angular.isString(data['odata.metadata']) ) && data.value && angular.isArray(data.value)) {
                        var fullObject = data;
                        data = data.value;
                        for (var property in fullObject) {
                            if (property !== "value") {
                                value[property] = fullObject[property];
                            }
                        }
                    }


                    if (data) {
                        // Need to convert action.isArray to boolean in case it is undefined
                        // jshint -W018
                        if (angular.isArray(data) !== (!isSingleElement && !! action.isArray) && !forceSingleElement) {
                            throw $resourceMinErr('badcfg',
                                'Error in resource configuration for action `{0}`. Expected response to ' +
                                'contain an {1} but got an {2} (Request: {3} {4})', name, (!isSingleElement && action.isArray) ? 'array' : 'object',
                                angular.isArray(data) ? 'array' : 'object', httpConfig.method, httpConfig.url);
                        }

                        if(angular.isArray(data) && forceSingleElement){
                            if(data.length>0){
                                data = data[0];
                            }else{
                                throw "The response returned no result";
                            }
                        }

                        // jshint +W018
                        if (!isSingleElement && action.isArray && isNaN(parseInt(data))) {
                            value.length = 0;
                            forEach(data, function(item) {
                                if (typeof item === "object") {
                                    var newResource = new Resource(item);
                                    addRefreshMethod(newResource, persistence, false);
                                    value.push(newResource);
                                } else {
                                    // Valid JSON values may be string literals, and these should not be converted
                                    // into objects. These items will not have access to the Resource prototype
                                    // methods, but unfortunately there
                                    value.push(item);
                                }
                            });
                        } else {
                            shallowClearAndCopy(data, value);
                            value.$promise = promise;
                        }
                    }

                    if(angular.isNumber(data) && isSingleElement){
                        value.result = data;
                    }
                    else if(!isNaN(parseInt(data)) && isSingleElement){
                        value.result = parseInt(data);
                    }

                    value.$resolved = true;

                    response.resource = value;

                    Resource.store(value, { headers: response.headers() });

                    return responseInterceptor(response) || response;
                }

                // Input: httpResponse error object
                // Output: Rejection wrapped error object, rejected non promise response from errorInterceptor, or promise from errorInterceptor with errorCorrectionHandler appended to chain
                function httpErrorHandler(response) {
                    value.$resolved = true;
                    var refreshingResource = Resource.store.getRefreshingResource(value);
                    if (refreshingResource && refreshingResource.preventErrorLooping) {
                        Resource.store(refreshingResource.resource, { preventErrorLooping: false });
                        return $q.reject(response);
                    }
                    Resource.store(value, { headers: response.headers(), preventErrorLooping: true });
                    return chooseErrorResponsePromiseChain((responseErrorInterceptor || noop)(response) || response);
                }

                function callbackSuccessHandler(response) {
                    (success || noop)(response, Resource.store.getHeaders(value));
                    return response;
                }

                // Input: string of thrown error from httpSuccessCallback, rejection from httpErrorHandler
                // Output: Rejection wrapped error output rejected non promise response from errorCallback, or promise from errorCallback with errorCorrectionHandler appended to chain
                function callbackErrorHandler(response) {
                    var refreshingResource = Resource.store.getRefreshingResource(value);
                    if (refreshingResource && refreshingResource.preventErrorLooping) {
                        Resource.store(refreshingResource.resource, { preventErrorLooping: false });
                        return $q.reject(response);
                    }
                    Resource.store(value, { preventErrorLooping: true });
                    return chooseErrorResponsePromiseChain((error || noop)(response) || response).then(function (newResponse) {
                        // Allow a successful correction at this stage to notify sucessCallback.
                        (success || noop)(newResponse, Resource.store.getHeaders(value));
                        return newResponse;
                    });
                }

                // Error Correcction methods
                function chooseErrorResponsePromiseChain(response) {
                    if (angular.isDefined(response) && angular.isObject(response) && angular.isObject(response.$correction)) {
                        correctSettings(value, response.$correction);
                        var refreshed = value.$refresh();
                        Resource.store(value, { refreshedAs: refreshed });
                        return refreshed.$promise.then(allowErrorCorrectionHandler);
                    }
                    if (angular.isDefined(response) && angular.isDefined(response.$value) && response.$correction) {
                        Resource.store(value, { pendingCorrection: response.$correction });
                        response = response.$value;
                    }
                    if (Resource.isResource(response))
                        return response.$promise.then(allowErrorCorrectionHandler);
                    if (angular.isDefined(response) && angular.isFunction(response.then))
                        return response.then(allowErrorCorrectionHandler);
                    return $q.reject(response);
                }

                // Assume a Resource or promise ($http, or $q.resolve) was passed to errorInterceptor or errorCallback
                function allowErrorCorrectionHandler(response) {
                    if (Resource.isResource(response)) {
                        Resource.store.copyHeaders(value, response);
                        if (Resource.store.pendingCorrection(value))
                            correctSettings(value, response);
                        Resource.store(value, { preventErrorLooping: false });
                        shallowClearAndCopy(response, value);
                        return value;
                    }
                    if (angular.isDefined(response) && angular.isObject(response) && angular.isFunction(response.headers)) {
                        return $q.when(response).then(httpSuccessHandler);
                    }
                    return $q.when({ data: response, headers: function() { return null; }}).then(httpSuccessHandler);
                }

                function correctSettings(target, settings) {
                    if (Resource.isResource(settings))
                        settings = Resource.store.getConfig(settings);
                    angular.extend(actions, settings.actions || { });
                    angular.extend(paramDefaults, settings.paramDefaults || { });
                    angular.extend(options, settings.options || { });
                    if (angular.isDefined(settings.url) && angular.isString(settings.url))
                        url = settings.url;
                    route = new Route(url, options);
                    Resource.store(value, {
                        config: {
                            url: url,
                            paramDefaults: paramDefaults,
                            actions: actions,
                            options: options,
                        },
                        pendingCorrection: false,
                    });
                    return true;
                }

                var promise = $http(httpConfig)
                    .then(httpSuccessHandler, httpErrorHandler)         // Http response phase (transform response into final Resource object and call interceptors)
                    .then(callbackSuccessHandler, callbackErrorHandler);// Callback phase (errorCallback has opportrunity to address issues from errors being thrown in http response phase)

                if (!isInstanceCall) {
                    // we are creating instance / collection
                    // - set the initial promise
                    // - return the instance / collection
                    value.$promise = promise;
                    value.$resolved = false;
                    Resource.store(value, {
                        config: {
                            url: url,
                            paramDefaults: paramDefaults,
                            actions: actions,
                            options: options,
                        },
                    });
                    return value;
                }

                // instance call
              return promise;
            };


            Resource.prototype['$' + name] = function(params, success, error) {
              if (isFunction(params)) {
                error = success;
                success = params;
                params = {};
              }
              var result = Resource[name].call(this, params, this, success, error);
              return result.$promise || result;
            };
          });

          var oldOdataResource = Resource.odata;
          Resource.odata = function (persistence) {
              var onQuery = function(queryString, success, error, isSingleElement, forceSingleElement, _persistence) {
                  return oldOdataResource({}, {}, success, error, true, queryString, isSingleElement, forceSingleElement, _persistence);
              };

              var odataProvider = new $odata.Provider(onQuery, options.isodatav4, this.$refresh ? this.$refresh.$$persistence : null);
              return options.persistence ? odataProvider.re() : odataProvider;
          };

          var addRefreshMethod = function (target, persistence, full) {
                full = typeof full === 'boolean' ? full : true;
                if (angular.isDefined(target) && angular.isDefined(persistence)) {
                    var refreshFn = refreshData.bind(target);
                    refreshFn.$$persistence = angular.isFunction(persistence) ? persistence(full) : persistence;
                    Object.defineProperty(target, '$refresh', { enumerable: false, configurable: true, writable: true, value: refreshFn });
                }
            };

            var refreshData = function refreshData(success, error) {
                var onQuery = function(queryString, success, error, isSingleElement, forceSingleElement, _persistence) {
                    return oldOdataResource({}, {}, success, error, true, queryString, isSingleElement, forceSingleElement, _persistence);
                };
                var odataProvider = new $odata.Provider(onQuery, options.isodatav4, this.$refresh.$$persistence);
                odataProvider = odataProvider.re();

                // Single and Count are special, so rerun them.
                if (this.$refresh.$$persistence.$$type == 'count') {
                    return odataProvider.count();
                }
                if (this.$refresh.$$persistence.$$type == 'single') {
                    return odataProvider.single();
                }

                var queryString = odataProvider.execute();

                var multiple = this instanceof Array;
                // Refresh a normal Resource or Array of Resources
                return Resource[multiple ? 'query' : 'get'].call(undefined, {}, multiple ? {} : this, success, error, multiple, (!multiple? '?' : '') + queryString, !multiple, false, this.$refresh.$$persistence);
            };

          Resource.bind = function(additionalParamDefaults) {
            return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
          };

          return Resource;
        }

        return resourceFactory;
      }
    ];
  });


})(window, window.angular);
