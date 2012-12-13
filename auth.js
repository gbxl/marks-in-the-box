(function() {
	var client = new Dropbox.Client({
    	key: "d8idp2skkk9yri8", secret: "gyf9wz31f4e7y3x", sandbox: true
	});
	
	var unlink = function() {
		client.signOut(function() {
			window.location.reload();
		});
	};
	
	var link = function() {
	    client.authDriver = new Dropbox.Drivers.Redirect({ rememberUser: true });
		client.authenticate(function() {
			client.getUserInfo(function(error, userData){
				$("#info").html("Successfully linked to Dropbox as " + userData.name);
				$("#info").append("<input id='logout' type='button' value='unlink' />");
				$("#logout").click(unlink);
				
			});
		}); // TODO add errors handling
	};
	
	link();
})();