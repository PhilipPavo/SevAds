<?php
	$in = $this->get_input(array("ad_id", "title", "text", "category", "tags"));
	if(strlen($in['title']) < 4 || strlen($in["text"]) < 6) $this->error(444);
	$ad = Ad::get($in['ad_id']);
	if(R::get('user')->data['id'] !== $ad['owner_id'] && !(R::get('user')->data['rights'] & 2)) $this->error(445);
	
	$data = array(
		"title" => $in['title'],
		"text" => $in['text'],
		"category" => $in['category'],
		"tags" => $in['tags']
	);
	$r = Ad::edit($in['ad_id'], $data);
	$this->addResponse("r", $r);
?>