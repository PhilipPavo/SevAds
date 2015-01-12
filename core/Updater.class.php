<?php
	class Updater{
		static function state($p = false){
			$s = Utils::parse_config(R::get('db')->getRows('updater'));
			return $p ? $s[$p] : $s;
		}
		static function set($v){
			Utils::update_config('updater', 'started', $v ? 1 : 0);
			Updater::update_time();
		}
		static function started(){
			return !!Updater::state('started');
		}
		static function can_start(){
			if(Updater::started()) return false;
			$current = time();
			$updated = Updater::state('updated') + R::get('config')['update_time'] * 60;
			if($current <= $updated) return false;
			return true;
		}
		static function add_request($c = 1){
			Utils::update_config('updater', 'requests', Updater::state('requests') + $c);
			Updater::update_time();
		}
		static function update_time(){
			Utils::update_config('updater', 'updated', time());
		}
		static function log($msg){
			
		}
	}
?>