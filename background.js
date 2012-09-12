(function() {
	


//Bookmarks stuff
chrome.bookmarks.onCreated.addListener(testPrint);
function testPrint(){
	//Start loggin procedure
	var client = new Dropbox.Client({
	    key: "d8idp2skkk9yri8", secret: "gyf9wz31f4e7y3x", sandbox: true
	});
	client.authDriver(new Dropbox.Drivers.Redirect());
	
    var concatLinks = '';

    chrome.bookmarks.getTree( function(bookmarks){listBookmarks(bookmarks[0])})
        function listBookmarks(bookmark) {
            if (bookmark.children) {
                for (var i = 0; i < bookmark.children.length; i++) {
                    listBookmarks(bookmark.children[i]);
                }
            }
            else {
                concatLinks =concatLinks.concat('||', bookmark.url);
                //console.log(concatLinks);
            }
        }
}

})();