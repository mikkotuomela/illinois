// ==UserScript==
// @name INFO 510: Augmentator
// @version 1.0
// @namespace augmentator
// @description Script to manipulate websites
//
//
// **WRITE MATCH STATEMENTS TO MATCH WEBSITE URLS (FOLLOW MY EXAMPLE)
//
// @include *://*.wikipedia.org/*

//
// ==/UserScript==// -----------------------------------------
// To load and test this in Chrome:
//   
//   1. Go to Window->Extensions
//   2. Find this file in the Finder
//   3. Drag this file onto the Extensions window in Chrome
//   4. Click 'Add'
//   5. Reload the targeted website and evaluate
//
// To test modifications, repeat steps 1-3 and 5 
// (no need to click 'Add' again)

var j;   
var ELEMENT_POLL_SPEED = 1500;
var WORDS = ["Barack", "Obama", "barack", "obama"];
var TAGS  = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'a'];

function main() {

    j = jQuery.noConflict();

	// Loop through all banned words
	for (var word = 0; word < WORDS.length; word++) {
		// Loop through all tags
		for (var tag = 0; tag < TAGS.length; tag++) {
			var filter = TAGS[tag] + ':contains("' + WORDS[word] + '")';
			j(filter).hide();
		}
		// Also remove all images with banned words in filename
		j('img[src*="' + WORDS[word] + '"]').hide();
	}
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

// run it
main();
