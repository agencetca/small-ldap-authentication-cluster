var express = require("express");
var app = express();
var path = require('path');
var pg = require('pg');

var SERV_PORT = process.env.GUESTSERV_PORT || 3080;

var pg = require('pg');

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
  user: 'manager', //env var: PGUSER
  database: 'postgres', //env var: PGDATABASE
  password: 'noctural24', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients
var pool = new pg.Pool(config);

// to run a query we can acquire a client from the pool,
// run a query on the client, and then return the client to the pool
pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT $1::int AS number', ['1'], function(err, result) {
    //call `done()` to release the client back to the pool
	//
    done();

    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].number);
    //output: 1
  });
});

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})

app.get("/", function(req, res) {
	res.send(`<h1>Innov24 SQL Server</h1>
			<form id="req" class="form-group well">
				<textarea class="form-control" rows="4" cols="80" placeholder="Enter your SQL request here"></textarea>
				<br>
				<input id="start" class="form-control pull-right" type="submit"></input>
			</form>
			<div class="table-responsive">
			    <table id="table">
			</div>
			<script>

				var form = document.getElementById('req');
				var input = document.getElementById('start');
				var table = document.getElementById('table');

				input.addEventListener('click', function() {
					table.innerHTML = 'toto';
				});

				

			</script>
		`);
});

app.listen(SERV_PORT, function() {
  console.log("Listening on " + SERV_PORT);
});
