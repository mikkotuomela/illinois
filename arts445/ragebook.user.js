// ==UserScript==
// @name ARTS 445: Ragebook
// @version 1.0.0
// @namespace ragebook
// @description Script to manipulate Facebook
// @include *://www.facebook.com/*
// ==/UserScript==// -----------------------------------------

/*

*** postaus

div.fbTimelineUnit div div div.a img


div.userContentWrapper
  +-div._4r_y
  +-div.clearfix
      +-a
          +-img.img
	  +-span.fwb
  +-div.userContent
      +-p
          +-kommenttiteksti ***
  +-div
  +-form.commentable_item
      +-div.clearfix
      +-div.UFIContainer
          +-ul.UFIList
              +-li.UFIComment (UFIRow)
                  +-div.clearfix
                      +-div.lfloat
                          +-a.UFIImageBlockIamge
                              +-img.UFIActorImage ***
                      +-div
                          +-div.UFIImageBlockContent
                              +-div.rfloat
                              +-div
                                  +-div.UFICommentContentBlock
                                      +-div.UFICommentContent
                                          +-span
                                          +-span
                                              +-span.UFICommentBody
                                                  +-span
                                                     +- "kommenttiteksti" ***
                                          +-span
                                      +-div.UFICommentContentActions

*/


// Ragebook
//
// Analyze Facebooks and comments and replace photos with rage images
// corresponding to detected emotions
//
// Inspired by "IRC log to Rage Comic "generator" by Vidar 'koala_man' Holen
// http://www.vidarholen.net/contents/rage/

var DEBUG = false;
var j;
var ELEMENT_POLL_SPEED = 1500; // Frequency of polling, ms
var BASE_URL = 'http://mikko.tuomela.net/ui/arts445/ragebook/';

// Filenames for different rage faces
var FACES    = {
	endFaces:    ["epicwin", "clean", "monocole", "redeyes", "french", "wait",
	              "pffr", "sweaty"],
	normalFaces: ["beh", "concentrated", "dude-come-on", "herp", 
				  "hehehe", "smile", "suspicious", "wait", "hehehe", "megusta",
				  "pokerface-clean"],
	kittehFaces: ["kittehsmile"],
	happyFaces:  ["epicwin", "grin", "kittehsmile", 'happyfemale', 'thumbsup'],
	lolFaces:    ["loool", "hehehe"],
	angryFaces:  ["redeyes", "super-rage", 'megarage'],
	sadFaces:    ["unhappy", "whyyyyyy", "herp", "horror", "forever"], 
	questionFaces: ['monocole', 'wait', 'suspicious', 'whyyyyyy'],
};
// Keywords for each emotion
var DETECTIONS = {
	kittehFaces:  ["<3", "^^", "^_^", "ihq", "ihku", "aww", "love", "meow",
	               'pony', 'ponies', 'kitty', 'kitten', 'kitteh', 'kitties',
				   'puppy', 'puppies', 'doge', 'doggie', 'kiss', 'kisu', 'cute',
				   'cutie', 'adorab', 'puppeh', ':3', 'squee', ':*'],
	angryFaces:   ['fff', 'nnnnno', 'argh', '!!!', 'fuck', 'shit', 'damn',
	               'hate', 'vitun', 'vittu', 'paska', 'saatana', 'eii', 
				   'unhappy', 'destroy', '???', '?!', 'anger', 'angry', 'rage',
				   'evil', 'abuse', 'crime', 'criminal', 'sick', 'wtf', 'wth'],
	lolFaces:     [':d', ':-d', 'lol', 'rotfl', 'rofl', 'lmao', 'lmfao', 
	               'lulz', 'haha', 'hehe', '8d', 'o_o', 'wow', ':o', ':-o', 
				   'hoho', 'xd'],
	happyFaces:   [":)", ":-)", '8)', '8-)', 'thank', 'happy', 'glad', 
				   'awesome', 'nice', 'fantastic', 'cool', 'adore'],
	sadFaces:     [':(', '):', ':-(', '[:/]', ':|', ':i', ':-|', ';_;', 'sad',
	               'apua', 'voi ei', 'oh no', 'ouch', 'wrong'],
	questionFaces: ['?'],

};
// The order in which emotions are checked
var ORDER = ['kittehFaces', 'angryFaces', 'lolFaces', 'happyFaces', 'sadFaces',
			 'questionFaces'];

// Search patterns for news feed posts
var NORMAL_POST_IMAGE     = 'div.clearfix a:not(.shareLink,.photoLink,.photo) ' +
							'img.img:not(.fbStoryAttachmentImage)';
var NORMAL_POST_TEXT      = 'div.userContent';
var NORMAL_COMMENT        = 'li.UFIComment div.clearfix';
var NORMAL_COMMENT_IMAGE  = 'img.UFIActorImage';
var NORMAL_COMMENT_TEXT   = 'span.UFICommentBody span';

// Search patterns for profile timeline posts
var PROFILE_POST_IMAGE    = 'div div div.clearfix a:not(.shareLink,.photoLink,' +
							'.photo) img.img:not(.fbStoryAttachmentImage)';
var PROFILE_POST_TEXT     = 'div.userContentWrapper span.userContent ';
var PROFILE_COMMENT       = 'li.UFIComment div.clearfix';
var PROFILE_COMMENT_IMAGE = 'img.UFIActorImage';
var PROFILE_COMMENT_TEXT  = 'span.UFICommentBody span';

// Facebook smileys
var SMILEYS = [':)', ':(', '<3', ';)', ':|', ':/', ':o', ':d', ':i', ':*'];

// Get rage image URL
function rageUrl(face) { return BASE_URL + face + '.png'; }

// Detect smileys, words, etc.
function getFace(text) {
	
	// Loop through every kind of emotion
	for (var key_i = 0; key_i < ORDER.length; key_i++) {
		var key = ORDER[key_i];	
	
		// Loop through all keywords in that emotion
		for (var item_i = 0; item_i < DETECTIONS[key].length; item_i++) {
		
			var item = DETECTIONS[key][item_i];	
			
			// Check if there is a match			
			if (text.toLowerCase().indexOf(item) == -1) continue;
			// Return a random face from this category
			var face_i = Math.floor(Math.random() * FACES[key].length);
			var face   = FACES[key][face_i];
			//console.log('Detection of ' + item + ', key:' + key + 
			//			' face:' + face);
			return [face, key, item];
			
		}
	}
	
	// No matches, find a normal face
	var key  = 'normalFaces';
	var item = '(nothing)';
	var lastChar = text.slice(-1);
	if (lastChar == '.' || lastChar == '!' || lastChar == ':') {
		key  = 'endFaces';
		item = '(' + lastChar + ')';
	}
	var face_i = Math.floor(Math.random() * FACES[key].length);
	return [FACES[key][face_i], key, item]
}

// Main function
function main() {
	//console.log('Ragebook starting');
    j = jQuery.noConflict();
	
	// Process a single post
	function processPost(jnode) {
	
		// Main post image and text
		var postImage  = j(jnode).find(NORMAL_POST_IMAGE);
		var postText   = j(jnode).find(NORMAL_POST_TEXT);
		if (postImage == undefined || postImage.attr('src') == undefined)
			return false;
		
		// Change poster image
		var text       = getText(postText).trim();
		if (text.indexOf('$%') != -1) return false; // avoid double analysis
		var faceValues = getFace(text); // face, key, item
		if (DEBUG)
			postText.append(' >>> ' + faceValues[0] + '|' + faceValues[1] + 
							'|' + faceValues[2] + '|NORMAL');
		postText.append('<span style="color:white">$%</span>');
		postImage.attr('src', rageUrl(faceValues[0]));
		
		// Loop through all comments to this post
		j(jnode).find(NORMAL_COMMENT).each(function(index) {
		
			// Commnt image and text
			var commentImage = j(this).find(NORMAL_COMMENT_IMAGE);
			var commentText  = j(this).find(NORMAL_COMMENT_TEXT);
			if (commentImage == undefined || commentImage.attr('src') == undefined)
				return;
			
			// Change poster image
			var text       = getText(commentText).trim();
			if (text.indexOf('$%') != -1) return false; // avoid double analysis
			var faceValues = getFace(text); // face, key, item
			if (DEBUG)
				commentText.append(' >>> ' + faceValues[0] + '|' + faceValues[1] + 
								   '|' + faceValues[2] + '|NORMAL_COMMENT');
			commentText.append('<span style="color:white">$%</span>');
			commentImage.attr('src', rageUrl(faceValues[0]));
			
		});
		
	}
	
	// Process a single profile post
	function processProfilePost(jnode) {
	
		var postImage  = j(jnode).find(PROFILE_POST_IMAGE);
		var postText   = j(jnode).find(PROFILE_POST_TEXT);
		if (postImage == undefined || postImage.attr('src') == undefined)
			return false;
		
		// Change poster image
		var text       = getText(postText).trim();
		if (text.indexOf('$%') != -1) return false; // avoid double analysis
		var faceValues = getFace(text); // face, key, item
		if (DEBUG)
			postText.append(' >>> ' + faceValues[0] + '|' + faceValues[1] + 
							'|' + faceValues[2] + '|PROFILE');
		postText.append('<span style="color:white">$%</span>');
		postImage.attr('src', rageUrl(faceValues[0]));
		
		// Loop through all comments to this post
		j(jnode).find(PROFILE_COMMENT).each(function(index) {
		
			// Commnt image and text
			var commentImage = j(this).find(PROFILE_COMMENT_IMAGE);
			var commentText  = j(this).find(PROFILE_COMMENT_TEXT);
			if (commentImage == undefined || commentImage.attr('src') == undefined)
				return;
			
			// Change poster image
			var text       = getText(commentText).trim();
			if (text.indexOf('$%') != -1) return false; // avoid double analysis
			console.log(text);
			var faceValues = getFace(text); // face, key, item
			if (DEBUG)
				commentText.append(' >>> ' + faceValues[0] + '|' + faceValues[1] + 
								   '|' + faceValues[2] + '|PROFILE_COMMENT');
			commentText.append('<span style="color:white">$%</span>');
			commentImage.attr('src', rageUrl(faceValues[0]));
			
		});
		
		
	}

	// Get a normal trollface
	function trollface(jnode) {
		if (jnode.attr('src').indexOf('tuomela') != -1) return;
		jnode.attr('src', rageUrl('trollface'));
	}
	// Get a random normal face
	function randomFace(jnode) {
		if (jnode.attr('src').indexOf('tuomela') != -1) return;
		var face_i = Math.floor(Math.random() * FACES['normalFaces'].length);
		jnode.attr('src', rageUrl(FACES['normalFaces'][face_i]));
	}
	
	// Posts and comments in news feed
	waitForKeyElements('div.userContentWrapper',    processPost,        false);
	// Posts and comments in profile timeline
	waitForKeyElements('div.timelineUnitContainer', processProfilePost, false);
	
	//waitForKeyElements('img.UFIActorImage',           trollface, false);	
	waitForKeyElements('img.profilePic',               trollface, false);
	waitForKeyElements('img.fbxWelcomeBoxImg',         trollface, false);
	
	waitForKeyElements('img.tickerStoryImage',         randomFace, false);
	waitForKeyElements('ul.fbChatOrderedList img.img', randomFace, false);
	waitForKeyElements('img.profilePhoto',             randomFace, false);
	// Timeline additional comments, get random image
	waitForKeyElements('.UFIImageBlockImage img.img:not(.UFIActorImage)',
					   randomFace, false);
	// User image
	waitForKeyElements('div.UFIImageBlockImage img.UFIActorImage',
					   trollface, false);
	waitForKeyElements('a.UFIImageBlockImage img.UFIActorImage',
					   randomFace, false);
	waitForKeyElements('a.navLink img.img', trollface, false);
	waitForKeyElements('div.profileBlock img.img', trollface, false);
}

// Add smileys and check for undefined
function getText(textItem) {
	text = textItem.text();
	if (textItem == undefined || text == undefined || text == '')
		return '';
		
	// Check all smileys
	for (var smiley_i = 0; smiley_i < SMILEYS.length; smiley_i++) {
	
		// Look for tags of type <span title=":)">
		var smileys = textItem.find('span[title="' + SMILEYS[smiley_i] + '"]');
		if (smileys != undefined && smileys.length > 0) {
		
			var smiley = SMILEYS[smiley_i];
			if (smiley == ':/') smiley = '[:/]'; // avoid urls
			text += smiley;
			//console.log('Smiley ' + SMILEYS[smiley_i] + ' detected in "' + 
			//textItem.text() + '"');
			
		}	
		
	}
	return text
}

// waitForKeyElements
// from https://gist.github.com/BrockA/2625891
function waitForKeyElements (selectorTxt, actionFunction, bWaitOnce, 
                             iframeSelector ) {

    var targetNodes, btargetsFound;
    targetNodes = j(selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
    
        btargetsFound = true;

        // found target node(s).  go through each and act if they are new.
        targetNodes.each (function () {
            var jThis        = j(this);
            var alreadyFound = jThis.data ('alreadyFound') || false;

            if (!alreadyFound) {
                // call the payload function.
                //unsafeWindow.console.log("waitFor got a new element: "+selectorTxt);
                var cancelFound = actionFunction (jThis);
                if (cancelFound) btargetsFound = false;
                else jThis.data ('alreadyFound', true);
            }
        });
        
    } else {
        btargetsFound = false;
    }

    // get the timer-control variable for this selector.
    var controlObj  = waitForKeyElements.controlObj || {};
    var controlKey  = selectorTxt.replace(/[^\w]/g, "_");
    var timeControl = controlObj [controlKey];

    // now set or clear the timer as appropriate.
    if (btargetsFound && bWaitOnce && timeControl) {
    
        // the only condition where we need to clear the timer.
        clearInterval(timeControl);
        delete controlObj [controlKey]
        
    } else {
    
        // set a timer, if needed.
        if (!timeControl) {
            timeControl = setInterval(function () {
                waitForKeyElements(selectorTxt, actionFunction, bWaitOnce,
                                   iframeSelector);
            }, ELEMENT_POLL_SPEED);
            controlObj [controlKey] = timeControl;
        }
        
    }
    waitForKeyElements.controlObj = controlObj;
}

// run it
main();


