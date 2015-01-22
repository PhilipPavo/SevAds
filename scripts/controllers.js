//Philip Pavo 2014 Leet@Catns
var controllers = {
	loading: function(){
		
	},
	main: function($rootScope, $scope, AJAX, $route, $modal){
		$scope.user = $rootScope.user;
		$scope.current = {};
		$scope.ads = [];
		$scope.profiles = [];
		$scope.loaded = 10;
		$scope.tags = $rootScope.config.tags;
		console.log($scope.tags);
		$scope.moderation = function(v){
			$rootScope.user.moderation = v;
		};
		VK.addCallback('onScroll', function(scrollTop, windowHeight){
				
		});
		VK.addCallback('onSettingsChanged', function(r){
			console.log(r);
			$scope.user.menu = !!(r & 256);
			$scope.$apply();
		});
		VK.addCallback('onScroll', function(scrollTop, windowHeight){
			if((windowHeight + scrollTop) > window.innerHeight){
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
		$scope.get = function(owner){
			var p = {
				category: -1,
				owner_id: owner ? owner: 0
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
			$scope.loaded = 10;
			$scope.current = c;
			$scope.ads = [];
			$scope.get(false);
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
		$scope.boxes = {
			create: {
				size: '',
				controller: function($scope, $modalInstance, data, $sce) {
					$scope.ad = data.ad;
					
					$scope.ok = function() {
						if($scope.ad.title.length < 4 || $scope.ad.text.length < 8) return;
						AJAX.post('ads.create', $scope.ad, function(d){
							console.log(d);
						});
						$modalInstance.close($scope.ad);
					};
	
					$scope.cancel = function() {
						$modalInstance.dismiss('cancel');
					};
				},
				on_open: function(){
					return {ad: {
						title: "",
						text: "",
						category: 0
					}};
				},
				on_close: function(response){
					console.log(response);
				}
			},
			edit: {
				size: '',
				controller: function($scope, $modalInstance, data, $sce) {
					$scope.ad = data.ad;
					
					$scope.ok = function() {
						if($scope.ad.title.length < 4 || $scope.ad.text.length < 8) return;
						var d = $scope.ad;
						d.ad_id = d.id;
						AJAX.post('ads.edit', d, function(d){
							console.log(d);
						});
						$modalInstance.close($scope.ad);
					};
	
					$scope.cancel = function() {
						$modalInstance.dismiss('cancel');
					};
				},
				on_open: false,
				on_close: function(response){
					console.log(response);
				}
			}
		}
		
		$scope.box_open = function(box, p) {
			var instance = $modal.open({
				templateUrl: box,
				controller: $scope.boxes[box].controller,
				size: $scope.boxes[box].size,
				resolve: {
					data: $scope.boxes[box].on_open ? $scope.boxes[box].on_open : function () {
						return p;
					}
				}
			});
			instance.result.then(function(r) {
				$scope.boxes[box].on_close(r);
				$scope.get(false);
			}, function() {
				
			});
		};
		$scope.selectSection($scope.categories['all']);
	}
}