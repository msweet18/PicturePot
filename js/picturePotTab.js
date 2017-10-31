

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.message === 'updateImages') {
			chrome.storage.local.get(/* String or Array */["links"], function(items){
				console.log(items);
				console.log(items.links.length);
				// Add the contents of options[0] to #foo:
				addImages(items.links);
			});

			initPicturePotTab();
		}
		sendResponse({
			response: "Message received"
		});
	}
);

var imageZoom = 0;

var initPicturePotTab = function() {
	// Show and hide image links when 'show-image-links-button' is clicked
	$('.js-show-image-links-button').click(function() {
		$(this).toggleClass('image-links-hidden');

		if (!$(this).hasClass('image-links-hidden')) {
			$(this).text('Hide Image Links');
		} else {
			$(this).text('Show Image Links');
		}

		$('.q-button-container').toggle('slow');
	});

	// Zoom in to modal image
	$('.zoom-in-modal').click(function() {
		var $modalImage = $('.q-modal-image')[0];

		$modalImage.style.height = ($modalImage.clientHeight*1.1).toString() + 'px';

	});

	// Zoom out to modal image
	$('.zoom-out-modal').click(function() {
		var $modalImage = $('.q-modal-image')[0];

		$modalImage.style.height = ($modalImage.clientHeight*.8).toString() + 'px';

	});

		// Zoom in to modal image
	$('.zoom-in-all').click(function() {
		var $allImages = $('.q-item-container'),
			imageZoomClass = 'q-image-zoom-';

		if (imageZoom <= 3) {
			$allImages.toggleClass(imageZoomClass + imageZoom.toString());
			imageZoom ++;
			$allImages.toggleClass(imageZoomClass + imageZoom.toString());
		}
	});

	// Zoom out to modal image
	$('.zoom-out-all').click(function() {
		var $allImages = $('.q-item-container'),
			imageZoomClass = 'q-image-zoom-';

		if (imageZoom >= 1) {
			$allImages.toggleClass(imageZoomClass + imageZoom.toString());
			imageZoom --;
			$allImages.toggleClass(imageZoomClass + imageZoom.toString());
		}
	});

	// Remove image styling when 'remove-image-styling-button' is clicked
	$('.js-remove-image-styling-button').click(function() {
		$(this).toggleClass('pretty');

		// Remove pretty styling from images
		$('.q-image-container').toggleClass('pretty');

		if (!$(this).hasClass('pretty')) {
			$(this).fadeOut(function() {
				$(this).text('Show Styling').fadeIn();
			});
		} else {
			$(this).fadeOut(function() {
				$(this).text('Remove Styling').fadeIn();
			});
		}
	});
};

var addImages = function(images){
	var container = document.getElementById('imagesContainer'),
		imagesArray = [];

	for(var i = 0; i < images.length; i++) {
		// Create the list item:
		var item = document.createElement('div'),
			imageContainer = document.createElement('div'),
			img = document.createElement('img'),
			buttonContainer = document.createElement('div'),
			loc = document.createElement('a'),
			locButton = document.createElement('button'),
			dest = document.createElement('a'),
			destButton = document.createElement('button');

		// Set imageContainer Props
		$(item).addClass('q-item-container').addClass('q-image-zoom-0');

		// Set imageContainer Props
		$(imageContainer).addClass('q-image-container').addClass('pretty');

		// Set Button Props
		$(buttonContainer).addClass('q-button-container');
		$(buttonContainer).attr('style', 'display:none');
		$(locButton).addClass('q-button');
		$(destButton).addClass('q-button');

		// Set Image Props
		$(img).addClass('q-image');
		$(img).data('id', i);
		$(imageContainer).data('id', i);
		img.src = images[i].imageSrc;

		// Set Location Props
		$(loc).addClass('q-image-src');
		$(locButton).text('Source');
		loc.href = images[i].imageLoc;
		loc.target = '_blank';
		loc.appendChild(locButton);

		// Set Destination Props
		$(dest).addClass('q-image-link');
		$(destButton).text('Link');
		if (images[i].imageDest !== "") {
			dest.href = images[i].imageDest;
			dest.target = '_blank';
			dest.appendChild(destButton);
			buttonContainer.appendChild(dest);
		}

		buttonContainer.appendChild(loc);
		imageContainer.appendChild(img);

		item.appendChild(imageContainer);
		item.appendChild(buttonContainer);

		// Add it to the list:
		container.appendChild(item);
		imagesArray.push(img);
	}

	setImageListener(imagesArray);
};

var setImageListener = function(images) {
	var $backgroundModalImageContainer = $('.q-modal-image-container'),
		$pageContainer = $('.q-page-container');

	$('.q-image').click(function() {
		var $parentContainer;

		if(!$pageContainer.hasClass('modal-shown')) {
			$(this).parent().addClass('q-modal-image-parent');
			$backgroundModalImageContainer[0].appendChild(this);
			$(this).addClass('q-modal-image');
		} else {
			$parentContainer = $('.q-modal-image-parent');
			$parentContainer[0].insertAdjacentElement('afterbegin', this);
			$parentContainer.removeClass('q-modal-image-parent');
			imageId = $(this).data('id');
			$(this).removeClass('q-modal-image');
		}

		$pageContainer.toggleClass('modal-shown');
	});
};