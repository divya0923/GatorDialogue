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
		console.log(status);
	});	 
	request.fail(function( jqXHR, textStatus ) {
	  console.log( "Request failed: " + textStatus );
	});
};

var authenticateUser = function(){

};