"use strict";

$(function () {
    var date = new Date();
    var timestamp = date.getTime();
    var scriptName = "js/scripts.js?v=" + timestamp;

    $("#remove_script").attr("src", scriptName);
});