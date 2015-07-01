self.on("click", function(node) {
    $(node).addClass("pwManagerSelectedField");
    self.postMessage(window.location.hostname);
});
