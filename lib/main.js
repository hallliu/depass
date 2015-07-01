"use strict";
var cm = require("sdk/context-menu");
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var workers = {};

var mangle = function(input) {
    return input + 'AAAAA';
};

var pwSetterMod = pageMod.PageMod({
    include: "*",
    contentScriptWhen: "ready",
    contentScriptFile: [data.url("jquery-2.1.4.min.js"), data.url("pwSetter.js")],
    onAttach: function(worker) {
        workers[worker.tab.id] = worker;
        worker.on("detach", function() {
            delete workers[worker.tab.id];
        });
    }
});

var genPwItem = cm.Item({
    label: "Generate password",
    context: cm.SelectorContext("input[type=password]"),
    contentScriptFile: [data.url("jquery-2.1.4.min.js"), data.url("contentScript.js")],
    onMessage: function(hostname) {
        var tabs = require("sdk/tabs");
        var pwText = mangle(hostname);
        workers[tabs.activeTab.id].port.emit("writePassword", pwText);
    }
});
