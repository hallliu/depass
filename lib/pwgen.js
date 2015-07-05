"use strict";
exports.genPw = genPw;
exports.checkPw = checkPw;
var CJS = require("./sha256");

function base64_map(words, map) {
    // Copied from CryptoJS and added argument to specify the charmap
    // Shortcuts
    var sigBytes = words.length * 4;

    // Convert
    var base64Chars = [];
    for (var i = 0; i < sigBytes; i += 3) {
        var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
        var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
        var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

        var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

        for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
            base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
        }
    }

    // Add padding
    var paddingChar = map.charAt(64);
    if (paddingChar) {
        while (base64Chars.length % 4) {
            base64Chars.push(paddingChar);
        }
    }

    return base64Chars.join('');
}

function generateAlphabet(options) {
    var alphabetString = "";
    if (options.uppercase === true) {
        alphabetString += "QWERTYUIOPASDFGHJKLZXCVBNM";
    }
    if (options.numbers === true) {
        alphabetString += "1234567890";
    }
    if (options.symbols === true) {
        alphabetString += "!@#$%^&*()~`{}[];:<>,.?/";
    }

    var paddingArr = [];
    for (var i = 0; i < 64 - alphabetString.length; i++) {
        paddingArr.push(i % 26 + 97);
    }
    var paddingString = String.fromCharCode.apply(null, paddingArr) + "=";
    alphabetString += paddingString;

    return alphabetString;
}

function genPw(master, sitename, options) {
    var alphabet = generateAlphabet(options);
    var hash = CJS.CryptoJS.SHA256(master + sitename + "ITER".repeat(options.modifiers || 0));
    return base64_map(hash.words.slice(0, 3), alphabet);
}

function checkPw(master) {
    var alphabet = generateAlphabet({});
    var hash = CJS.CryptoJS.SHA256(master);
    return base64_map(hash.words.slice(0, 3), alphabet);
}

/*
$(function() {
    $("#generate").on("click", function() {
        var masterPw = $("#masterpw").val();
        var sitename = $("#sitename").val();
        var options = {};
        if ($("#incl-uppercase").prop("checked"))
            options.uppercase = true;
        if ($("#incl-symbols").prop("checked"))
            options.symbols = true;
        if ($("#incl-numbers").prop("checked"))
            options.numbers = true;

        console.log(genPw(masterPw, sitename, options));
    });
});*/
