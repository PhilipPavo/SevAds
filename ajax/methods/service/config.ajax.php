<?php
	$config = R::get('config');
	$c = array(
		"cats" => $config['ad_categories']
	);
	$this->addResponse('config', $c);
?>