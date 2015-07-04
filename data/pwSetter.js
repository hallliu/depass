self.port.on("writePassword", function(pwText) {
    var pwField = $(".pwManagerSelectedField");
    pwField.val(pwText);
    pwField.attr("type", "text");
    pwField.removeClass("pwManagerSelectedField");
});

self.port.on("getHostname", function() {
    self.port.emit("hostNameIs", window.location.hostname);
});
