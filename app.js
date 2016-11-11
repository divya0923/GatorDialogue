var express = require('express');
var app = express();

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


app.post('/createUser', function (req, res) {
  console.log("createUser");
   if (req.method == 'POST') {
      
      var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });
      
      req.on('end', function () {
        postParam = JSON.parse(jsonString);
        console.log("postParam" + postParam);

        user.insert(postParam, function(err, body) {
          console.log(body);
          var msg = new Object();
          if (!err){
              msg.isUserCreated = true;
              msg.isDuplicateUser = false;
          }
          else {
            console.log(err);
            msg.isUserCreated = false;
            if(err.statusCode == 409)
              msg.isDuplicateUser = true;
          }
          res.send(msg);  
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