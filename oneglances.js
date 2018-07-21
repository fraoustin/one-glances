console.log("run oneglances.js");
var server = "127.0.0.1";
var port = 61208;
var url = "http://" + server + ":" + port + "/api/2/"

var limit = null;
var all =null;
var circles = [];

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function FileConvertSize(aSize){
	aSize = Math.abs(parseInt(aSize, 10));
	var def = [[1, 'octets'], [1024, 'ko'], [1024*1024, 'Mo'], [1024*1024*1024, 'Go'], [1024*1024*1024*1024, 'To']];
	for(var i=0; i<def.length; i++){
		if(aSize<def[i][0]) return (aSize/def[i-1][0]).toFixed(2)+' '+def[i-1][1];
	}
}

function callGlances(api, processRequest, method="GET", async=true, nextFct=null) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url+api, async);
    xhr.send();
    xhr.onreadystatechange = processRequest;
} 

function processRequestLimit(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        limit = JSON.parse(e.target.responseText);
        callGlances("all", processRequestAll);
    };
}

function processRequestAll(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        all = JSON.parse(e.target.responseText);
        viewQuickLook();
        viewSystem();
        viewMemory();
        viewSwap();
        viewCpu();
    };
}

function viewQuickLook() {
    document.getElementById("quicklook-hostname").innerText = all.system.hostname;
    circles[0].update(all.quicklook.cpu);
    circles[1].update(all.quicklook.mem);
    circles[2].update(all.quicklook.swap);
    document.getElementById("quicklook-procs").innerText = all.processcount.total + " PROCESS";
}

function viewSystem() {
    document.getElementById("system-hostname").innerText = all.system.hostname;
    document.getElementById("system-os_name").innerText = all.system.os_name;
    document.getElementById("system-os_version").innerText = all.system.os_version;
    document.getElementById("system-os_platform").innerText = all.system.platform;
    document.getElementById("system-uptime").innerText = all.uptime;
}

function viewMemory() {
    circles[3].update(all.mem.percent);
    document.getElementById("memory-available").innerText = FileConvertSize(all.mem.available);
    document.getElementById("memory-used").innerText = FileConvertSize(all.mem.used);
    document.getElementById("memory-cached").innerText = FileConvertSize(all.mem.cached);
    document.getElementById("memory-free").innerText = FileConvertSize(all.mem.free);
    document.getElementById("memory-inactive").innerText = FileConvertSize(all.mem.inactive);
    document.getElementById("memory-active").innerText = FileConvertSize(all.mem.active);
    document.getElementById("memory-shared").innerText = FileConvertSize(all.mem.shared);
    document.getElementById("memory-total").innerText = FileConvertSize(all.mem.total);
    document.getElementById("memory-buffers").innerText = FileConvertSize(all.mem.buffers);
}

function viewSwap() {
    circles[4].update(all.cpu.percent);
    document.getElementById("swap-sout").innerText = FileConvertSize(all.memswap.sout);
    document.getElementById("swap-used").innerText = FileConvertSize(all.memswap.used);
    document.getElementById("swap-total").innerText = FileConvertSize(all.memswap.total);
    document.getElementById("swap-free").innerText = FileConvertSize(all.memswap.free);
    document.getElementById("swap-sin").innerText = FileConvertSize(all.memswap.sin);
}

function viewCpu() {
    circles[5].update(all.cpu.total);
    document.getElementById("cpu-user").innerText = all.cpu.user;
    document.getElementById("cpu-system").innerText = all.cpu.system;
    document.getElementById("cpu-idle").innerText = all.cpu.idle;
    document.getElementById("cpu-nice").innerText = all.cpu.nice;
    document.getElementById("cpu-irq").innerText = all.cpu.irq;
    document.getElementById("cpu-iowait").innerText = all.cpu.iowait;
    document.getElementById("cpu-steal").innerText = all.cpu.steal;
    document.getElementById("cpu-ctx_sw").innerText = all.cpu.ctx_switches;
    document.getElementById("cpu-inter").innerText = all.cpu.interrupts;
    document.getElementById("cpu-sw_int").innerText = all.cpu.soft_interrupts;

    var templateCpu=`<tr><td>Cpu specId</td><td><span class="space-left">specPercent%</span></td></tr>`
    var byCpu = document.getElementById("bycpu");
    while (byCpu.firstChild) {
        byCpu.removeChild(byCpu.firstChild);
    }
    for (var i = 0; i < all.percpu.length; ++i) {
        byCpu.appendChild(htmlToElement(
                            templateCpu.replace("specId",i)
                                .replace("specPercent",all.percpu[i].total)
                        ));
    }

}


function load()
{
    circles.push(Circles.create({
        id:         "circles-quicklook-cpu",
        value:		0,
        radius:     24,
        width:      2,
        colors:     ['#FFFFFF', 'green']
    }))
    circles.push(Circles.create({
        id:         "circles-quicklook-mem",
        value:		0,
        radius:     24,
        width:      2,
        colors:     ['#FFFFFF', 'blue']
    }))
    circles.push(Circles.create({
        id:         "circles-quicklook-swap",
        value:		0,
        radius:     24,
        width:      2,
        colors:     ['#FFFFFF', 'orange']
    }))
    circles.push(Circles.create({
        id:         "circles-memory-mem",
        value:		0,
        radius:     40,
        width:      10,
        colors:     ['#FFFFFF', 'blue']
    }))
    circles.push(Circles.create({
        id:         "circles-swap-swap",
        value:		0,
        radius:     40,
        width:      10,
        colors:     ['#FFFFFF', 'blue']
    }))
    circles.push(Circles.create({
        id:         "circles-cpu-cpu",
        value:		0,
        radius:     40,
        width:      10,
        colors:     ['#FFFFFF', 'blue']
    }))
    callGlances("all/limits", processRequestLimit);
}

load()
