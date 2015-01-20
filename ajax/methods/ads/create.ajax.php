<?php
	$in = $this->get_input(array("title", "text", "category", "tags"));
	if(strlen($in['title']) < 4 || strlen($in["text"]) < 6) $this->error(444);
	$ad = array(
		"owner_id" => R::get('user')->data['id'],
		"title" => $in['title'],
		"text" => $in['text'],
		"category" => $in['category'],
		"tags" => $in['tags']
	);
	$r = Ad::create($ad);
	$this->addResponse("r", $r);
?>