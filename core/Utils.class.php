<?php
	class Utils{
		public static function parse_config($c){
			$c_p = array();
			foreach($c as $v){
				$p = json_decode($v['value'], true);
				$c_p[$v['k']] = $p ? $p : $v['value'];	
			}
			return $c_p;
		}
		public static function change_service_token(){
			$c = R::get('service_token');
			$n = ($c+1 === count(R::get('config')['service_tokens']) ? 0 : $c+1);
			R::set('service_token', $n);
		}
		public static function update_config($c, $k, $v){
			R::get('db')->updateRow($c, array(
					"k" => $k
				),
				array(
					"value" => $v
				)
			);
		}
		public static function get_ip() {
	        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
	            $ip = $_SERVER['HTTP_CLIENT_IP'];
	        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
	            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	        } else {
	            $ip = $_SERVER['REMOTE_ADDR'];
	        }
	        return $ip;
	    }
		public static function ping_domain($domain, $port) {
			if(!$port) $port = 80;
	        $starttime = microtime(true);
	        $file      = fsockopen($domain, $port, $errno, $errstr, 10);
	        $stoptime  = microtime(true);
	        $status    = 0;
	        if (!$file)
	            $status = -1;
	        else {
	            fclose($file);
	            $status = ($stoptime - $starttime) * 1000;
	            $status = floor($status);
	        }
	        return $status;
	    }
	}
?>