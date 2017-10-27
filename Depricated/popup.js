document.addEventListener('DOMContentLoaded', function() {
	// Create popup button objects
	var $openPicturePotTabButton = document.getElementById('openPicturePotTab'),
		$selectPageElementButton = document.getElementById('selectPageElement'),
		$getAllPageImagesButton = document.getElementById('getAllPageImages'),
		$deleteImagesButton = document.getElementById('deleteImages'),
		$imgObjGlobal = {
			links: []
		};

	// Enables core.js for current tab
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.type === "enable") {
			// chrome.browserAction.enable(sender.tab.id);
			chrome.pageAction.enable(sender.tab.id);
		}

		sendResponse({});
		function send(request) {
			chrome.tabs.sendMessage(sender.tab.id, request, function(response) {});
		}
	});

	chrome.pageAction.onClicked.addListener(function onClicked(tab) {
		chrome.tabs.sendMessage(tab.id, { type: "start" }, function(response) {});
	});

	// Select an html element on the page and grab its images
	// Sends message to core.js content script
	$selectPageElementButton.addEventListener('click', function() {
		// Get actual page tab (not chrome extention)
		chrome.tabs.query({ currentWindow: true, active: true },
			function (tabArray) {
				console.log(tabArray[0].id);
				chrome.tabs.sendMessage(tabArray[0].id, { type: "start" }, function(response) {});
			}
		);
		// Close chrome extension
		window.close();
	}, false);

	// Removes all images from global images array
	$deleteImagesButton.addEventListener('click', function() {
		$imgObjGlobal.links = [];
		chrome.storage.local.set($imgObjGlobal);
	}, false);

	// Gets all images on current page and adds them to global images array
	$getAllPageImagesButton.addEventListener('click', function() {
		var imgObj = {
			links: ''
		};
		chrome.tabs.executeScript({
			code: '(' + function(params) {
				var imgs = document.getElementsByTagName("img"),
					imgSrcs = [];

				console.log(imgs);
				for (var i = 0; i < imgs.length; i++) {
					if (imgs[i].src && imgs[i].height && imgs[i].width && imgs[i].height > 1 && imgs[i].width > 1) {
						imgSrcs.push(imgs[i].src);
					}
				}
				params.links = imgSrcs;
				console.log(params.links);
				return params.links;

			} + ')(' + JSON.stringify(imgObj) + ');'
		}, function(result) {
			console.log(result[0]);

			$imgObjGlobal.links = result[0];
			chrome.storage.local.get(["links"], function(items){
				console.log('gothere');
				console.log(items.links);
				console.log(items.links.length);
				console.log($imgObjGlobal.links);

				if (items.links.length) {
					$imgObjGlobal.links = $imgObjGlobal.links.concat(items.links);
					console.log($imgObjGlobal.links);
				}

				chrome.storage.local.set($imgObjGlobal);
			});
		});
	}, false);

	// Opens the image pot tab and displays all images from global images array
	$openPicturePotTabButton.addEventListener('click', function() {
		chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
			if (changeInfo.status == 'complete') {
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
					chrome.tabs.sendMessage(tabs[0].id, {message: "updateImages"}, function(response) {
						// alert(response.response);
					});
				});
			}
		});

		chrome.tabs.create({'url': chrome.extension.getURL('picture_pot_tab.html'), 'active': true}, function(tab) {
			// Tab opened.
		});
	}, false);
}, false);

//Get message from content script
// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         //Alert the message
//         alert('The message from the content script: ' + request.method);//You have to choose which part of the response you want to display ie. request.method
//         //Construct & send a response
//         sendResponse({
//             response: "Message received"
//         });
//     }
// );
