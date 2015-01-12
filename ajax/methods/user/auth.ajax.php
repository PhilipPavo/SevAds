<?php
	R::get('user')->update_visit();
	$this->addResponse('user', R::get('user')->data);
?>