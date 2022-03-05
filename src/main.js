//Globals
let setDefaults = true,
parameterList;
enableWindows.checked = true,
isWindows = true,
darkMode = true;
themeSwitcher.setAttribute("style", "filter: invert(100%)"); //Icon is black
function update() {
    let command = "",
    isOutputValid = 0;
    //Set base path dependent on platform
    if (enableWindows.checked){
        isWindows = true;
        baseDirectory = "c:\\mirrorTool\\";
    } else {
        baseDirectory = "/tmp/mirrorTool/";
        isWindows = false;
    }
    if (setDefaults){
        enableMirror.checked = true;
        enableRepository.checked = false;
        enableGlobal.checked = false;
        enableOptional.checked = false;
        //Master list of parameters
        //KEY: 0=name of parameter, 1=default value, 2=type of element, 3=section name, 4=optional
        parameterList = [
            ["mirrorType", "regular", "select", "mirror", false],
            ["intermediateUpdateDirectory", baseDirectory + "mirrorTemp", "text", "mirror", false],
            ["offlineLicenseFilename", baseDirectory + "offline.lf", "text", "mirror", false],
            ["updateServer", "", "text", "mirror", true],
            ["outputDirectory", baseDirectory + "mirror", "text", "mirror", false],
            ["proxyHost", "", "text", "global", true],
            ["proxyPort", "", "text", "global", true],
            ["proxyUsername", "", "text", "global", true],
            ["proxyPassword", "", "text", "global", true],
            ["networkDriveUsername", "", "text", "mirror", true],
            ["networkDrivePassword", "", "text", "mirror", true],
            ["excludedProducts", "none", "select", "mirror", true],
            ["repositoryServer", "AUTOSELECT", "text", "repository", false],
            ["intermediateRepositoryDirectory", baseDirectory + "repositoryTemp", "text", "repository", false],
            ["mirrorOnlyLevelUpdates", false, "checkbox", "mirror", true],
            ["outputRepositoryDirectory", baseDirectory + "repository", "text", "repository", false],
            ["mirrorFileFormat", "none", "select", "mirror", true],
            ["compatibilityVersion", "", "text", "mirror", true],
            ["filterFilePath", "", "text", "repository", true],
            ["trustDownloadedFilesInRepositoryTemp", false, "checkbox", "repository", true]
        ];
    }
    for (let i = 0; i < parameterList.length; i++) {
        //Aliases
        let pName = parameterList[i][0],
        pElement = document.getElementById(pName),
        pDefault = parameterList[i][1],
        pType = parameterList[i][2],
        pSection = parameterList[i][3],
        pOptional = parameterList[i][4];
        if (setDefaults)
        {
            pElement.value = pDefault;
            pElement.checked = pDefault;
        }
        let o = document.getElementsByClassName("optional");
        //Iterate through optional parameters, hide them if enableoptional is not checked
        for (let i = 0; i < o.length; i++) {
            enableOptional.checked ? o[i].style.display = "block" : o[i].style.display = "none";
        }
        //Iterate through all the parameters
        if (pElement != null) {
            //Check if section is enabled, if so allow the mandatory parameters to be written to the output
            if ((enableMirror.checked && pSection == "mirror") || (enableRepository.checked && pSection == "repository") || (enableGlobal.checked && pSection == "global")) {
                //Check if either optional parameters are enabled or optional parameters are disabled and current parameter is mandatory
                if (enableOptional.checked || !enableOptional.checked && parameterList[i][4] == false) {
                    switch (pType) {
                        case ("text"):
                            //Write parameter and args for text box
                            if (pElement.value != "") command += "<colorParameter>--" + pName + "</colorParameter> <colorArgument>" + pElement.value + "</colorArgument> ";
                            break;
                        case ("checkbox"):
                            //Write parameter for checkbox
                            if (pElement.checked) command += "<colorParameter>--" + pName + "</colorParameter> ";
                            break;
                            case ("select"):
                                //Write parameter for currently selected item in dropdown box and args
                            if (pElement.options[pElement.selectedIndex].text != "none") command += "<colorParameter>--" + pName + "</colorParameter> <colorArgument>" + pElement.options[pElement.selectedIndex].value + "</colorArgument> ";
                            break;
                        }
                }
            }
        }
        //If field is empty and mandatory then highlight the field red, modify the placeholder text, and declare the output as invalid
        if (pElement.value == "" && !pOptional) {
            pElement.style.borderColor = "red";
            pElement.placeholder = "This field cannot be blank";
            isOutputValid++
        } else {
            pElement.style.borderColor = "rgb(63, 63, 63)";
        }
    }
    //If the number of invalid fields are more than 0 or mandatory sections are disabled the disable the copy and download buttons, otherwise show them
    if (isOutputValid > 0 || (!enableMirror.checked && !enableRepository.checked)) {
        copyButton.disabled = true;
        downloadButton.disabled = true;
        commandPreview.disabled = true;
    } else {
        copyButton.disabled = false;
        downloadButton.disabled = false;
        commandPreview.disabled = false;
    }
    //Trim whitespace
    command = command.trim();
    //Check if there is anything to write and if the output is valid, if so write the platform specific prefix plus the commands to the command preview
    if (command.length != 0 && isOutputValid == 0) {
        enableWindows.checked ? commandPreview.innerHTML = "<colorStart>MirrorTool.exe</colorStart> " + command : commandPreview.innerHTML = "<colorStart>sudo ./MirrorTool</colorStart> " + command
    } else commandPreview.innerHTML = "<colorWarn>Some parameter sections are not enabled, or mandatory fields are empty. Check your configuration.</colorWarn>";
    //Show or hide sections based on checkbox states
    enableMirror.checked ? mirror.style.display = "block" : mirror.style.display = "none";
    enableRepository.checked ? repository.style.display = "block" : repository.style.display = "none";
    enableGlobal.checked ? global.style.display = "block" : global.style.display = "none";
    //Workaround for auto-sizing the command line preview box
    commandPreview.setAttribute("style", "height: 0px");
    commandPreview.setAttribute("style", "height:" + (commandPreview.scrollHeight) + "px;overflow-y:hidden;");
    setDefaults = false;
}
update();
//copy to clipboard
var clipboard = new Clipboard(document.getElementById('copyButton'), {
    text: function () {
        update();
        return commandPreview.textContent;
    }
});
//Main form event listener to update the command preview
main.addEventListener("input", function() { update(); });
//Dismiss info link event listener
dismissLink.addEventListener("click", function() { info.style.display = "none" });
//Event listeners for reset query
resetLink.addEventListener("click", function() { resetQuestion() });
enableWindows.addEventListener("click", function () { isWindows ? null : resetQuestion() });
enableLinux.addEventListener("click", function () { isWindows ? resetQuestion() : null });
//Download event listener
downloadButton.addEventListener("click", function (event) {
    if (enableWindows.checked) {
        download('test.bat', commandPreview.textContent);
         } else {
            let command = commandPreview.textContent;
            command = command.split("sudo ").pop();
            download('test.sh', command);
         }
});
//Scroll to bottom when section expands to ensure visibility
enableMirror.addEventListener("input", function() { update(); scrollToBottom() });
enableRepository.addEventListener("input", function() { update(); scrollToBottom() });
enableOptional.addEventListener("input", function() { update(); scrollToBottom() });
enableGlobal.addEventListener("input", function() { update(); scrollToBottom() });
//Theme switcher event listener
themeSwitcher.addEventListener("click", function() {
    darkMode ? darkMode = false : darkMode = true;
    update();
});
//Prevent accidental F5 keypress
document.addEventListener('keydown', (e) => {
    e = e || window.event;
    if(e.keyCode == 116){
        e.preventDefault();
    }
});
function scrollToBottom(){
    window.scrollTo(0,document.body.scrollHeight);
}
function resetQuestion(){
    setDefaults = confirm("Reset all settings and filters?");
    update();
}
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}