////////////////////////////////////////////////////
// Variables
////////////////////////////////////////////////////

var PICTURE_POT_ELEMENT_CLASSNAME = 'picture_pot_element_select',	// Unique ID for the className.
	prevDOM = null,	// Previous dom, that we want to track, so we can remove the previous styling.
	imageSelectEnabled = false;	// Toggle image selection when extention is clicked

////////////////////////////////////////////////////
// LISTENERS
////////////////////////////////////////////////////

// Message Listener for ImageSelect.js
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.type === "toggleImageSelect") {
		toggleImageSelect();
	}
	sendResponse({});
});

// Mouse listener for any move event on the current document.
var mousemoveListener = function(e) {
	var srcElement = e.srcElement;

    if (prevDOM !== null) {
      prevDOM.classList.remove(PICTURE_POT_ELEMENT_CLASSNAME);
    }

    // Add a visited class name to the element. So we can style it.
    srcElement.classList.add(PICTURE_POT_ELEMENT_CLASSNAME);

    // The current element is now the previous. So we can remove the class
    // during the next iteration.
    prevDOM = srcElement;
  // }
};

// Mouse listener for mouse up event on currently selected element.
var mouseupListener = function(e) {
	var parentElement = e.target.parentElement;

	// Stop links from propegating when image is selected
	e.preventDefault();
	e.stopPropagation();
	e.srcElement.classList.remove(PICTURE_POT_ELEMENT_CLASSNAME);

	if (parentElement) {
		$(parentElement).one('click', function(e) {
			e.stopPropagation();
			e.preventDefault();
		});
	}

	chrome.storage.local.get(["links"], function(items){

		var imageSrc = e.target.src,
			imageSrcChildren = [],
			currImage = {
				imageSrc: '',
				imageLoc: '',
				imageDest: ''
			};

		imageSrcChildren = checkChildNodes(e.target.childNodes, imageSrcChildren);

		if (imageSrc) {
			currImage.imageSrc = e.target.src;
			currImage.imageLoc = window.location.href;
			currImage.imageDest = getImageDest(e.target);
			items.links.push(currImage);

		} else if (imageSrcChildren.length) {
			items.links = items.links.concat(imageSrcChildren);
		}

		sendToExtension({ type: "updateImageCount", count: items.links.length });

		if (items.links.length) {
			chrome.storage.local.set(items);
		}
	});
	disableImageSelectListeners();

	// Set Image Select to disabled on image selection
	imageSelectEnabled = false;
};

// Mouse listener for mouse down event on currently selected element.
var mousedownListener = function(e) {
	e.preventDefault();
	e.stopPropagation();
};

////////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////////

// Send message to global chrome extension
var sendToExtension = function(request) {
    chrome.extension.sendMessage(request, function(response) {});
};

// Checks elements children recursively for images
var checkChildNodes = function(childNodes, srcArray) {

	var child,
		currChildImage;

	if (childNodes !== null) {
		for (var index in childNodes) {
			child = childNodes[index];
			currChildImage = {
				imageSrc: '',
				imageLoc: '',
				imageDest: ''
			};

			if (child.nodeName === "IMG" && child.src) {
				currChildImage.imageSrc = child.src;
				currChildImage.imageLoc = window.location.href;
				currChildImage.imageDest = getImageDest(child);
				srcArray.push(currChildImage);
			} else if (child.nodeName && child.childNodes !== null) {
				checkChildNodes(child.childNodes, srcArray);
			}
		}
	}

	return srcArray;
};

var getImageDest = function(imageElement) {
	var linkDest = '';

	if (imageElement.href) {
		linkDest = imageElement.href;
	} else if (imageElement.parentNode.href) {
		linkDest = imageElement.parentNode.href;
	}

	return linkDest;
};

// Disable Image Select listeners
var disableImageSelectListeners = function() {

	// Remove styling on last selected page element before removing listeners
	prevDOM.classList.remove(PICTURE_POT_ELEMENT_CLASSNAME);

	// Remove Image select Listeners from page body
	document.body.removeEventListener("mousemove", mousemoveListener, false);
	document.body.removeEventListener("mouseup", mouseupListener, false);
	document.body.removeEventListener("mousedown", mousedownListener, false);
};

// Enable Image Select listeners
var enableImageSelectListeners = function() {

	// Add Image select Listeners to page body
	document.body.addEventListener('mousemove', mousemoveListener, false);
	document.body.addEventListener('mouseup', mouseupListener, false);
	document.body.addEventListener('mousedown', mousedownListener, false);
};

function toggleImageSelect() {

	// Toggle Image Selection listeners on extension click
	imageSelectEnabled = !imageSelectEnabled;

	if (!imageSelectEnabled) {
		disableImageSelectListeners();
	} else {
		enableImageSelectListeners();
	}
}

// send({ type: "enable" });
