var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var http 		= require('http'),
    httpProxy 		= require('http-proxy'),
    cookieParser 	= require('cookie-parser'),
    path 		= require('path'),
    querystring 	= require('querystring'),
    bodyParser 		= require('body-parser'),
    express 		= require("express"),
    session 		= require('express-session'),
    MongoDBStore 	= require('connect-mongodb-session')(session),	

    SERV_PORT = 8228;

    app 		= express(),
    proxy 		= httpProxy.createProxyServer({}),
    store 		= new MongoDBStore({ 
        			uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
        			collection: 'mySessions'
    			}),
    authenticate	= function(req,res,next) {


			     if (req.session.user) {

				next();

			     } else {

	    	               var data = querystring.stringify({
					username : req.body.username,
					password : req.body.password,
				});


	    	               var options = {
			               host: 'localhost',
      			               port: 3030,
      			               path: '/',
      			               method: 'POST',
      			               headers: {
	      			               'Content-Type': 'application/x-www-form-urlencoded',
	      			               'Content-Length': Buffer.byteLength(data)
      			               }
	   	               };

	   	               var httpreq = http.request(options, function (response) {
			               response.setEncoding('utf8');
			               var data = '';
			               response.on('data', function (chunk) {

				               data += chunk;

			               });
			               response.on('end', function () {
				               try {
					             req.session.user = JSON.parse(data);
				               } catch (e) {
					             req.session.user = false;
				               }

				               next();
			               });
		               });
		               httpreq.write(data);
		               httpreq.end();
			     }
	               },
 
    registration	= function(req,res,next) {


			     if (req.session.user) {

				next();

			     } else {

	    	               var data = querystring.stringify({
					username : req.body.username,
					email : req.body.email,
					password : req.body.password,
				});


	    	               var options = {
			               host: 'localhost',
      			               port: 3030,
      			               path: '/register',
      			               method: 'POST',
      			               headers: {
	      			               'Content-Type': 'application/x-www-form-urlencoded',
	      			               'Content-Length': Buffer.byteLength(data)
      			               }
	   	               };

	   	               var httpreq = http.request(options, function (response) {
			               response.setEncoding('utf8');
			               var data = '';
			               response.on('data', function (chunk) {

				               data += chunk;

			               });
			               response.on('end', function () {
				               try {
					             req.session.user = JSON.parse(data);
				               } catch (e) {
					             req.session.user = false;
				               }

				               next();
			               });
		               });
		               httpreq.write(data);
		               httpreq.end();
			     }
	               }


// Catch errors 
store.on('error', function(error) {
      console.log(error);
});

app.use(cookieParser())

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({
  extended: true
}) );

app.use(session({
      secret: 'oi6(-&&=+)=°0987*µ£pkKJÎÔøÊ±âå€^@ûøÊ±âå€ðÛÎâåeu987hj76|\_-((((-hhgazeè-(è-azedqs98982hgz--876µ*$$psqdf',
      name: 'innov24',
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week 
      },
      store: store,
      proxy: true,
      resave: true,
      saveUninitialized: true
}));

app.get('/', authenticate, function(req,res){

		if(req.session.user) {
		   proxy.web(req, res, { target: 'http://127.0.0.1:3070/member' });
		} else {
		   proxy.web(req, res, { target: 'http://127.0.0.1:3070/guest' });
		}
	
});

app.get('/videochat', authenticate, function(req,res){

	proxy.web(req, res, { target: 'http://192.168.1.62:3400/broadcast.html' });
	
});

app.get('/test', function(req,res) {
	res.send(`
		<h1>TEST Zone</h1>
		<form action="/login" method="post">
			<input type="text" name="username">
			<input type="text" name="password">
			<input type="submit">
		</form>
		<a href="/logout">Logout</a>
	`);
});

app.post('/login', authenticate, function(req,res) {
	res.end();
});

app.get('/user', authenticate, function(req,res) {
	proxy.web(req, res, { target: 'http://127.0.0.1:3030' });
});

app.post('/register', registration, function(req,res) {
	res.end('you are registered');
});

app.get('/logout', function(req,res) {
	req.session.destroy();
	res.redirect('/');
});

app.get(/^(.+)$/, authenticate, function(req,res){
	
		if(req.session.user) {
		   proxy.web(req, res, { target: 'http://127.0.0.1:3070/member' });
		} else {
		   proxy.web(req, res, { target: 'http://127.0.0.1:3070/guest' });
		}
	
});

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(SERV_PORT);

console.log("listening on port " + SERV_PORT)
