<?php
	$in = $this->get_input(array("ad_id"));
	$ad = Ad::get($in['ad_id']);
	if(R::get('user')->data['id'] !== $ad['owner_id']) $this->error(445);
	
	$r = Ad::restore($in['ad_id']);
	$this->addResponse("r", $r);
?>
