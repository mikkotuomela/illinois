// ==UserScript==
// @name ARTS 445 Project5 (Replace)
// @version 1.0
// @namespace arts445-project5-userscript
// @description Script to manipulate websites
//
//
// **WRITE MATCH STATEMENTS TO MATCH WEBSITE URLS (FOLLOW MY EXAMPLE)
//
// @match *://*.facebook.com/*
// @include *://*.facebook.com/*
// @exclude *://*.facebook.com/ai.php*
// @exclude *://*.facebook.com/ajax/*
// @exclude *://*.facebook.com/dialog/*
// @exclude *://*.facebook.com/connect/*
// ==/UserScript==// 

var j;   
var ELEMENT_POLL_SPEED = 1500;
var TEXT_TAGS  = ['a.profileLink', 'a.UFICommentActorName', 'div._55lr',
				  'div.name', 'a.titlebarText', 'span.fwb a',
				  'div.UFILikeSentenceText a[rel="dialog"]', 'a._8_2',
				  'span.fwb', 'div.tickerFeedMessage span']
var IMAGE_TAGS = ['img.UFIActorImage', 'div._55lt img', 'img._54rt', 'img._54ru',
				  'img.friendPhoto', 'img._7lw', 'img.img']

var NEW_NAME  = 'Mark Zuckerberg'
var NEW_IMAGE = 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-frc3/t1/c14.4.153.153/1939620_10101266232851011_437577509_a.jpg'

function main() {
    setInterval(function() {
	
	    j = jQuery.noConflict();

		// Change all names to NEW_NAME
	 	for (var text_tag = 0; text_tag < TEXT_TAGS.length; text_tag++) {
			var result = j(TEXT_TAGS[text_tag]).text(NEW_NAME);
		}
		// Change all pictures to NEW_IMAGE
		for (var image_tag = 0; image_tag < IMAGE_TAGS.length; image_tag++) {
			j(IMAGE_TAGS[image_tag]).attr('src', NEW_IMAGE);
		}
		// Miscellaneous
		j('div.UFILikeSentenceText span span').text(' likes this.');
		j('div._3sol span span').first().text('Mark Zuckerberg');
		j('span._33h').css('background-image', 'url(https://fbcdn-profile-a.akamaihd.net/hprofile-ak-frc3/t1/c14.4.153.153/1939620_10101266232851011_437577509_a.jpg)');
		
	}, ELEMENT_POLL_SPEED);
	console.log('Set poll speed to ' + ELEMENT_POLL_SPEED);
}




// **IGNORE EVERYTHING BELOW THIS LINE

// from https://gist.github.com/BrockA/2625891
// there are other ways of doing this but I've found Brock's script to be more robust
// than the others. 
function waitForKeyElements (selectorTxt, actionFunction, bWaitOnce, iframeSelector ) {

    var targetNodes, btargetsFound;

    targetNodes = j(selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;

        // found target node(s).  go through each and act if they are new.
        targetNodes.each ( function () {
            var jThis        = j(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                // call the payload function.
                //unsafeWindow.console.log("waitFor got a new element: "+selectorTxt);
                var cancelFound = actionFunction (jThis);
                if (cancelFound) btargetsFound = false;
                else jThis.data ('alreadyFound', true);
            }
        } );
    }

    else {
        btargetsFound   = false;
    }

    // get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    // now set or clear the timer as appropriate.
    if (btargetsFound && bWaitOnce && timeControl) {
        // the only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }

    else {
        // set a timer, if needed.
        if (!timeControl) {
            timeControl = setInterval ( function () {
                waitForKeyElements(selectorTxt, actionFunction, bWaitOnce, iframeSelector);
                }, ELEMENT_POLL_SPEED
            );

            controlObj [controlKey] = timeControl;
        }
    }

    waitForKeyElements.controlObj = controlObj;
    
}
main();
