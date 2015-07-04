"use strict";
var cm = require("sdk/context-menu");
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var ToggleButton = require("sdk/ui/button/toggle").ToggleButton;
var panel = require("sdk/panel");
var genPw = require("./pwgen").genPw;

var workers = {};

var mangle = function(input) {
    return genPw("test master password", input, {uppercase: true, numbers: true, symbols: false});
};


var settingsButton = ToggleButton({
    id: "options",
    label: "Options",
    icon: data.url("cursor.png"),
    onChange: handleChange
});

var settingsPanel = panel.Panel({
    contentURL: data.url("settings.html"),
    contentStyleFile: [data.url("bootstrap.min.css"), data.url("bootstrap-theme.min.css")],
    onHide: handleHide
});

function handleChange(state) {
    if (state.checked) {
        settingsPanel.show({
            position: settingsButton
        });
    }
}

function handleHide() {
    settingsButton.state('window', {checked: false});
}

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
