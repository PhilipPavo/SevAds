<?php
	$config = R::get('config');
	$c = array(
		"tags" => $config['tags']
	);
	$this->addResponse('config', $c);
?>