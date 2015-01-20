<?php
	class VK{
		public static $app_id = 4261581;
		public static $secret = '';
		public static $api_version = '5.25';
		public $token;
		public function __construct($token){
			$this-> token = $token;
		}
		public static function api($m, $d, $token = false){
			$c = R::get('config');
			if($token) $d['access_token'] = $token;
			$d['v']=VK::$api_version;
			$d['https'] = 1;
			$resp = VK::post('https://api.vk.com/method/'.$m, $d);
			return $resp;
		}
		public static function method($m, $d){
			
		}
		public function api_call($method, $data = array(), $decode = true){
			$data['access_token'] = $this->token;
			$data['v']=$this->api_version;
			$data['https'] = 1;
			$resp = $this->post('https://api.vk.com/method/'.$method, $data);
			if($decode && $resp){
				if(array_key_exists('response', $resp)){
					return $resp['response'];
				}
			}
			return $resp;
		}
		public function check_token($t){
			$this->token = $t;
			$r = $this->api_call('users.get')[0]['id'] || false;
			return $r;
		}
		public function auth($code){
			$r = file_get_contents("https://oauth.vk.com/access_token?client_id=".$this->app_id."&client_secret=".$this->secret."&code=".$code."&redirect_uri=https://phily.azurewebsites.net/apps/pr/auth.php");
		
			$r = json_decode($r, true);
			
			if(!$r || !$r['access_token']) return false;
			else return $r;
		}
		static function post($link,$data){
			R::set('counter', R::get('counter')+1);
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $link);
			curl_setopt($ch, CURLOPT_HEADER, false);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0); 
			$response = curl_exec($ch);
			curl_close($ch);
			return json_decode($response, true);
		}
	}
	class Wall{
		static function get_posts($d){
			if(!isset($d['count'])) $d['count'] = 100;
			$r = VK::api('execute.getAllPosts', $d);
			if(!isset($r['response'])) return false;
			return $r['response'];
		}
	}
	class Post{
		static function get_attachments($post, $filter = false){
			if(!isset($post['attachments'])) return false;
			if(!$filter) return $post['attachments'];
			$a = array();
			foreach($post['attachments'] as $item){
				if($item['type'] == $filter) array_push($a, $item[$filter]);
			}
			if(count($a) === 0) return false;
			return $a;
		}
		static function get_comments($p){
			$r = VK::api('execute.getAllPostComments', array(
				"post_id" => $p['id'],
				"owner_id" => $p['owner_id']
			));
			return isset($r['response']) ? $r['response'] : array();
		}
	}
	class Comment{
		static function get_link($obj, $c){
			return $obj['type'].$obj['owner_id'].'_'.$obj['id'].'?reply='.$c['id'];
		}
		static function get_from_obj($obj){
			if(!$obj) return array();
			$c_d = array();
			if(isset($obj['post_type'])){
				$obj['type'] = 'wall';	
				$c = Post::get_comments($obj);
			}else {
				$obj['type'] = 'video';
				$c = Video::get_comments($obj);
			}
			for($i =0; $i< count($c); $i++){
				$c_d[] = Comment::get_data($obj, $c[$i]);
			}
			return $c_d;
		}
		static function get_data($obj, $c){
			if(!isset($c['likes'])) $c['likes'] = -1;
			return array(
				"link" =>  Comment::get_link($obj, $c),
				"author" => $c['from_id'],
				"text" => $c['text'],
				"likes" =>gettype($c['likes']) === 'integer' ? $c['likes'] : $c['likes']['count']
			);
		}
		static function isset_link($l){
			return !!R::get('db')->getRow('comments', 'link', $l);
		}
		static function update($c){
			return R::get('db')->insertRows('comments', $c);
			$limit = 300;
			$count = intval(count($c) / $limit);
			for($i=0; $i <= $count; $i++){
				echo "300 $i done ".time()."\n";
				R::get('db')->insertRows('comments', array_slice($c, $i * $limit, $limit));
			}
		}
		static function create($c, $l){
			return R::get('db')->insertRow('comments', array(
				"link" => $l,
				"author" => $c['from_id'],
				"text" => $c['text'],
				"likes" => $c['likes']['count']
			));
		}
	}
	class Video{
		static function is_trailer($v){
			if($v['duration'] <= 180) return true;
			else return false;
		}
		static function get_comments($v){
			$r = VK::api('execute.getAllVideoComments', array(
				"video_id" => $v['id'],
				"owner_id" => $v['owner_id']
			));
			return isset($r['response']) ? $r['response'] : array();
		}
		static function update($v){
			return R::get('db')->updateRow('videos',
				array("id" => Video::get_id($v)),
				array(
					"comments" => json_encode($v['comments'], JSON_UNESCAPED_UNICODE)
				)
			);
		}
		static function create($v){
			return R::get('db')->insertRow('videos', array(
				"id" => Video::get_id($v),
				"trailer_id" => $v['trailer'] ? Video::get_id($v['trailer']) : 0,
				"owner_id" => $v['owner_id'],
				"title" => $v['title'],
				"comments" => json_encode($v['comments'], JSON_UNESCAPED_UNICODE)
			));
		}
		static function isset_id($v){
			return !!R::get('db')->getRow('videos', 'id', Video::get_id($v));
		}
		static function get_id($v){
			return $v['owner_id']."_".$v['id'];
		}
	}
?>