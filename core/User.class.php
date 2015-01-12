<?php
	class User{
		public $data = array();
		public $rights_mask = array();
		function __construct(){
			$mask = array();
			$c = R::get('config');
			$rights = $c['user_rights'];
			for($i = 0; $i < count($rights); $i++){
				$mask[$rights[$i]] = 1 << $i;
			}
			$mask['ALL'] = array_sum($mask);
			$this->rights_mask = $mask;
		}
		function auth($id, $key){
			$c = R::get('config');
			if($key !== md5($c['app_id'].'_'.$id.'_'.$c['app_secret'])) return false;
			$data = R::get('db')->getRow('users', array('id'=> $id));
			if(!$data) $data = $this->create(array(
				'id' => $id,
				'class' => $c['default_class'],
				'faves' => json_encode(array()),
				'ip' => Utils::get_ip()
			));
			$data['rights'] = $this->get_right_mask($data['class']);
			$this->data = $data;
			return $data;
		}
		function get_right_mask($class){
			$c = R::get('config');
			$rights = $c['user_classes'][$class]['rights'];
			$mask = 0;
			for($i = 0; $i < count($rights); $i++){
				$mask += $this->rights_mask[$rights[$i]];
			}
			return $mask;
		}
		static function _isset($id){
			return $r = R::get('db')->getRow('users', array('id' => $id)) ? $r : false;
		}
		static function get_config($id){
			$c = R::get('config');
			return $c['user_classes'][$this->get_class()];
		}
		static function is_admin($id){
			$c = R::get('config');
			$c = $c['admins'];
			for($i = 0; $i < count($c); $i++){
				if($id == $c[$i]) return true;	
			}
			return false;
		}
		function create($d){
			$d['visits'] = 0; 
			R::get('db')->insertRow('users', $d);
			return $d;
		}
		function update_visit(){
			R::get('db')->updateRow('users', array(
				'id' => $this->data['id']
			), array(
				'visits' =>  $this->data['visits'] + 1
			));	
		}
		function set_faves($f){
			R::get('db')->updateRow('users', array(
				'id' => $this->data['id']
			), array(
				'faves' =>  json_encode($f)
			));	
		}
	}
?>