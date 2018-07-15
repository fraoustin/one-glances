console.log("run oneglances.js");
var server = "192.168.0.55";
var port = 61208;
var url = "http://" + server + ":" + port + "/api/2/"

var limit = null;

function callGlances(url, processRequest, method="GET", async=true) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, async);
    xhr.send();
    xhr.onreadystatechange = processRequestLimit(nextFct);
} 

function processRequestLimit(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        limit = JSON.parse(e.target.responseText);
        console.log(limit);
    }
}

function load()
{
    callGlances(url +"all/limits", processRequestLimit);
}

load()
