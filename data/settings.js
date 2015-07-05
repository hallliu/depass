$(document).ready(function() {
    addon.port.on("pwCheckResult", function(valid) {
        $("#feedbackPlace").removeClass("has-error has-success");
        $("#feedbackPlace").addClass(valid ? "has-success" : "has-error");
        $("#masterPwIcon").removeClass("glyphicon-ok glyphicon-remove");
        $("#masterPwIcon").addClass(valid ? "glyphicon-ok" : "glyphicon-remove");
    });

    addon.port.on("setOptionsDisplay", function(options) {
        for (optName in options) {
            if (options.hasOwnProperty(optName)) {
                if (optName == "modifiers") {
                    $('#' + optName).val(options[optName]);
                } else {
                    $('#' + optName)[0].checked = options[optName];
                }
            }
        }
    });

    addon.port.on("getMasterPw", function() {
        addon.port.emit("masterPwResult", $("#masterPassword").val());
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
        if (event.target.id === "modifiers") {
            options[event.target.id] = event.target.value;
        } else {
            options[event.target.id] = event.target.checked;
        }
        addon.port.emit("optionsChange", options);
    });
});
