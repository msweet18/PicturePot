document.addEventListener('DOMContentLoaded', function() {
	////////////////////////////////////////////////////
	// Variables
	////////////////////////////////////////////////////

	var $imgObjGlobal = {	// Current global images array
			links: []
		};

	////////////////////////////////////////////////////
	// LISTENERS
	////////////////////////////////////////////////////

	// Listens for messages from ImageSelect.js
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

		// Update Image count for opent image tab context menu
		if (request.type === "updateImageCount") {
			chrome.contextMenus.update("open_picture_tab_context", {"title": "Open picture tab (" + request.count + ")"});
		}

		// sendResponse({});
		// function send(request) {
		// 	chrome.tabs.sendMessage(sender.tab.id, request, function(response) {});
		// }
	});

	chrome.browserAction.onClicked.addListener(function onClicked(tab) {
		chrome.tabs.sendMessage(tab.id, { type: "toggleImageSelect" }, function(response) {});
	});


	//-------------------------------------------------------------
	// Create a context menu option for secondary click on web page
	// Visit --> https://developer.chrome.com/apps/contextMenus#event-onClicked

	// Create secondary click context menu option for additional extention processes
	chrome.runtime.onInstalled.addListener(function() {

		var openPictureTabProps = {"title": "Open picture tab (" + $imgObjGlobal.links.length + ")", "contexts":["all"], "id": "open_picture_tab_context"},
			getAllPageImagesProps = {"title": "Get all page images", "contexts":["all"], "id": "get_all_page_images_context"},
			deleteImagesProps = {"title": "Delete saved images", "contexts":["all"], "id": "delete_images_context"};

		chrome.contextMenus.create(openPictureTabProps);
		chrome.contextMenus.create(getAllPageImagesProps);
		chrome.contextMenus.create(deleteImagesProps);

	});

	// Add click event for context menu items
	chrome.contextMenus.onClicked.addListener(function(info, tab) {
		switch(info.menuItemId) {
			case "open_picture_tab_context":
				openPicturePotTab();
				break;
			case "get_all_page_images_context":
				getAllPageImages();
				break;
			case "delete_images_context":
				deleteImages();
				break;
			default:
				break;
		}
	});

	////////////////////////////////////////////////////
	// FUNCTIONS
	////////////////////////////////////////////////////

	// Gets all images on current page and adds them to global images array
	// TODO: Should be in its own content script
	var getAllPageImages = function() {

		// Param for executeScript
		var imgObj = {
				links: []
			};

		chrome.tabs.executeScript({
			code: '(' + function(params) {
				var pageImgs = document.getElementsByTagName("img"),
					images = [],
					currImage,
					getImageDest = function(imageElement) {
						var linkDest = '';

						if (imageElement.href) {
							linkDest = imageElement.href;
						} else if (imageElement.parentNode.href) {
							linkDest = imageElement.parentNode.href;
						}

						return linkDest;
					};

				for (var i = 0; i < pageImgs.length; i++) {
					currImage = {
						imageSrc: '',
						imageLoc: '',
						imageDest: ''
					};

					if (pageImgs[i].src && pageImgs[i].height && pageImgs[i].width && pageImgs[i].height > 1 && pageImgs[i].width > 1) {
						currImage.imageSrc = pageImgs[i].src;
						currImage.imageLoc = window.location.href;
						currImage.imageDest = getImageDest(pageImgs[i]);

						images.push(currImage);
					}
				}
				params.links = images;

				return params.links;

			} + ')(' + JSON.stringify(imgObj) + ');'
		}, function(result) {

			var imageResults = result[0],
				currImage;

			chrome.storage.local.get(["links"], function(items){

				$imgObjGlobal.links = imageResults.concat(items.links);

				// Update Image count for opent image tab context menu
				chrome.contextMenus.update("open_picture_tab_context", {"title": "Open picture tab (" + $imgObjGlobal.links.length + ")"});
				// Add local image array to storage
				chrome.storage.local.set($imgObjGlobal);
			});
		});
	};

	// Removes all images from global images array
	var deleteImages = function() {
		// Reset global image array
		$imgObjGlobal.links = [];
		// Update current image count
		chrome.contextMenus.update("open_picture_tab_context", {"title": "Open picture tab (" + $imgObjGlobal.links.length + ")"});
		chrome.storage.local.set($imgObjGlobal);
	};

	// Opens the image pot tab and displays all images from global images array
	var openPicturePotTab = function() {

		chrome.tabs.create({'url': chrome.extension.getURL('../html/picture_pot_tab.html'), 'active': true}, function(tab) {
			// Tab opened.
			var picturePotTabId = tab.id;
			//TODO: Remove listener when tab is closed
			chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
				if (changeInfo.status == 'complete' && tabId == picturePotTabId) {
					// chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
						chrome.tabs.sendMessage(tabId, {message: "updateImages"}, function(response) {
							// alert('max alert');
						});
					// });
				}
			});
		});
	};
});
