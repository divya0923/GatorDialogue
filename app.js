var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// nano config 
var nano = require('nano')('http://127.0.0.1:5984/');
var user = nano.db.use('_users');

// static files 
app.use('/static', express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));

// open server 
app.listen(3000, function(){
  console.log("Server listening on port 3000!");
});

// body parser config 
app.use(bodyParser.json());       
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/createUser', function (req, res) {
   if (req.method == 'POST') {
      var jsonString = '';

      req.on('data', function (data) {
          jsonString += data;
      });

      req.on('end', function () {
        postParam = JSON.parse(jsonString);
        console.log("postParam" + postParam);

        user.insert(postParam, function(err, body) {
        if (!err)
            console.log(body);
        });

      });
    }
});

app.post('/authenticateUser', function(req,res){
  console.log('post params: ' + req.param('username'), req.param('password'));
  nano.auth('dmahendran', 'dmahe', function (err, body, headers) {
  if (err) {
    console.log("authentication failed");
  }
  if (headers && headers['set-cookie']) {
     res.send(headers['set-cookie']);
  }
  });

app.get('/test', function(req, res){
  console.log("test");
  res.send("{'a' : 'b'}");
});

});