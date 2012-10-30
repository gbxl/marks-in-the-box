(function() {

    var bgSettings = chrome.extension.getBackgroundPage().marksInTheBox.settings;
    var bgClient = chrome.extension.getBackgroundPage().marksInTheBox.client;

    $('#save').click(function() {
        bgSettings.set('timeInterval', $('#updateFrequency').val());
    });

    var loadSettings = function() {
        $('#updateFrequency').val(bgSettings.get('timeInterval'));
    };
	
	var unlink = function() {
        if (bgClient.dropboxUid == null) {
            return;
        }

		bgClient.signOut(function() {
			window.location.reload();
		});
	};
	
	var link = function() {
	    bgClient.authDriver = new Dropbox.Drivers.Redirect({ rememberUser: true });
		bgClient.authenticate(function() {
			bgClient.getUserInfo(function(error, userData){
				$("#info").html("Successfully linked to Dropbox as " + userData.name);
				$("#info").append("<input id='logout' type='button' value='unlink' />");
				$("#logout").click(unlink);
				
			});
		});
	};
	
    loadSettings();
	link();

})();
