$(document).ready(function() {
    addon.port.on("pwCheckResult", function(valid) {
        $("#isValid").text(valid ? "Valid" : "Invalid");
    });

    addon.port.on("setOptionsDisplay", function(options) {
        for (optName in options) {
            if (options.hasOwnProperty(optName)) {
                $('#' + optName)[0].checked = options[optName];
            }
        }
    });

    $("#masterPassword")[0].oninput = function(event) {
        var enteredPw = $(event.target).val();
        if ($("#changePwButton").hasClass("active")) {
            addon.port.emit("setMasterPw", enteredPw);
        } else {
            addon.port.emit("checkThisPw", enteredPw);
        }
    };

    $(".pwOption").change(function(event) {
        options = {}
        options[event.target.id] = event.target.checked;
        addon.port.emit("optionsChange", options);
    });
});
