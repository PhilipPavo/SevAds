<?Php
    class Database{
        public $db;
        public function __construct($t, $u, $p){
            try {
                 $this-> db = new PDO(sprintf('mysql:host=%s; dbname=%s; port=3306', 'pavophilip.cloudapp.net', $t), $u, $p,
                 array( PDO:: MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));
            } catch (PDOException $e) {
                die('Database connect eкrror');
        	}
        }
        public function insertRow($table, $data){
            $data_prep = implode(',', array_keys($data));
            $values_prep = array();
            $values =array();
            foreach ($data as $key => $value) {
                $values_prep[]= '?';
                $values[] = $value;
            }
            $values_prep = implode(',', $values_prep);
            $query = $this->db->prepare("INSERT INTO $table ($data_prep) VALUES($values_prep)");
            $query->execute($values);
            return $this->is_success();
        }
        public function insertRows($table, $data){
            if(!count($data)) return;
            $data_prep = implode(',', array_keys($data[0]));
            $values_prep = array();
            $values = array();
            $upd_prep = array();
            foreach($data[0] as $key => $value){
                $upd_prep[] = $key."=VALUES($key)";
            }
            $upd_prep = implode(',', $upd_prep);
            foreach($data as $row){
                $p = array();
                foreach($row as $key => $value){
                    $p[] = '?';
                    $values[] = $value;
                }
                $p = implode(',', $p);
                $values_prep[]= "($p)";
            }
            $values_prep = implode(',', $values_prep);
            $query = $this->db->prepare("INSERT INTO $table ($data_prep) VALUES$values_prep ON DUPLICATE KEY UPDATE $upd_prep");
            $query->execute($values);
            return array("INSERT INTO $table ($data_prep) VALUES$values_prep ON DUPLICATE KEY UPDATE $upd_prep", $values);
        }
        public function getRow($table, $values){
            
            $prep = array();
            $data = array();
            foreach($values as $k => $v){
               $prep[] = "$k = ?";
            }    
            $data = array_values($values);
            $prep = implode(' AND ', $prep);
            $query = $this->db->prepare("SELECT * FROM $table WHERE $prep LIMIT 1");       
            $query->execute($data);
            $row = $query->fetch(PDO::FETCH_ASSOC);
            return $row;
        }
        
        public function getRows($table, $values = array(), $p = array()){
            $offset = isset($p['offset']) ? $p['offset'] : 0;
            $order = isset($p['order']) ? $p['order'] : false;
            $desc = isset($p['desc']) ? $p['desc'] : false;
            $limit = isset($p['limit']) ? $p['limit'] : false;
            $prep = array();
            $data = array();
            foreach($values as $k => $v){
                $prep[] = "$k = ?";
            }    
            $data = array_values($values);
            $prep = implode(' AND ', $prep);
            $query = $this->db->prepare("SELECT * FROM $table ".($values ? " WHERE  $prep" : ""). ($order ? " ORDER BY $order ".($desc ? 'DESC' : 'ASC') : "").($limit ? " LIMIT $limit" : ""));
            $query->execute($data);
            $rows = $query->fetchAll(PDO::FETCH_ASSOC);
            return $rows;
        }
        public function updateRow($table, $row_key, $data){
            $data_prep = array();
            $values =array();
            $row_key_prep;
            $row_key_val;
            foreach ($data as $key => $value) {
                $data_prep[] = "`$key` = ?";
                $values[] = $value;
            }
            $data_prep = implode(',', $data_prep);
            $key = key($row_key);
            $values[] = $row_key[$key];
            $query = $this->db->prepare("UPDATE $table SET $data_prep WHERE $key=?");
            $query->execute($values);
            return $this->is_success();
        }
        public function is_success(){
            if($this->db || $this->db->errorCode() == 0000) return true;
            else return false ;
        }
        function __destruct() {
           $this-> db = null;
        }
    }
?>