var marksInTheBox = {

    client: new Dropbox.Client({
        key: "d8idp2skkk9yri8", secret: "gyf9wz31f4e7y3x", sandbox: true
    }),

    // interface to localStorage
    settings: {
        defaults : {
            scheduleSave: true,
            timeInterval: 1,
            autoSave: false,
            lastUpload: 0,
        },

        // get an option from localStorage, or from the defaults if it doesn't
        // exists
        get: function(key) {
            if (localStorage[key]) {
                return JSON.parse(localStorage[key]);
            } else {
                return this.defaults[key];
            }
        },

        // set an option in the localStorage, or remove it if equals to the
        // default value, so we can change this default value
        set: function(key, value) {
            if (this.defaults[key] == value) {
                localStorage.removeItem(key);
            } else {
                localStorage[key] = value;
            }
        },

        reset: function() {
            for (var i in this.defaults) {
                localStorage.removeItem(i);
                console.log('removing %s from localStorage', i);
            }
        }
    },

    bookmarksModified: false,

    // indicates if the timer has been set or not. if yes, we have to remove it 
    // every time we change the 'timeInterval' option
    timerSet: false, 

    setTimer: function() {
        if (!this.timerSet) {
            this.timerSet = true;
        } else {
            chrome.alarms.clear('marksInTheBoxAlarm');
        }
        chrome.alarms.create('marksInTheBoxAlarm', {'periodInMinutes' : this.settings.get('timeInterval')});
        chrome.alarms.onAlarm.addListener(this.onTimeElapsed);
    },

    onTimeElapsed: function(alarm) {
        if (alarm.name == 'marksInTheBoxAlarm' && marksInTheBox.bookmarksModified == true) {
            console.log('upload scheduled');
            marksInTheBox.saveToDropbox();
        }
    },

    debugInfo: function() {
        console.log('--- SETTINGS OUTPUT ---');
        console.log('scheduleSave: ' + this.settings.get('scheduleSave'));
        console.log('timeInterval: ' + this.settings.get('timeInterval'));
        console.log('bookmarksModified: ' + this.settings.get('bookmarksModified'));
        console.log('autoSave: ' + this.settings.get('autoSave'));
        console.log('lastUpload: ' + this.settings.get('lastUpload'));
        console.log('--- END ---')
    },

    init: function() {
        this.setTimer();
        chrome.bookmarks.onCreated.addListener(this.onBookmarksModified);
        chrome.bookmarks.onRemoved.addListener(this.onBookmarksModified);
        chrome.bookmarks.onChanged.addListener(this.onBookmarksModified);
        chrome.bookmarks.onMoved.addListener(this.onBookmarksModified);
        chrome.bookmarks.onChildrenReordered.addListener(this.onBookmarksModified);
        chrome.bookmarks.onImportEnded.addListener(this.onBookmarksModified);
        chrome.tabs.create({ url: "options.html" });
    },

    onBookmarksModified: function() {
        console.log('bookmarks modified');
        marksInTheBox.bookmarksModified = true;

        if (marksInTheBox.settings.get('autoSave') == true) {
            marksInTheBox.saveToDropbox();
        }
    },

    saveToDropbox: function() {

        console.log('entering saveToDropbox()');
        if (marksInTheBox.client.dropboxUid == null) {
            console.error("saving bookmarks to dropbox failed : you need to be loggued in");
            return;
        }

        chrome.bookmarks.getTree(function(bookmarks){
            var t = "";
            var content = marksInTheBox.listBookmarks(bookmarks[0], t);
            marksInTheBox.client.authDriver = new Dropbox.Drivers.Redirect({ rememberUser: true });
            marksInTheBox.client.authenticate(function() {
                marksInTheBox.client.writeFile("bookmarks.txt", content, function(error, stat) {
                    if (error) {
                        console.error("error : " + error);
                        return;
                    } else {
                        console.log("lastUpload: " + marksInTheBox.settings.get('lastUpload'));
                        marksInTheBox.settings.set('bookmarksModified', false);
                        marksInTheBox.settings.set('lastUpload', new Date().getTime());
                    }
                });
            });
        });
    },

    listBookmarks: function(bookmark, concatLinks) {
        if (bookmark.children) {
            for (var i = 0; i < bookmark.children.length; i++) {
                concatLinks += this.listBookmarks(bookmark.children[i]);
            }
        }
        else {
            concatLinks += bookmark.url + '\n';
        }
        return concatLinks;
    },
};

marksInTheBox.init();
