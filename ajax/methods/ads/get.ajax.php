<?php
	$in = $this->get_input(array('category', 'owner_id'));
	$p = array(
		"display" => 1
	);
	if($in['category'] !== -1) $p['category'] = $in['category'];
	if($in['owner_id']) $p['owner_id'] = $in['owner_id'];
	$r = R::get('db')->getRows('ads', $p, array(
		'order' => 'id',
		'desc' => true
	));
	$ids = array();
	$faves = json_decode(R::get('user')->data['faves']);
	for($i = 0; $i < count($r); $i++){
		if(in_array($r[$i]['id'], $faves)) $r[$i]['is_fave'] = true;
 		if(!in_array($r[$i]['owner_id'], $ids)) array_push($ids, $r[$i]['owner_id']);
	}
	$this->addResponse('ads', $r);
	$this->addResponse('ids', $ids);
?>