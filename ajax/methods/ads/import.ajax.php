<?php
	$in = $this->get_input(array('service_token'));
	$c = R::get('config');
	$posts = R::get('vk')->api('wall.get', array(
		'owner_id' => -$c['group_id'],
		'count' => 30
	), $in['service_token']);
	$posts = $posts['response']['items'];
	
	$ads = R::get('db')->getRows('ads', array(
		'imported' => 1,
	), array(
		'order' => 'id',
		'desc' => true,
		'limit' => 1
	)); 
	$category = count($c['ad_categories']) - 1;
	$add = array();
	for($i = 0; $i < count($posts); $i++){
		$src = $posts[$i]['owner_id'].'_'.$posts[$i]['id'];
		
		if(count($ads) && $src == $ads[0]['source']) {
			break;
		}
		if(isset($posts[$i]['is_pinned']) && $posts[$i]['is_pinned'] === 1) continue;
		array_push($add, array(
			"owner_id" => isset($posts[$i]['signer_id']) ? $posts[$i]['signer_id'] : 0,
			"title" => "",
			"text" => $posts[$i]['text'],
			"category" => $category,
			"tags"=> "[]",
			"imported" => 1,
			"source" => $src
		));
	}
	for($i = count($add)-1; $i >=0; $i--){
		Ad::create($add[$i]);
	}
?>