!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.gaApiUtils=e()}}(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){function AccountSummaries(accounts){this.accounts_=accounts;this.webProperties_=[];this.profiles_=[];this.accountsById_={};this.webPropertiesById_=this.propertiesById_={};this.profilesById_=this.viewsById_={};for(var i=0,account;account=this.accounts_[i];i++){this.accountsById_[account.id]={self:account};if(!account.webProperties)continue;alias(account,"webProperties","properties");for(var j=0,webProperty;webProperty=account.webProperties[j];j++){this.webProperties_.push(webProperty);this.webPropertiesById_[webProperty.id]={self:webProperty,parent:account};if(!webProperty.profiles)continue;alias(webProperty,"profiles","views");for(var k=0,profile;profile=webProperty.profiles[k];k++){this.profiles_.push(profile);this.profilesById_[profile.id]={self:profile,parent:webProperty,grandParent:account}}}}}AccountSummaries.prototype.all=function(){return this.accounts_};alias(AccountSummaries.prototype,"all","allAccounts");AccountSummaries.prototype.allWebProperties=function(){return this.webProperties_};alias(AccountSummaries.prototype,"allWebProperties","allProperties");AccountSummaries.prototype.allProfiles=function(){return this.profiles_};alias(AccountSummaries.prototype,"allProfiles","allViews");AccountSummaries.prototype.get=function(obj){if(!!obj.accountId+!!obj.webPropertyId+!!obj.propertyId+!!obj.profileId+!!obj.viewId>1){throw new Error("get() only accepts an object with a single "+'property: either "accountId", "webPropertyId", "propertyId", '+'"profileId" or "viewId"')}return this.getProfile(obj.profileId||obj.viewId)||this.getWebProperty(obj.webPropertyId||obj.propertyId)||this.getAccount(obj.accountId)};AccountSummaries.prototype.getAccount=function(accountId){return this.accountsById_[accountId]&&this.accountsById_[accountId].self};AccountSummaries.prototype.getWebProperty=function(webPropertyId){return this.webPropertiesById_[webPropertyId]&&this.webPropertiesById_[webPropertyId].self};alias(AccountSummaries.prototype,"getWebProperty","getProperty");AccountSummaries.prototype.getProfile=function(profileId){return this.profilesById_[profileId]&&this.profilesById_[profileId].self};alias(AccountSummaries.prototype,"getProfile","getView");AccountSummaries.prototype.getAccountByProfileId=function(profileId){return this.profilesById_[profileId]&&this.profilesById_[profileId].grandParent};alias(AccountSummaries.prototype,"getAccountByProfileId","getAccountByViewId");AccountSummaries.prototype.getWebPropertyByProfileId=function(profileId){return this.profilesById_[profileId]&&this.profilesById_[profileId].parent};alias(AccountSummaries.prototype,"getWebPropertyByProfileId","getPropertyByViewId");AccountSummaries.prototype.getAccountByWebPropertyId=function(webPropertyId){return this.webPropertiesById_[webPropertyId]&&this.webPropertiesById_[webPropertyId].parent};alias(AccountSummaries.prototype,"getAccountByWebPropertyId","getAccountByPropertyId");function alias(object,referenceProp,aliasName){if(Object.defineProperty){Object.defineProperty(object,aliasName,{get:function(){return object[referenceProp]}})}else{object[aliasName]=object[referenceProp]}}module.exports=AccountSummaries},{}],2:[function(require,module,exports){var AccountSummaries=require("./account-summaries");var API_PATH="/analytics/v3/management/accountSummaries";var cache;function requestAccountSummaries(){var promise=gapi.client.request({path:API_PATH}).then(function(resp){return resp});return new promise.constructor(function(resolve,reject){var summaries=[];promise.then(function fn(resp){var result=resp.result;if(result.items){summaries=summaries.concat(result.items)}else{reject(new Error("You do not have any Google Analytics accounts. "+"Go to http://google.com/analytics to sign up."))}if(result.startIndex+result.itemsPerPage<=result.totalResults){gapi.client.request({path:API_PATH,params:{"start-index":result.startIndex+result.itemsPerPage}}).then(fn)}else{resolve(new AccountSummaries(summaries))}}).then(null,reject)})}module.exports={get:function(noCache){if(noCache)cache=null;return cache||(cache=requestAccountSummaries())}}},{"./account-summaries":1}],3:[function(require,module,exports){var Metadata=require("./metadata");var cache={};function clone(obj){return JSON.parse(JSON.stringify(obj))}function requestColumns(){var key="columns";if(cache[key])return cache[key];return cache[key]=gapi.client.request({path:"/analytics/v3/metadata/ga/columns",params:{reportType:"ga"}})}function requestCustomMetrics(accountId,propertyId){var key="customMetrics:"+accountId+":"+propertyId;if(cache[key])return cache[key];return cache[key]=gapi.client.request({path:"/analytics/v3/management/accounts/"+accountId+"/webproperties/"+propertyId+"/customMetrics"})}function requestCustomDimensions(accountId,propertyId){var key="customDimensions:"+accountId+":"+propertyId;if(cache[key])return cache[key];return cache[key]=gapi.client.request({path:"/analytics/v3/management/accounts/"+accountId+"/webproperties/"+propertyId+"/customDimensions"})}function requestGoals(accountId,propertyId,viewId){var key="goals:"+accountId+":"+propertyId+":"+viewId;if(cache[key])return cache[key];return cache[key]=gapi.client.request({path:"/analytics/v3/management/accounts/"+accountId+"/webproperties/"+propertyId+"/profiles/"+viewId+"/goals"})}function populateColumns(columns,customMetrics,customDimensions,goals,isPremium){var newColumns=[];columns.forEach(function(column,i){if(column.attributes.minTemplateIndex){if(column.id=="ga:metricXX"){customMetrics.forEach(function(customMetric,i){var newColumn=clone(column);newColumn.id=customMetric.id;newColumn.attributes.uiName=customMetric.name+" (Custom Metric "+(i+1)+")";newColumns.push(newColumn)})}else if(column.id=="ga:dimensionXX"){customDimensions.forEach(function(customDimension,i){var newColumn=clone(column);newColumn.id=customDimension.id;newColumn.attributes.uiName=customDimension.name+" (Custom Dimension "+(i+1)+")";newColumns.push(newColumn)})}else if(/goal/i.test(column.id)){goals.forEach(function(goal){var newColumn=clone(column);newColumn.id=column.id.replace("XX",goal.id);newColumn.attributes.uiName=goal.name+" "+"("+column.attributes.uiName.replace("XX",goal.id)+")";newColumns.push(newColumn)})}else{var min=isPremium?+column.attributes.premiumMinTemplateIndex:+column.attributes.minTemplateIndex;var max=isPremium?+column.attributes.premiumMaxTemplateIndex:+column.attributes.maxTemplateIndex;for(var i=min;i<=max;i++){var newColumn=clone(column);newColumn.id=column.id.replace("XX",i);newColumn.attributes.uiName=column.attributes.uiName.replace("XX",i);newColumns.push(newColumn)}}}else{newColumns.push(column)}});return newColumns}module.exports={get:function(){return Promise.resolve(requestColumns()).then(function(resp){return new Metadata(resp.result.items)})},getAuthenticated:function(accountId,propertyId,viewId,isPremium){return Promise.all([requestColumns(),requestCustomMetrics(accountId,propertyId),requestCustomDimensions(accountId,propertyId),requestGoals(accountId,propertyId,viewId)]).then(function(responses){var columns=responses[0].result.items;var customMetrics=responses[1].result.items;var customDimensions=responses[2].result.items;var goals=responses[3].result.items;return populateColumns(columns,customMetrics,customDimensions,goals,isPremium)}).then(function(columns){return new Metadata(columns)})},clearCache:function(){cache={}}}},{"./metadata":4}],4:[function(require,module,exports){function Metadata(columns){this._columns=columns;this._metrics=[];this._dimensions=[];this._ids={};this._columns.forEach(function(column){this._ids[column.id]=column.attributes;if(column.attributes.type=="METRIC"){this._metrics.push(column)}else if(column.attributes.type=="DIMENSION"){this._dimensions.push(column)}}.bind(this))}Metadata.prototype.all=function(status){return!status?this._columns:this._columns.filter(function(column){return column.attributes.status.toLowerCase()===status.toLowerCase()})};Metadata.prototype.allMetrics=function(status){return!status?this._metrics:this._metrics.filter(function(metric){return metric.attributes.status.toLowerCase()===status.toLowerCase()})};Metadata.prototype.allDimensions=function(status){return!status?this._dimensions:this._dimensions.filter(function(dimension){return dimension.attributes.status.toLowerCase()===status.toLowerCase()})};Metadata.prototype.get=function(id){return this._ids[id]};module.exports=Metadata},{}],5:[function(require,module,exports){module.exports={accountSummaries:require("./account-summaries"),metadata:require("./metadata")}},{"./account-summaries":2,"./metadata":3}]},{},[5])(5)});