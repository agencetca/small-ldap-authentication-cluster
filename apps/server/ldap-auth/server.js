var express      = require('express'),
    session	 = require('express-session'),
    MongoDBStore = require('connect-mongodb-session')(session),
    passport     = require('passport'),
    bodyParser   = require('body-parser'),
    LdapStrategy = require('passport-ldapauth'),
    LDAP 	 = require('ldap-client'),
    prettifyJSON = require('prettify-json');

var SERV_PORT = 3030;
 
var ldap = new LDAP({
    uri:             'ldap://127.0.0.1:389',   // string 
    validatecert:    false,             // Verify server certificate 
    connecttimeout:  -1,                // seconds, default is -1 (infinite timeout), connect timeout 
    base:            'ou=accounts,dc=innov24,dc=tca',          // default base for all future searches 
    attrs:           '*',               // default attribute list for future searches 
    filter:          '(objectClass=*)', // default filter for all future searches 
    scope:           LDAP.SUBTREE,      // default scope for all future searches 
    connect:         function(){
	console.log('LDAP connexion');
	},        // optional function to call when connect/reconnect occurs 
    disconnect:      function(){
	console.log('LDAP disconnexion');
	},        // optional function to call when disconnect occurs         
}, function(err) {
    // connected and ready     
});

        ldap.bind({
            binddn: 'cn=admin,dc=innov24,dc=tca',
            password: 'noctural24'
        }, function(err) {
		console.log('LDAP admin bind');
        });

var OPTS = {
  server: {
    url: 'ldap://127.0.0.1:389',
    bindDn: 'cn=admin,dc=innov24,dc=tca',
    bindCredentials: 'noctural24',
    searchBase: 'ou=accounts,dc=innov24,dc=tca',
    searchFilter: '(cn={{username}})'
  }
};

var store = new MongoDBStore({ 
        uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
        collection: 'mySessions'
});
 
    // Catch errors 
store.on('error', function(error) {
      console.log(error);
});

var restrict = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    //req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

passport.use(new LdapStrategy(OPTS));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());

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
 
app.get('/', function(req, res) {

	if (req.session.user) {

		res.send('You are logged!<br><a href="/user">User</a><span> </span><a href="/logout">Logout</a>');

	} else {

		res.redirect('/login');	
	}

});

app.get('/register', function(req, res) {

	if (req.session.user) {
		
		res.redirect('/');

	} else {

		res.send(`
			<h1>Register an user</h1>
			<br>
			<form action="/register" method="POST">
				<input type="text" placeholder="username" name="username">
				<input type="password" placeholder="password" name="password">
				<input type="email" placeholder="email" name="email">
				<input type="submit" value="submit registration">
			</form>
		`);
	}

});

app.post('/', passport.authenticate('ldapauth', {session: true}), function(req, res) {
  res.json(req.user);
  res.end();
});

app.post('/register', function(req, res) {

    var attrs = [
        { attr: 'objectClass',  vals: [ 'organizationalPerson', 'person', 'top' ] },
        { attr: 'sn',           vals: [ req.body.username ] },
        { attr: 'userPassword',      vals: [ req.body.password ] }
    ];

    ldap.add('cn='+req.body.email+',ou=accounts,dc=innov24,dc=tca', attrs, function(err){
        console.log('Register message : %s',err);
        res.end();
    });

});
 
app.get('/user', restrict, function(req, res) {
	res.json({
		"email" : req.session.user.cn,
		"username" : req.session.user.sn,
		"password" : req.session.user.userPassword,
	});
});

app.get('/login', function(req, res) {
		res.write(`<h1>Innov24 Authentification</h1>
				<br>
				<form action="/login" method="POST">
				<input type="text" placeholder="username" name="username" />
				<input type="password" placeholder="password" name="password" />
				<input type="submit" />
				</form>`);
		res.end();
});

app.post('/login', passport.authenticate('ldapauth', {session: true}), function(req, res) {
  req.session.user = req.user;
  res.redirect('/');
});

app.get('/logout', function(req, res) {
		req.session.destroy(function(err) {
			res.redirect('/');
		})
});

app.listen(SERV_PORT);
console.log("server started on port " + SERV_PORT);
