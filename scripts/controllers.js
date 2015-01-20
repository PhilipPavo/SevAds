//Philip Pavo 2014 Leet@Catns
var controllers = {
	loading: function(){
		
	},
	main: function($rootScope, $scope, AJAX, $route, $modal){
		$scope.user = $rootScope.user;
		$scope.current = {
		};
		$scope.ads = [];
		$scope.profiles = [];
		$scope.loaded = 10;
		$scope.cats = $rootScope.config.cats;
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
		
		$scope.sections = [
			{
				title: "Продам",
				id: 'sell',
				f: function(item){
					return item.category == 'sell';
				},
				icon: 'social-usd-outline',
				style: 'green',
				size: 'big',
				selected: false
			},
			{
				title: "Куплю",
				id: 'buy',
				f: function(item){
					return item.category == 'buy';
				},
				icon: 'ios-cart-outline',
				style: 'blue',
				size: 'big',
				selected: false
			},
			{
				title: "Услуги",
				id: 'services',
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
				f: function(item){
					return item.category == 'other';
				},
				icon: 'android-more-horizontal',
				style: 'cyan',
				size: 'medium',
				selected: false
			}
		];
		$scope.init = function(ads, profiles){
			if(ads) $scope.ads = ads;
			if(profiles) $scope.profiles = profiles;
			$scope.current.items = [];
			for(var j = 0; j < $scope.ads.length; j++){
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
				VK.api('users.get', {fields: 'photo_50,sex', https: 1, user_ids: d.ids.join(',')}, function(users){
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
			VK.callMethod("scrollWindow", 0);
			$scope.box_open('edit', {ad: ad});	
		};
		$scope.selectSection = function(c){
			$scope.loaded = 10;
			$scope.current = c;
			$scope.get(false);
			VK.callMethod("scrollWindow", 0, 600);
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
		$scope.selectSection($scope.sections[0]);
	}
}