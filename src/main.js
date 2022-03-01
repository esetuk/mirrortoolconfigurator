//array of parameters
//KEY: 0=name, 1=default, 2=element, 3=type, 4=optional
let setDefaults = true;
let parameterList;
let platform = "windows"
document.getElementById(platform).checked = true;
function update() {
    let s = "";
    let isOutputValid = 0;
    if (document.getElementById("windows").checked) platform = "windows"; else platform = "linux";
    if (setDefaults){
        document.getElementById("enableMirror").checked = true;
        document.getElementById("enableRepository").checked = false;
        document.getElementById("enableGlobal").checked = false;
        document.getElementById("enableOptional").checked = false;
        if (platform == "windows") baseDirectory = "c:\\temp\\mirrorTool\\"; else baseDirectory = "/tmp/mirrorTool/";
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
        if (setDefaults)
        {
            document.getElementById(parameterList[i][0]).value = parameterList[i][1];
            document.getElementById(parameterList[i][0]).checked = parameterList[i][1];
        }
        let o = document.getElementsByClassName("optional");
        //iterate through optional parameters, hide them if enableoptional is not checked
        for (let i = 0; i < o.length; i++) {
            if (document.getElementById("enableOptional").checked) o[i].style.display = "block"; else o[i].style.display = "none";
        }
        //iterate through all the parameters
        if (document.getElementById(parameterList[i][0]) != null) {
            //check if section is enabled, if so allow the mandatory parameters to be written to the output
            if ((document.getElementById("enableMirror").checked && parameterList[i][3] == "mirror") ||
                (document.getElementById("enableRepository").checked && parameterList[i][3] == "repository") ||
                (document.getElementById("enableGlobal").checked && parameterList[i][3] == "global")) {
                //check if either optional parameters are enabled or optional parameters are disabled and current parameter is mandatory
                if (document.getElementById("enableOptional").checked || !document.getElementById("enableOptional").checked && parameterList[i][4] == false) {
                    switch (parameterList[i][2]) {
                        case ("text"):
                            //write parameter and args for text box
                            if (document.getElementById(parameterList[i][0]).value != "") s += "--" + parameterList[i][0] + " " + document.getElementById(parameterList[i][0]).value + " ";
                            break;
                        case ("checkbox"):
                            //write parameter for checkbox
                            if (document.getElementById(parameterList[i][0]).checked) s += "--" + parameterList[i][0] + " ";
                            break;
                        case ("select"):
                            //write parameter for currently selected item in dropdown box
                            if (document.getElementById(parameterList[i][0]).options[document.getElementById(parameterList[i][0]).selectedIndex].text != "none") s += "--" + parameterList[i][0] + " " + document.getElementById(parameterList[i][0]).options[document.getElementById(parameterList[i][0]).selectedIndex].value + " ";
                            break;
                    }
                }
            }
        }
        //if field is empty and mandatory then highlight the field red, modify the placeholder text, and declare the output as invalid
        if (document.getElementById(parameterList[i][0]).value == "" && !parameterList[i][4]) {
            document.getElementById(parameterList[i][0]).style.borderColor = "red";
            document.getElementById(parameterList[i][0]).placeholder = "This field cannot be blank";
            isOutputValid++
        } else {
            document.getElementById(parameterList[i][0]).style.borderColor = "lightgrey";
        }
    }
    //if the number of invalid fields are more than 0 or mandatory sections are disabled the disable the copy button, otherwise show it
    if (isOutputValid > 0 || (!document.getElementById("enableMirror").checked && !document.getElementById("enableRepository").checked)) {
        document.getElementById("copyButton").disabled = true;
    } else {
        document.getElementById("copyButton").disabled = false;
    }
    //trim whitespace
    s = s.trim();
    //check if there is anything to write and if the output is valid
    if (s.length != 0 && isOutputValid == 0) {
        if (document.getElementById("windows").checked) document.getElementById("commandLinePreview").value = "MirrorTool.exe " + s; else document.getElementById("commandLinePreview").value = "sudo ./MirrorTool " + s
    } else document.getElementById("commandLinePreview").value = "";
    //show or hide sections
    if (document.getElementById("enableMirror").checked) document.getElementById("mirror").style.display = "block"; else document.getElementById("mirror").style.display = "none";
    if (document.getElementById("enableRepository").checked) document.getElementById("repository").style.display = "block"; else document.getElementById("repository").style.display = "none";
    if (document.getElementById("enableGlobal").checked) document.getElementById("global").style.display = "block"; else document.getElementById("global").style.display = "none";
    //workaround for auto-sizing the command line preview box
    document.getElementById("commandLinePreview").setAttribute("style", "height: 0px");
    document.getElementById("commandLinePreview").setAttribute("style", "height:" + (document.getElementById("commandLinePreview").scrollHeight) + "px;overflow-y:hidden;");
    setDefaults = false;
    //scroll to bottom (to ensure that when enabling (unhiding) a section, it is fully visible on the page)
    window.scrollTo(0,document.body.scrollHeight);
}
update();
//copy to clipboard
var clipboard = new Clipboard(document.getElementById('copyButton'), {
    text: function (trigger) {
        update();
        return document.getElementById("commandLinePreview").value;
    }
});
//event listeners for updating command line preview
document.getElementById("exportButton").addEventListener("click", function (event) {
    //do something
});
document.getElementById("saveButton").addEventListener("click", function (event) {
    //do something
});
let input = document.querySelectorAll("input");
for (i = 0; i < input.length; i++) {
    input[i].addEventListener("input", function (event) {
        update();
    });
}
document.getElementById("mirrorType").addEventListener("input", function (event) { update(); });
document.getElementById("mirrorFileFormat").addEventListener("input", function (event) { update(); });
document.getElementById("excludedProducts").addEventListener("input", function (event) { update(); });
document.getElementById("windows").addEventListener("click", function (event) {
    setDefaults = question();
    update(); 
});
document.getElementById("linux").addEventListener("click", function (event) {
    setDefaults = question();
    update(); 
});
function question(){
    return (confirm("Reset all mandatory parameters to their platform specific default values?"));
}