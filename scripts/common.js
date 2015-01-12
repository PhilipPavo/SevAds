/*
	Pavo Philip 
	Catns
	
	2014-2015

APP_RIGHTS:
	AUTH 1
	EDIT 2
	RESERVED 4	
*/

var app = angular.module('sev', ['ngRoute', 'ui.bootstrap']);
var run = function($rootScope, UTILS, AJAX, $location, $routeParams) {
	VK.init(function() {
		AJAX.post('service.config', {}, function(d){
			$rootScope.config = d.config;
			AJAX.post('user.auth', {}, function(d){
				if(d.user.rights & 2) d.user.is_admin = true;
				else d.user.is_admin = false;
				$rootScope.user = d.user;
				console.log(d.user);
				VK.api('account.getAppPermissions', {}, function(data){
					var r =data.response & 256;
					$rootScope.user.menu = !!r;
				});
				if(!$rootScope.user || !(d.user.rights & 1)) $location.path("/error").replace();
				else $location.path("/main/cat/-1").replace();
			});
		});
	}, function() { 
		  
	}, '5.26');
};
app.run(run);
app.config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: 'pages/loading.html',
		controller: controllers.loading
	}).when('/main/cat/:cat', {
		templateUrl: 'pages/main.html',
		controller: controllers.main
	}).when('/error', {
		templateUrl: 'pages/error.html',
		controller: controllers.error
	});
});
app.service('UTILS', function ($rootScope) {
	this.setWindowHeight = function(h){
		VK.callMethod("resizeWindow", 800, h);
	};
	this.get_url_params = function(){
		var query_obj = {};
		var get = location.search;
		if (get) {
			var query_arr = (get.substr(1)).split('&');
			var tmp_val;
			for (var i = 0; i < query_arr.length; i++) {
				tmp_val = query_arr[i].split("=");
				query_obj[tmp_val[0]] = tmp_val[1];
			}
		}
		return query_obj;
	}
});
app.service('HTTP', function ($http) {
    this.data2str = function(d){
		var $str = "";
		angular.forEach(d, function(v, k) {
		    $str += k+"="+v+"&";
		});
		return $str;
	};
    this.post = function(u, d, c, f){
        $http({
  			    url: u,
  			    method: "POST",
  			    data: this.data2str(d),
  				headers : {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
                      }
  			}).success(c).error(f ? f : function(d){
        });
    };
    this.get = function (url, js_cb) {
        return $http.jsonp(url+(js_cb ? "&callback=JSON_CALLBACK": ""));
    };
  });
app.service('AJAX', function ($http, $rootScope, UTILS) {
	this.post = function(m, d, c, f){
			var data = UTILS.get_url_params();
			d.method = m;
			d.id = data.viewer_id;
			d.auth_key = data.auth_key;
			$http({
  			    url: 'ajax/call.php',
  			    method: "POST",
  			    data: d
  			}).success(function(d){c(d['response'])});
	}
});
app.directive('moduleAd', function() {
    return {
        templateUrl: 'modules/ad-item.html',
        restrict: 'E',
		replace: true,
        scope: { data: '=', onfave: '=', onremove: '=', edit: '='},
        controller: function($scope, $rootScope, $element, $attrs, $transclude, AJAX) {
			$scope.viewer = $rootScope.user;
			$scope.viewer.moderation = !!$rootScope.user.moderation;
			$scope.fave = function(){
				$scope.data.is_fave = !$scope.data.is_fave;
				AJAX.post('user.setFave', {ad_id: $scope.data.id}, function(d){
					$scope.onfave($scope.data.id, d.is_fave);
				});
			};
			$scope.open_edit = function(){
				$scope.edit($scope.data);
			};
			$scope.remove = function(){
				$scope.data.display = 0;
				AJAX.post('ads.remove', {ad_id: $scope.data.id}, function(d){
					$scope.onremove($scope.data.id);
				});
			};
			$scope.share = function(){
				var msg = $scope.data.title + "\n\n" + $scope.data.text;
				msg += "\n\n Разместил"+($scope.data.profile.sex === 1 ? 'a':'')+" [id"+$scope.data.owner_id+ "|"+$scope.data.profile.first_name + ' '+$scope.data.profile.last_name+ "]\n http://vk.com/app3981889";
				VK.api('wall.post',{message:msg},function(data) { 
					
				});
			}
		}
    }
});
app.directive('moduleAdEditor', function() {
    return {
        templateUrl: 'modules/ad-editor.html',
        restrict: 'E',
        scope: { data: '=' },
        controller: function($rootScope, $scope, $element, $attrs, $transclude, AJAX) {
        	$scope.cats = $rootScope.config.cats;
			$scope.setCat = function(c){
				$scope.data.category = c;
			};
		}
    }
});
app.directive('resizableContent', function($interval, UTILS) {
  return {
    restrict: 'C',
    link: function($scope, element) {
		 $scope.$watch(
        function() {
          return element[0].clientHeight;
        },
        function(height) {
			if(height < 960) height = 900;
			UTILS.setWindowHeight(height + 60);
        });
    }
  };
});