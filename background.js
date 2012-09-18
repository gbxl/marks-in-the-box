(function() {
	chrome.tabs.create({ url: "options.html" });
	
	var saveToDropbox = function() {

        if (client.dropboxUid == null) {
            return;
        }

		chrome.bookmarks.getTree(function(bookmarks){
			var t = "";
			var content = listBookmarks(bookmarks[0], t);
		    client.authDriver = new Dropbox.Drivers.Redirect({ rememberUser: true });
			client.authenticate(function() {
				client.writeFile("bookmarks.txt", content, function(error, stat) {
					if (error) {
						console.log("error=" + error);
						return;
					}
				});
			});
		});
	};
	
	var listBookmarks = function(bookmark, concatLinks) {
		if (bookmark.children) {
			for (var i = 0; i < bookmark.children.length; i++) {
				concatLinks += listBookmarks(bookmark.children[i]);
			}
		}
		else {
			concatLinks += bookmark.url + '\n';
		}
		return concatLinks;
	};

	chrome.bookmarks.onCreated.addListener(saveToDropbox);
	chrome.bookmarks.onRemoved.addListener(saveToDropbox);
	chrome.bookmarks.onChanged.addListener(saveToDropbox);
	chrome.bookmarks.onMoved.addListener(saveToDropbox);
	chrome.bookmarks.onChildrenReordered.addListener(saveToDropbox);
	chrome.bookmarks.onImportEnded.addListener(saveToDropbox);
})();
