var serverUrl = "http://localhost:3000"

function createUser(){
	var data = new Object();
	data._id = "org.couchdb.user:" + $('#username')[0].value;
	data.name = $('#username')[0].value;
	data.type = "user";
	data.roles = [];
	data.password = $('#password')[0].value;

    var request = $.ajax({
		url: "http://localhost:3000/createUser",
		method: "POST",
		data: JSON.stringify(data),
		headers:{
			"Content-type":"application/x-www-form-urlencoded",
			"Content-length":data.length,
			"Connection":"close"
		}
	});
	request.done(function(status) {
		console.log("user created successfully %o", status);
		$('.signupForm')[0].reset();
		if(status.isUserCreated){
			$("#successPlaceholder").removeClass("hide");
			$("#errorPlaceholder").addClass("hide");
		}		
		else {
			if(status.isDuplicateUser)
			$('#errorPlaceholder .errorText').html("Username is already in use. Choose a different one!");
			$("#errorPlaceholder").removeClass("hide");
			$("#successPlaceholder").addClass("hide");
		}
			
	});	 
	request.fail(function( jqXHR, textStatus ) {
	  console.log("user creation failed" + textStatus );
	  $('#errorPlaceholder').removeClass("hide");
	});
};

var authenticateUser = function(){
    var data = new Object();
    data.username = $('#username')[0].value;
    data.passeword = $('#password')[0].value;

    var request = $.ajax({
    	url : serverUrl + "/authenticateUser",
    	method: "POST",
    	data : JSON.stringify(data),
    	headers:{
			"Content-type":"application/x-www-form-urlencoded",
			"Content-length":data.length,
			"Connection":"close"
		}
    });

    request.done(function(status) {
		console.log("logged in successfully");
		$('#username').val("test");
		var a = "<span> hello </span>";
	});	 
	request.fail(function( jqXHR, textStatus ) {
	  console.log( "login failed: " + textStatus );
	});
};

var loadQuestionsTable = function(){
	console.log("loadEventsTable");
	$('#questionsTableWrapper').empty()
	$('#questionsTableWrapper').append("<table class=\"display\" width=\"100%\" id=\"questionsDTable\"></table>");
	$('#questionsDTable').DataTable({
    	"bLengthChange": false,
    	"pageLength": 10,
        data: populateQuestionsData(),
        columns: [
        	{ title : "QuestionId"}
        ],
        "columnDefs": [
	        {
		        "targets": [ 0 ],
		        "visible": false,
		        "searchable": false
	    	},
	        { 
		        "targets": [ 1 ],
		        "render": function ( data, type, row ) {
		    	    return data;
		    	}
            }
        ]
    });
}

var populateQuestionsData = function(){
	var questions = [];
	var i = 0;
	for(i=1; i < 10; i++) {
		var questionArr = [];
		var questionId = 14677887;
		/* var questionStr = 
	    			'<div class="right action-links">'+
					'<div class="right">'+
					'<a class="link clblue" onclick="editEvent('+ questionId +')" id="cancelDeleteSessionBtn"><i class="fa fa-pencil pr5"></i></a>'+
					'</div>'+
					'<div class="left pr20">'+
					'<a class="link clblue" onclick="deleteEvent('+ questionId +')" id="deleteSessionBtn"><i class="fa fa-trash pr5"></i></a>'+
					'</div></div>'+
                    '<ul>'+ 
                    '<li class="sessionName">'+ 'Test test stets ste ssj k dflfkldkf' +'</li>'+
                    '<li class="sessionVenue">' + 'dfkdjfdflkldkflkd' + '</li>'+
                        '</ul>'; */
        var tagStr = '<a href="#" class="post-tag js-gps-track" title="" rel="tag">'+ 'test' + '</a>';
        tagStr += '<a href="#" class="post-tag js-gps-track" title="" rel="tag">'+ 'test' + '</a>';
        tagStr += '<a href="#" class="post-tag js-gps-track" title="" rel="tag">'+ 'test' + '</a>';

        var countStr = '<div class="cp">' +
        '<div class="votes">' +
            '<div class="mini-counts"><span title="3 votes">3</span></div>' +
            '<div>votes</div>' +
        '</div>'+
        '<div class="status answered">' +
            '<div class="mini-counts"><span title="7 answers">7</span></div>'+
            '<div>answers</div>' +
        '</div>'+
        '<div class="views">'+
            '<div class="mini-counts hot"><span title="34783 views">35k</span></div>'+
            '<div class="hot">views</div>' +
        '</div>' +
    '</div>';

        var str = "test question";

        var questionStr = '<div class="left pr20">' +
		                    '<div class="quesTitle">' + str +'</div>'+
		                    '<div class="post-taglist">' + tagStr + '</div>' + 
		                    '</div>'+
			    			'<div class="right action-links">' + 
			    			'<div class="post-signature owner" style="display:inline-block">' + 
		                    '<div class="user-info ">' + 
		                    '<div class="user-action-time">' + 
		                    'asked <span title="2016-02-22 14:02:45Z" class="relativetime">15 mins ago</span>' + 
		                    '</div>' + 
		                    '<div class="user-gravatar32">' + 
		                    '<a href="#"><div class="gravatar-wrapper-32"><img src="https://www.gravatar.com/avatar/335a9ae9364e36c131fb599feaf0e540?s=32&amp;d=identicon&amp;r=PG&amp;f=1" alt="" width="32" height="32"></div></a>' +
		                    '</div>' +
		                    '<div class="user-details">' + 
		                    '<a href="#">'+ 'dmahendran' +'</a>' +  
		                    '</div>' + 
		                    '</div></div>'
							'</div>';
        questionArr.push(questionId);
		questionArr.push(questionStr);
		questions.push(questionArr);
	}
	return questions;     
}

function initializeSelectivityForQuestionTags(){
	console.log('initializeSelectivityForQuestionTags');
	 var tags = getTags();
	 var items = constructSelectivityDataForTags(tags);
	 $('#questionTags').selectivity({
		 items: items,
		 multiple: true,
	   	 placeholder: 'Tags',
	   	 createTokenItem: function(token){
	   	 	console.log('create token item called %o',token);
	   	 	$('.selectivity-multiple-input').val("");
	   	 	var itemArray = $('#questionTags').selectivity('data');
	   	 	// When there are no categories in the system
	   	 	if(itemArray == ""){
	   	 		console.log('added session cat if');
	   	 		$('#questionTagsForm #tags').val(token);
   	 			var tagId = addTag();
		   	 	var pluginItem = {
					id: tagId,
					text: token
				};
				// Refresh the selectivty since new session category has been added to the system
				initializeSelectivityForQuestionTags();
				return pluginItem;
	   	 	}
	   	 	// Session categories are available : Some are already selected
	   	 	else{
	   	 		// Get the item text values from itemArray
	   	 		var itemTexts = [];
	   	 		for(i in itemArray){
	   	 			itemTexts.push(itemArray[i].text);
	   	 		}
	   	 		// Check if the token is already selected/avaialble in the system
	   	 		if(itemTexts.indexOf(token)!=-1){
	   	 			// Don't add, clear the input field
	   	 			return null;
	   	 		} else {
	   	 			// Add it to JCR
	   	 			$('#questionTagsForm #tags').val(token);
	   	 			var tagId = addTag();
			   	 	var pluginItem = {
						id: tagId,
						text: token
					};
					// Refresh the selectivty since new session category has been added to the system
					initializeSelectivityForQuestionTags();
					return pluginItem;
	   	 		}
	   	 	}
	   	 	
	   	}
	});	
}

function getTags(){
	  var tags = [];
	  for(var i=0; i<5; i++) {
	    tag = new Object();
	    tag.name = "tag" + i;
	    tag.id = i;
	    tags.push(tag);
	  }
	  return tags;
}

function constructSelectivityDataForTags(tags){
	var pluginItems = [];
	for(i=0;i<tags.length;i++){
		var pluginItem = {
			id: tags[i].id,
			text: tags[i].name
		};
		pluginItems.push(pluginItem);
	}
	return pluginItems;
}

/* Session categories */
function addTag() {
	  	var tagId = uniqueId();
	  	/*// Set base path
		var baseTestPath = "/event-data/sessioncategory/sessioncategory-nodes";
		var testPath = baseTestPath + "/sessioncategory-" + sessionCategoryId;
		var path = testPath + "/" + sessionCategoryId;
		// Get the data from the form
		var params = $('#sessioncategoryForm').serialize();
		// Post the data to Sling JCR Repository
		var request = $.ajax({
		  url: path,
		  method: "POST",
		  data: params,
		  headers:{
		  	"Content-type":"application/x-www-form-urlencoded",
		  	"Content-length":params.length,
		  	"Connection":"close"
		  }
		});
 
		request.done(function( msg ) {
			console.log('session category added');
		});
		 
		request.fail(function( jqXHR, textStatus ) {
		  window.location = "/index.html"; 
		});*/
		return tagId;
}

/* Generates Unique Id*/
function uniqueId() {
	var i = new Date().getTime();
	i = i & 0xffff; 
	return i;
}