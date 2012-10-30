var marksInTheBox = {

    client: new Dropbox.Client({
        key: "d8idp2skkk9yri8", secret: "gyf9wz31f4e7y3x", sandbox: true
    }),

    // interface to localStorage
    settings: {
        defaults : {
            scheduledSync: true,
            timeInterval: 1,
            autoSync: false,
            lastUpload: 0,
            bookmarksModified: false, // we keep this flag in case the browser is quit
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

        useAutoSync: function() {
            this.set('scheduledSync', false);
            this.set('autoSync', true);
            this.set('timeInterval', 0);
            if (marksInTheBox.timerSet == true) {
                chrome.alarms.clear('marksInTheBoxAlarm');
                marksInTheBox.timerSet = false;
            }
        },

        useScheduledSync: function(time) {
            this.set('scheduledSync', true);
            this.set('timeInterval', time);
            this.set('autoSync', false);

            if (marksInTheBox.timerSet == true) {
                chrome.alarms.clear('marksInTheBoxAlarm');
            } else {
                marksInTheBox.timerSet = true;
            }

            chrome.alarms.create('marksInTheBoxAlarm', {'periodInMinutes' : marksInTheBox.settings.get('timeInterval')});
            chrome.alarms.onAlarm.addListener(marksInTheBox.onTimeElapsed);
        },

        reset: function() {
            for (var i in this.defaults) {
                localStorage.removeItem(i);
                console.log('removing %s from localStorage', i);
            }
        }
    },


    // indicates if the timer has been set or not. if yes, we have to remove it 
    // every time we change the 'timeInterval' option
    timerSet: false, 

    onTimeElapsed: function(alarm) {
        if (alarm.name == 'marksInTheBoxAlarm' && marksInTheBoxs.settings.get('bookmarksModified') == true) {
            console.log('upload scheduled');
            marksInTheBox.saveToDropbox();
        }
    },

    debugInfo: function() {
        console.log('--- SETTINGS OUTPUT ---');
        console.log('scheduledSync: ' + this.settings.get('scheduledSync'));
        console.log('timeInterval: ' + this.settings.get('timeInterval'));
        console.log('bookmarksModified: ' + this.settings.get('bookmarksModified'));
        console.log('autoSync: ' + this.settings.get('autoSync'));
        console.log('lastUpload: ' + this.settings.get('lastUpload'));
        console.log('timerSet: ' + this.timerSet);
        console.log('--- END ---')
    },

    init: function() {
        if (this.settings.get('useScheduledSync') == true) {
            this.settings.useScheduledSync(this.settings.get('timeInterval'));
        } else {
            this.settings.useAutoSync();
        }
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
        marksInTheBox.settings.set('bookmarksModified', true);

        if (marksInTheBox.settings.get('autoSync') == true) {
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
