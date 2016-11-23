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

//constants
var questionPoints = 1;
var answerPoints = 5;
var profValidationPoints = 10;
var upvotePoints = 2;
var downvotePoints = -2;

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
          updateUserReputation(postParam.user, questionPoints);
          var response = new Object();
          response.isQuestionCreated = true;
          res.send(response);
        });
      });
});

// post a new question 
app.post("/postAnswer", function(req,res){
  var jsonString = '';
      req.on('data', function (data) {
          jsonString += data;
      });      
      req.on('end', function () {
        postParam = JSON.parse(jsonString);
        gatorDialogue.insert(postParam, function(err, body){
          updateUserReputation(postParam.user, answerPoints);
          var response = new Object();
          response.isAnswerPosted = true;
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

// get data for a particular question
app.get("/getQuestionData", function(req, res){
  gatorDialogue.view('gatorDialogueDesignDoc', 'questionDataView', { key: parseInt(req.query.questionId) }, function(err, body) {
    if (!err) {
      res.send(body.rows[0]);
    }
    else {
      console.log(err);
    }
  });
});

// get all answers of a question 
app.get("/getQuestionAnswers", function(req, res){
  gatorDialogue.view('gatorDialogueDesignDoc', 'answerView', { key: req.query.questionId }, function(err, body) {
    if (!err) {
      res.send(body.rows);
    }
    else {
      console.log(err);
    }
  });
});

app.get("/updateAnswerVotes", function(req, res){
  console.log("query params: " + req.query.answerId, req.query.isIncVote)
  gatorDialogue.view('gatorDialogueDesignDoc', 'answerDataView', { key: parseInt(req.query.answerId) }, function(err, body) {
    if (!err) {
      console.log("%o", body);
      var answer = body.rows[0].value;
      if(req.query.isIncVote == "true"){
        updateUserReputation(req.query.userId, upvotePoints);
        answer.votes = answer.votes + 1;
      }
       
      else {
        updateUserReputation(req.query.userId, downvotePoints);
        answer.votes = answer.votes - 1;
      }
        
      gatorDialogue.insert(answer, function(err1, body1){
        console.log("%o", err1, body1);
        var response = {"updatedVoteCount" : answer.votes}
        res.send(response);
      });
    }
    else {
      console.log(err);
    }
  });
});

app.get("/validateAnswer", function(req, res){
  console.log("query params: " + req.query.answerId, req.query.validatedBy, req.query.userId);
  gatorDialogue.view('gatorDialogueDesignDoc', 'answerDataView', { key: parseInt(req.query.answerId) }, function(err, body) {
    if (!err) {
      console.log("%o", body);
      var answer = body.rows[0].value;
      answer.isValidated = true;
      answer.validatedBy = req.query.validatedBy;
      gatorDialogue.insert(answer, function(err1, body1){
        updateUserReputation(req.query.userId, profValidationPoints);
        console.log("%o", err1, body1);
        var response = {"isValidated" : true}
        res.send(response);
      });
    }
    else {
      console.log(err);
    }
  });
});

app.get("/testView", function(req,res){
  console.log("testView" + req.query.lojj);
});

var updateUserReputation = function (userId, points) {
  console.log("updateUserReputation %o", userId , points );
  gatorDialogue.view('gatorDialogueDesignDoc', 'userView', { key: userId }, function(err, body) {
    if (!err) {
      console.log("%o", body);
      var user = body.rows[0].value;
      user.reputation += points;
      gatorDialogue.insert(user, function(err, body){
        console.log("user reputation update status %o", err, body);
      });
    }
    else {
      console.log(err);
    }
  });
}