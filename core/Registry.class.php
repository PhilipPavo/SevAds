<?php
	class R {
	    protected static $store = array();
	    protected function __construct() {}
	    protected function __clone() {}
	    public static function exists($name) {
	    	return isset(self::$store[$name]);
	    }
	    public static function get($name) {
	        return (isset(self::$store[$name])) ? self::$store[$name] : null;
	    }
	    public static function set($name, $obj) {
	        return self::$store[$name] = $obj;
	    }
	}
?>