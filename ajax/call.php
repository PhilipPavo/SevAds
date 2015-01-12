<?php
	include('..\core\Database.class.php');
	include('..\core\Utils.class.php');
	include('..\core\User.class.php');
	include('..\core\Ajax.class.php');
	include('..\core\Registry.class.php');
	include('..\core\VK.class.php');
	include('..\core\Ad.class.php');
	include('..\Config.php');
	session_start();
	R::set('db', new Database(DB_TABLE, DB_USERNAME, DB_PASSWORD));
	R::set('config', Utils::parse_config(R::get('db')->getRows('config')));
	R::set('vk', new VK(false));
	R::set('user', new User());
	new Ajax();
?>