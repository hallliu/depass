"use strict";
var cm = require("sdk/context-menu");
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var ui = require("sdk/ui");
var genPw = require("./pwgen").genPw;

var workers = {};

var mangle = function(input) {
    return genPw("test master password", input, {uppercase: true, numbers: true, symbols: false});
};

var actionButton = ui.ActionButton({
    id: "options",
    label: "Options",
    icon: data.url("cursor.png")
});

var pwSetterMod = pageMod.PageMod({
    include: "*",
    contentScriptWhen: "ready",
    contentScriptFile: [data.url("jquery-2.1.4.min.js"), data.url("pwSetter.js")],
    onAttach: function(worker) {
        workers[worker.tab.id] = worker;
        var tabId = worker.tab.id;
        worker.on("detach", function() {
            if (workers[tabId] === worker) {
                delete workers[tabId];
            }
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
