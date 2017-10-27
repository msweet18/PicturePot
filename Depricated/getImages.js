
var imgs = document.getElementsByTagName("img"),
	imgSrcs = [];

for (var i = 0; i < imgs.length; i++) {
	imgSrcs.push(imgs[i].src);
	console.log(imgs[i]);
}

