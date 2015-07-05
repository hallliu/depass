$(document).ready(function() {
    addon.port.on("pwCheckResult", function(valid) {
        $("#isValid").value = valid ? "Valid" : "Invalid";
    });

    addon.port.on("setOptionsDisplay", function(options) {
        // Set checkboxes to options given
    });

    $("#masterPassword").keypress(function(event) {
        var enteredPw = $(event.target).val();
        addon.port.emit("checkThisPw", enteredPw);
    });

    $(".pwOption").change(function(event) {
        options = {}
        options[event.target.id] = event.target.checked;
        addon.port.emit("optionsChange", options);
    });
});
