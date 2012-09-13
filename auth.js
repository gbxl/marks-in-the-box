(function(undefined) {
	var client = new Dropbox.Client({
    	key: "d8idp2skkk9yri8", secret: "gyf9wz31f4e7y3x", sandbox: true
	});
    client.authDriver = new Dropbox.Drivers.Redirect({ rememberUser: true });
	
	client.authenticate();	
	client.getUserInfo(function(error, userInfo) {
	  if (error) {
		  console.log("erreur");
		  return;
	  }
	  $("body").html("Hello, " + userInfo.name + "!");
	});
	
	client.writeFile("hello_world.txt", "tg!\n", function(error, stat) {
	  if (error) {
		  console.log("error=" + error);
	    return;
	  }
	  $("body").append("put file ok");
	  setTimeout(function() { 
		  chrome.tabs.getCurrent(function(tab){ chrome.tabs.remove([tab.id]); });
	  }, 3000);
	});
})();
