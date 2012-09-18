(function() {
	
	var unlink = function() {
        if (client.dropboxUid == null) {
            return;
        }

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
