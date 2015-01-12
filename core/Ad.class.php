<?php
	class Ad{
		public static function get($id, $owner_id = false){
			if($owner_id) return R::get('db')->getRows('ads', array(
				"owner_id" => $owner_id
			));
			if($id) return R::get('db')->getRow('ads', array(
				"id" => $id
			));
			return false;
		}
		public static function create($d){
			return R::get('db')->insertRow('ads', $d);
		}
		public static function edit($id, $data){
			$r = R::get('db')->updateRow('ads', array(
				"id" => $id
			), $data);
			return $r;
		}
		public static function remove($id){
			R::get('db')->updateRow('ads', array(
				"id" => $id
			), array(
				"display" => 0
			));
		}
		public static function restore($id){
			R::get('db')->updateRow('ads', array(
				"id" => $id
			), array(
				"display" => 1
			));
		}
	}
?>