<?php
	$in = $this->get_input(array('ad_id'));
	$faves = json_decode(R::get('user')->data['faves']);
	if(($k = array_search($in['ad_id'], $faves)) !== false){
		unset($faves[$k]);
		$faves = array_values($faves); 	
	}else{
		array_push($faves, $in['ad_id']);
	}
	R::get('user')->set_faves($faves);
	$this->addResponse('is_fave', $k === false);
?>