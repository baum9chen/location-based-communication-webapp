var http = require("http");
var socketio = require("socket.io");
var fs = require("fs");
var mongoose = require("mongoose");

var db = mongoose.connect("mongodb://localhost/location");
var schema = new mongoose.Schema({
	"username"   : String
	, "message"  : String
	, "date"     : Number
	, "location" : {
		"lat"  : Number
		,"lon" : Number
	}
});
var Location = db.model("Location",schema);

var server = http.createServer(function(req, res) {
	res.writeHead(200, {"Content-Type":"text/html"});
	var output = fs.readFileSync("./index.html","utf-8");
	res.end(output);
}).listen(process.env.VMC_APP_PORT || 3000);

var io = socketio.listen(server);
io.sockets.on("connection", function(socket) {

	Location.find({},{},{"sort":{"date":"desc"}},function(err,data) {
		io.sockets.emit("S_to_C_log", data);
	});
	
	// メッセージが送信されたとき
	socket.on("C_to_S_message", function(data) {
		// 送信されたメッセージを保存
		var location = new Location();
		location.username = data.username;
		location.message  = data.message;
		location.date     = parseInt(new Date()/1000);
		location.location.lat = data.lat;
		location.location.lon = data.lon;
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
