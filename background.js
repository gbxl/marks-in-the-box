(function() {

	//Bookmarks stuff
	chrome.bookmarks.onCreated.addListener(function() {
		chrome.bookmarks.getTree(function(bookmarks){
			listBookmarks(bookmarks[0]);
		});
	});
	
	function listBookmarks(bookmark) {
		var concatLinks = '';
		if (bookmark.children) {
			for (var i = 0; i < bookmark.children.length; i++) {
				listBookmarks(bookmark.children[i]);
			}
		}
		else {
			concatLinks =concatLinks.concat('||', bookmark.url);
			//console.log(concatLinks);
		}
	};
	
	chrome.windows.onCreated.addListener(function() {
		//Start loggin procedure
		var client = new Dropbox.Client({
			key: "d8idp2skkk9yri8", secret: "gyf9wz31f4e7y3x", sandbox: true
		});
		console.log("Dropbox Client created");
		client.authDriver(new Dropbox.Drivers.Redirect());
	});

})();
