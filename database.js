/* 	============== 
	SetCacheValue - Sets the value to the DB cache 
	============== */
global.SetValue = function(key, value) {
	client.query("SELECT `value` FROM " + dbName + '.' + dbTablePrefix + "Settings WHERE `roomid` = ? AND `key` = ?", [currentRoomId, key], function select(error, results, fields) {
		if (results !== undefined) {
			if (results.length !== 0) {
				client.query("UPDATE " + dbName + '.' + dbTablePrefix + "Settings SET `roomid` = ?, `value` = ? WHERE `key` = ?", [currentRoomId, value, key]);
			} else {
				client.query("INSERT INTO " + dbName + '.' + dbTablePrefix + "Settings (`roomid`, `key`, `value`, `DateStamp`) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", [currentRoomId, key, value]);
			}
		} else {
			client.query("INSERT INTO " + dbName + '.' + dbTablePrefix + "Settings (`roomid`, `key`, `value`, `DateStamp`) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", [currentRoomId, key, value]);
		}
	});
};

/* 	============== 
	GetCacheValue - Gets the value from the DB cache 
	============== */
global.GetValue = function(key, timeout, callback) {
	client.query("SELECT `value`, `DateStamp` FROM " + dbName + '.' + dbTablePrefix + "Settings WHERE `roomid` = ? AND `key` = ?", [currentRoomId, key], function select(error, results, fields) {
		//Log("Results: " + JSON.stringify(results));
		if (results !== undefined) {
			if (results.length !== 0) {
				var now = new Date();
				if (timeout === 0 || DateDiff(now, results[0]['DateStamp'], 'min') <= timeout) {
					callback(results[0]['value']);
				} else {
					callback(null);
				}
			} else {
				callback(null);
			}
		} else {
			callback(null);
		}
	});
};

/* 	============== 
	RemoveCacheValue - Deletes the value to the DB cache 
	============== */
global.RemoveValue = function(key) {
	client.query("DELETE FROM " + dbName + '.' + dbTablePrefix + "Settings WHERE `roomid` = ? AND `key` = ?", [currentRoomId, key]);
};

/* 	==============
	AddSongToDb - Add the song to the database.
	============== */
global.AddSongToDb = function(data) {
	client.query('INSERT INTO ' + dbName + '.' + dbTablePrefix + 'Song SET roomid = ?, artist = ?,song = ?, djid = ?, up = ?, down = ?,' + 'listeners = ?, started = NOW(), snags = ?, bonus = ?', [currentRoomId, currentsong.artist, currentsong.song, currentsong.djid, currentsong.up, currentsong.down, currentsong.listeners, currentsong.snags, 0]);
}

/* 	============== 
	DateDiff - Determines the difference between two dates
	============== */
function DateDiff(a, b, format) {
	var milliseconds = a - b;
	var minutes = milliseconds / 60000;
	var days = milliseconds / 86400000;
	var hours = milliseconds / 3600000;
	var weeks = milliseconds / 604800000;
	var months = milliseconds / 2628000000;
	var years = milliseconds / 31557600000;

	if (format == "min") {
		return Math.round(minutes);
	}
	if (format == "h") {
		return Math.round(hours);
	}
	if (format == "d") {
		return Math.round(days);
	}
	if (format == "w") {
		return Math.round(weeks);
	}
	if (format == "m") {
		return Math.round(months);
	}
	if (format == "y") {
		return Math.round(years);
	}
}

/* 	============== 
	SetUpDatabase - Setup the database for the bot to use 
	============== */
global.SetUpDatabase = function() {
	Log("Setting up the database.");
	//Creates DB and tables if needed, connects to db
	client.query('CREATE DATABASE ' + dbName, function(error) {
		if (error && error.number != mysql.ERROR_DB_CREATE_EXISTS) {
			throw (error);
		}
	});
	client.query('USE ' + dbName);

	// Song table
	client.query('CREATE TABLE ' + dbName + '.' + dbTablePrefix + 'Song(`roomid` VARCHAR( 255 ) NOT NULL, id INT(11) AUTO_INCREMENT PRIMARY KEY,' + ' artist VARCHAR(255),' + ' song VARCHAR(255),' + ' djid VARCHAR(255),' + ' up INT(3),' + ' down INT(3),' + ' listeners INT(3),' + ' started DATETIME,' + ' snags INT(3),' + ' bonus INT(3))', function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});

	// User table
	client.query('CREATE TABLE ' + dbName + '.' + dbTablePrefix + 'User(`roomid` VARCHAR( 255 ) NOT NULL, userid VARCHAR(255), ' + 'username VARCHAR(255), ' + 'lastseen DATETIME, ' + 'PRIMARY KEY (userid, username))', function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});

	// Banned users
	client.query('CREATE TABLE IF NOT EXISTS ' + dbName + '.BANNED (' + 'id INT(11) AUTO_INCREMENT PRIMARY KEY, ' + 'userid VARCHAR(255), ' + 'banned_by VARCHAR(255), ' + 'timestamp DATETIME)', function(error) {
		if (error && error.number != 1050) {
			throw error;
		}
	});


	// Settings table
	client.query("CREATE TABLE IF NOT EXISTS " + dbName + '.' + dbTablePrefix + "Settings (`roomid` VARCHAR( 255 ) NOT NULL, `key` varchar(50) NOT NULL," + " `value` varchar(4096) NOT NULL, " + "`DateStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP " + ")", function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});

	SetUpRoom();
};

global.SetUpRoom = function() {
	client.query("SELECT * FROM " + dbName + '.' + dbTablePrefix + "Settings WHERE `roomid` = ?", [currentRoomId], function select(error, results, fields) {
		if (results !== undefined || results !== null) {
			if (results.length == 0) {
				SetValue("songstats", "true");
				SetValue("autobop", "false");
				SetValue("autodj", "false");
				SetValue("enableQueue", "false");
				SetValue("nextDjQueueTimeout", "30");
				SetValue("newsongcomments", "false");
				SetValue("monitorsonglength", "false");
				SetValue("maxsonglength", "30");
				SetValue("ctsActive", "false");
				SetValue("ctsSequenceMax", "0");
				SetValue("ctsLastWords", "");
				SetValue("announcement", "");
				SetValue("gtfo", "false");
				SetValue("lamer", "false");
				SetValue("idleTime", "6");
				SetValue("bootOnIdle", "false");
				SetValue("isModerating", "false");
				SetValue("maxPlays", "4");
			}
		}
	});
};