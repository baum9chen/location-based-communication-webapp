var http     = require("http");
var socketio = require("socket.io");
var fs       = require("fs");
var url      = require('url');
var mongoose = require("mongoose");

var db = mongoose.connect("mongodb://localhost/location");
var schema = new mongoose.Schema({
	"group"      : String
	,"username"   : String
	, "message"  : String
	, "date"     : Number
	, "location" : {
		"lat"  : Number
		,"lon" : Number
	}
});
var Location = db.model("Location",schema);

var groupName = "";

var server = http.createServer(function(req, res) {
	
	var url_parts = url.parse(req.url);
	
	var path = url_parts['pathname'].substring(1);
	var query = url_parts['query'] !== null ? url_parts['query'] : "";
	if (path !== "favicon.ico") {
		groupName = path;
	}
	res.writeHead(200, {"Content-Type":"text/html"});
	var output = fs.readFileSync("./index.html","utf-8");
	res.end(output);
}).listen(process.env.VMC_APP_PORT || 3000);

var io = socketio.listen(server);
io.sockets.on("connection", function(socket) {
	
	var query = {};
	if (groupName) {
		query["group"] = groupName;
	}
	Location.find(query,{},{"sort":{"date":"desc"}},function(err,data) {
		io.sockets.emit("S_to_C_log", data);
	});
	
	// メッセージが送信されたとき
	socket.on("C_to_S_message", function(data) {
		// 送信されたメッセージを保存
		var location = new Location();
		location.group    = groupName;
		location.username = data.username;
		location.message  = data.message;
		location.date     = parseInt(new Date()/1000);
		location.location.lat = null;
		location.location.lon = null;
		if (typeof data.location !== "undefined") {
			if (typeof data.location.lat !== "undefined" &&
				typeof data.location.lon !== "undefined") 
			{
				location.location.lat = data.location.lat;
				location.location.lon = data.location.lon;
			}
		}
		location.save(function(err){
			
			// 保存完了後、クライアントに送信
			data.date = location.date;
			io.sockets.emit("S_to_C_message", data);
		});
		
	});
	
	// broadcast
	socket.on("C_to_S_broadcast", function(data) {
		/*
		socket.broadcast.emit("S_to_C_message", data);
		*/
	});
	// disconnect
	socket.on("disconnect", function() {
		/*
		io.sockets.emit("S_to_C_message", {"message":"a user disconnected","username": ""});
		*/
	});

});
