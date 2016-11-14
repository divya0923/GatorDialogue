var express = require('express');
var app = express();

// nano config 
var nano = require('nano')('http://127.0.0.1:5984/');
var user = nano.db.use('_users');
var gatorDialogue = nano.db.use("gatordialogue");

// static files 
app.use('/static', express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));

// open server 
app.listen(3000, function(){
  console.log("Server listening on port 3000!");
});

// create new user
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
          var msg = new Object();
          // users table insert successfull 
          if (!err){
            gatorDialogue.insert(postParam, function(err1, body1) {
              // gatordialogue table insert successfull 
              if(!err1){
                msg.isUserCreated = true;
                msg.isDuplicateUser = false;
                res.send(msg);
              }
              else {
                console.log(err1);
                msg.isUserCreated = false;
                if(err1.statusCode == 409)
                  msg.isDuplicateUser = true;
                res.send(msg);
              }
            });
          }
          else { 
            console.log(err);
            msg.isUserCreated = false;
            if(err.statusCode == 409)
              msg.isDuplicateUser = true;
            res.send(msg);
          }
        });
      });
    }
});

// authenticate user credentials
app.post('/authenticateUser', function(req,res){
  var jsonString = '';
  req.on('data', function (data) {
      jsonString += data;
  });

  req.on('end', function () {
    postParam = JSON.parse(jsonString);
    console.log('post params: ' + postParam.username, postParam.password);
    nano.auth(postParam.username, postParam.password, function (err, body, headers) {
      var response = new Object();
      if (err) {
        console.log("authentication failed");
        response.isAuthenticated = false;
        res.send(response);
      }
      else if (headers && headers['set-cookie']) {
        gatorDialogue.view('gatorDialogueDesignDoc', 'userView', { key: postParam.username }, function(err, body) {
        if (!err) {
          console.log(body.rows[0].value.name);
          response.isAuthenticated = true;
          response.currentUser = body.rows[0].value;
          res.send(response);
        }
        else {
          console.log(err);
        }
        });         
      }
    });
  });
});

// create tag for questions
app.post("/createTag", function(req,res){
  var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });      
      req.on('end', function () {
        postParam = JSON.parse(jsonString);
        gatorDialogue.insert(postParam, function(err, body){
          // fail silently - no error messages to frontend 
        });
      });
});

// get all tags for questions
app.get("/getAllTags", function(req,res){ 
  gatorDialogue.view('gatorDialogueDesignDoc', 'tagView', function(err, body) {
    if (!err) {
      res.send(body.rows);
    }
    else {
      console.log(err);
    }
  });
});

// post a new question 
app.post("/postQuestion", function(req,res){
  var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });      
      req.on('end', function () {
        postParam = JSON.parse(jsonString);
        gatorDialogue.insert(postParam, function(err, body){
          var response = new Object();
          response.isQuestionCreated = true;
          res.send(response);
        });
      });
});

// get all questions
app.get("/getAllQuestions", function(req, res){
  gatorDialogue.view('gatorDialogueDesignDoc', 'questionView', function(err, body) {
    if (!err) {
      res.send(body.rows);
    }
    else {
      console.log(err);
    }
  });
});

app.get("/testView", function(req,res){
  console.log("testView" + req.query.lojj);
  gatorDialogue.view('gatorDialogueDesignDoc', 'userView', { key: "user1" }, function(err, body) {
    if (!err) {
      body.rows.forEach(function(doc) {
        console.log(doc.value);
      });
    }
    else {
      console.log(err);
    }

    /* var nano1 = require('nano')({url: 'http://localhost:5984', cookie: headers['set-cookie']});
         nano1.session(function(err, session) {
          if (err) {
            return console.log('oh noes!' + err);
          }
          else{ 
            response.isAuthenticated = true;
            response.currentUser = session.userCtx.name;
            res.send(response);
          }
        }); */
  });
});