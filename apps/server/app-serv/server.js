var express = require("express");
var app = express();
var path = require('path');

var SERV_PORT = process.env.GUESTSERV_PORT || 3070;

app.get("/:type", function(req, res) {
   res.sendFile('index.html', { root: __dirname + '/../../client/' + req.params.type });
});

/* serves all the static files */
app.get("/:type/*", function(req, res){ 
    res.sendFile( path.resolve(__dirname + '/../../client/' + req.params.type + '/' + req.params[0])); 
});

app.listen(SERV_PORT, function() {
  console.log("Listening on " + SERV_PORT);
});
