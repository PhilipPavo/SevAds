/*
	Copyright (c) Pavo Philip 2014-2015
	@Catns
*/
var controllers = {
	main : function($rootScope, $scope, AJAX, $route, $modal){
		$scope.user = $rootScope.user;
		$scope.current = {};
		$scope.ads = [];
		$scope.profiles = [];
		$scope.loaded = 10;
		$scope.is_loading = false;
		$scope.tags = $rootScope.config.tags;
		
		$scope.moderation = function(v){
			$rootScope.user.moderation = v;
		};
		VK.addCallback('onSettingsChanged', function(r){
			$scope.user.menu = !!(r & 256);
			$scope.$apply();
		});
		VK.addCallback('onScroll', function(scrollTop, windowHeight){
			if((windowHeight + scrollTop) > window.innerHeight){
				if( !$scope.current.items || $scope.loaded > $scope.current.items.length) return;
				$scope.loaded += 10;
				$scope.$apply();
			}
		});
		VK.callMethod('scrollSubscribe', false);
		$scope.menu_add = function(){
			VK.callMethod('showSettingsBox', 256);
		};
		$scope.categories = {
			
		};
		$scope.sections = [
			{
				title: "Продам",
				id: 'sell',
				is_category: true,
				f: function(item){
					return item.category == 'sell';
				},
				icon: 'social-usd',
				style: 'green',
				size: 'big',
				selected: false
			},
			{
				title: "Куплю",
				id: 'buy',
				is_category: true,
				f: function(item){
					return item.category == 'buy';
				},
				icon: 'ios-cart',
				style: 'blue',
				size: 'big',
				selected: false
			},
			{
				title: "Услуги",
				id: 'services',
				is_category: true,
				f: function(item){
					return item.category == 'services';
				},
				icon: 'android-done-all',
				style: 'orange',
				size: 'big',
				selected: false
			},
			{
				title: "Вакансии",
				id: 'job',
				is_category: true,
				f: function(item){
					return item.category == 'job';
				},
				icon: 'briefcase',
				style: 'purple',
				size: 'medium',
				selected: false
			},
			{
				title: "Ищу ...",
				id: 'find',
				is_category: true,
				f: function(item){
					return item.category == 'find';
				},
				icon: 'ios-search-strong',
				style: 'red',
				size: 'medium',
				selected: false
			},
			{
				title: "Другое",
				id: 'other',
				is_category: true,
				f: function(item){
					return item.category == 'other';
				},
				icon: 'android-more-horizontal',
				style: 'cyan',
				size: 'medium',
				selected: false
			},{
				title: "Все объявления",
				id: 'all',
				f: function(item){
					return true;
				},
				icon: 'ios-list-outline',
				style: 'blue',
				size: 'mini',
				selected: false
			},
			{
				title: "Мои закладки",
				id: 'favorites',
				f: function(item){
					return item.is_fave;
				},
				icon: 'android-favorite',
				style: 'red',
				size: 'mini',
				selected: false
			},
			{
				title: "Мои объявления",
				id: 'my',
				f: function(item){
					if(!item.profile) return false;
					return item.profile.id == $rootScope.user.id;
				},
				icon: 'ios-compose-outline',
				style: 'green',
				size: 'mini',
				selected: false
			}
		];
		for(var i = 0; i < $scope.sections.length; i++){
			$scope.categories[$scope.sections[i].id] = $scope.sections[i];
		}
		$scope.init = function(ads, profiles){
			if(ads) $scope.ads = ads;
			if(profiles) $scope.profiles = profiles;
			$scope.current.items = [];
			for(var j = 0; j < $scope.ads.length; j++){
				var c = $scope.categories[$scope.ads[j].category];
				$scope.ads[j].category_data = {
					style: c.style,
					icon: c.icon,
					title: c.title,
					id: c.id
				}
				$scope.ads[j].tags = $scope.ads[j].tags ? angular.fromJson($scope.ads[j].tags) : [];
				$scope.ads[j].profile = $scope.ads[j].owner_id != 0 ? $scope.profiles['id' + $scope.ads[j].owner_id] : $scope.profiles.anonymous;
				if($scope.current.f($scope.ads[j]))
					$scope.current.items.push($scope.ads[j]);
			}
		};
		$scope.get = function(owner, category){
			var p = {
				category: category ? category : false,
				owner_id: owner ? owner : false,
			};
			AJAX.post('ads.get', p, function(d){
				VK.api('users.get', {fields: 'photo_100,sex', https: 1, user_ids: d.ids.join(',')}, function(users){
					users = users.response;
					for(var i = 0; i < users.length; i++){
						$scope.profiles['id'+users[i].id] = users[i];
					}
					$scope.profiles['anonymous'] = {
						"first_name" : "Анонимно",
						"last_name" : "",
						"photo_50" : "style/images/camera_50.gif"	
					};
					$scope.init(d.ads);
					$scope.is_loading = false;
					$scope.$apply();
				});
			});
		};
		$scope.fave_callback = function(id, is_fave){
			for(var k = 0; k < $scope.ads.length; k++){
				if($scope.ads[k].id == id) $scope.ads[k].is_fave = is_fave;
			}
			$scope.init();
		};
		$scope.on_remove = function(id){
			for(var k = 0; k < $scope.ads.length; k++){
				if($scope.ads[k].id == id) $scope.ads.splice(k, 1);
			}
			$scope.init();
		};
		$scope.edit = function(ad){
			
		};
		$scope.selectSection = function(c){
			$scope.is_loading = true;
			$scope.loaded = 10;
			$scope.current = c;
			$scope.ads = [];
			$scope.current.items = [];
			$scope.get(c.id === 'my' ? $scope.user.id : false, c.is_category ? c.id : false);
			//VK.callMethod("scrollWindow", 0, 600);
		};
		
		$scope.editor = {
			opened: false,
			edit: false,
			save: function(data){
				if(data.title.length < 4 || data.text.length < 8) return;
				if(!$scope.editor.edit) 
					AJAX.post('ads.create', {
						title: data.title,
						text: data.text,
						category: data.category_data.id,
						tags: angular.toJson(data.tags)
					}, function(d){
						$scope.editor.close();
						$scope.get(false);
					});
				else 
					AJAX.post('ads.edit', {
						ad_id: data.id,
						title: data.title,
						text: data.text,
						category: data.category_data.id,
						tags: angular.toJson(data.tags)
					}, function(d){
						$scope.editor.close();
						//$scope.get(false);
					});
			},
			open: function(data){
				//if($scope.editor.opened && !data) return;
				if(data){
					$scope.editor.data = data;
					$scope.editor.edit = true;
				}else{
					//var c = $scope.current;
					$scope.editor.edit = false;
					var c = $scope.categories['other'];
					$scope.editor.data = {
						category_data: {
							icon: c.icon,
							style: c.style,
							title: c.title,
							id: c.id
						},
						owner_id: $scope.user.id,
						profile: $scope.user.profile,
						tags: [],
						text: "",
						title: ""
					};
					$scope.editor.data.profile = $scope.user.profile;
				}
				$scope.editor.opened = true;
			},
			close: function(){
				$scope.editor.opened = false;
				console.log($scope.editor.data_empty);
				$scope.editor.data = $scope.editor.data_empty;
			}
		};
		$scope.create = function(){
			$scope.editor.open();
		};
		$scope.selectSection($scope.categories['all']);
	}	
};
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
				VK.api('friends.getAppUsers', {}, function(data){
					VK.api('users.get', {user_ids: data.response.join(','), fields: "", https: 1}, function(data){
						console.log(data);
					});
				});
				VK.api('users.get', {fields: "photo_100, sex", https: 1}, function(data){
					$rootScope.user.profile = data.response[0];
				});
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
		VK.callMethod("resizeWindow", 650, h);
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
app.directive('moduleDa', function() {
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
app.directive('moduleDaEditor', function() {
    return {
        templateUrl: 'modules/ad-editor.html',
        restrict: 'E',
        scope: { data: '=', close: '=',categories: '=', tags: '=',save: "=" },
        controller: function($rootScope, $scope, $element, $attrs, $transclude, AJAX) {
			$scope.addTag = function(i){
				if($scope.data.tags.indexOf($scope.tags[i].title) !==-1) return;
				$scope.data.tags.push($scope.tags[i].title);	
			};
			$scope.removeTag = function(i){
				$scope.data.tags.splice(i, 1);
			}
			$scope.changeCategory = function(c){
				c = $scope.categories[c];
				$scope.data.category_data = {
					icon: c.icon,
					style: c.style,
					title: c.title,
					id: c.id
				};
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
			//if(height < 960) height = 900;
			UTILS.setWindowHeight(height + 70);
        });
    }
  };
});