"use strict";
var cm = require("sdk/context-menu");
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var ToggleButton = require("sdk/ui/button/toggle").ToggleButton;
var panel = require("sdk/panel");
var {genPw, checkPw} = require("./pwgen");

var storage = require("sdk/simple-storage").storage;
if (!storage.options) {
    storage.options = {};
}

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
    onHide: handleHide,
    onShow: handleShow
});

settingsPanel.port.on("setMasterPw", function(pw) {
    storage.masterPwHash = checkPw(pw);
    settingsPanel.port.emit("pwCheckResult", true);
});

settingsPanel.port.on("checkThisPw", function(pw) {
    if (checkPw(pw) === storage.masterPwHash) {
        settingsPanel.port.emit("pwCheckResult", true);
    } else {
        settingsPanel.port.emit("pwCheckResult", false);
    }
});

settingsPanel.port.on("optionsChange", function(updatedOptions) {
    var tabs = require("sdk/tabs");
    workers[tabs.activeTab.id].port.once("hostNameIs", function(hn) {
        var existingOptions = getOptionsFromStorage(hn);
        for (var optName in updatedOptions) {
            if (updatedOptions.hasOwnProperty(optName)) {
                existingOptions[optName] = updatedOptions[optName];
            }
        }
        storage.options[hn] = existingOptions;
    });
    workers[tabs.activeTab.id].port.emit("getHostname", {});
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

function handleShow() {
    var tabs = require("sdk/tabs");
    workers[tabs.activeTab.id].port.once("hostNameIs", function(hn) {
        var currentOptions = getOptionsFromStorage(hn);
        settingsPanel.port.emit("setOptionsDisplay", currentOptions);
    });
    workers[tabs.activeTab.id].port.emit("getHostname", {});
}

function getOptionsFromStorage(hostname) {
    var options = storage.options[hostname];
    if (options === undefined) {
        options = {
            uppercase: true,
            symbols: false,
            numbers: true
        };
        storage.options[hostname] = options;
    }
    return options;
}

var pwSetterMod = pageMod.PageMod({
    include: "*",
    contentScriptWhen: "ready",
    contentScriptFile: [data.url("jquery-2.1.4.min.js"), data.url("pwSetter.js")],
    attachTo: ["existing", "top"],
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
        settingsPanel.port.once("masterPwResult", function(masterPw) {
            var options = getOptionsFromStorage(hostname);
            var pwText = genPw(masterPw, hostname, options);
            workers[tabs.activeTab.id].port.emit("writePassword", pwText);
        });
        settingsPanel.port.emit("getMasterPw", {});
    }
});
