console.log("run oneglances.js");

var limit = null;
var all =null;
var circles = [];

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function epochToDate(timestamp){
    var d = new Date(timestamp*1000);
    return (
        d.getFullYear() + "-" + 
        ("00" + (d.getMonth() + 1)).slice(-2) + "-" + 
        ("00" + d.getDate()).slice(-2) + " " + 
        ("00" + d.getHours()).slice(-2) + ":" + 
        ("00" + d.getMinutes()).slice(-2) + ":" + 
        ("00" + d.getSeconds()).slice(-2)
    );
}
function FileConvertSize(aSize){
    try {
        aSize = Math.abs(parseInt(aSize, 10));
        var def = [[1, 'octets'], [1024, 'ko'], [1024*1024, 'Mo'], [1024*1024*1024, 'Go'], [1024*1024*1024*1024, 'To']];
        for(var i=0; i<def.length; i++){
            if(aSize<def[i][0]) return (aSize/def[i-1][0]).toFixed(2)+' '+def[i-1][1];
        }        
    } catch (error) {
        return aSize;
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
        viewCpu();
        viewMemory();
        viewSwap();
        viewLoad();
        viewAlert();
        viewNetwork();
        viewPort();
        viewDiskIO();
        viewFileSYS();
        viewSensor();
        viewThread();
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

function viewLoad() {
    document.getElementById("load-cpucore").innerText = all.load.cpucore;
    document.getElementById("load-min1").innerText = all.load.min1;
    document.getElementById("load-min5").innerText = all.load.min5;
    document.getElementById("load-min15").innerText = all.load.min15;
}

function viewAlert() {
    var templateAlert=`<tr><td>spec0</td><td>spec1</td><td>spec2</td><td>spec3</td><td>spec4</td></tr>`
    var alertTable = document.getElementById("alert").getElementsByTagName("tbody")[0];
    while (alertTable.firstChild) {
        alertTable.removeChild(alertTable.firstChild);
    }
    for (var i = 0; i < all.alert.length; ++i) {
        alertTable.appendChild(htmlToElement(
            templateAlert.replace("spec0",epochToDate(all.alert[i][0]))
                            .replace("spec1",epochToDate(all.alert[i][1]))
                            .replace("spec2",all.alert[i][2])
                            .replace("spec3",all.alert[i][3])
                            .replace("spec4",all.alert[i][4])
                        ));
    }
}

function viewNetwork() {
    var templateNetwork=`<tr><td class="mdl-data-table__cell--non-numeric">specInterfaceName</td><td>specRx</td><td>specTx</td></tr>`
    var networkTable = document.getElementById("network").getElementsByTagName("tbody")[0];
    while (networkTable.firstChild) {
        networkTable.removeChild(networkTable.firstChild);
    }
    for (var i = 0; i < all.network.length; ++i) {
        if (all.network[i].rx > 0 && all.network[i].tx > 0) {
            networkTable.appendChild(htmlToElement(
                templateNetwork.replace("specInterfaceName",all.network[i].interface_name)
                                .replace("specRx",FileConvertSize(all.network[i].rx))
                                .replace("specTx",FileConvertSize(all.network[i].tx))
                            ));            
        }
    }
}

function viewPort() {
    var templatePort=`<tr><td class="mdl-data-table__cell--non-numeric">specName</td><td>specStatus</td></tr>`
    var port = document.getElementById("port").getElementsByTagName("tbody")[0];
    while (port.firstChild) {
        port.removeChild(port.firstChild);
    }
    for (var i = 0; i < all.ports.length; ++i) {
        port.appendChild(htmlToElement(
            templatePort.replace("specName",all.ports[i].description)
                .replace("specStatus",all.ports[i].status)
            ));
    }
}

function viewDiskIO() {
    var templateDiskIO=`<tr><td class="mdl-data-table__cell--non-numeric">specName</td><td>specRead/s</td><td>specWrite/s</td></tr>`
    var diskio = document.getElementById("diskio").getElementsByTagName("tbody")[0];
    while (diskio.firstChild) {
        diskio.removeChild(diskio.firstChild);
    }
    for (var i = 0; i < all.diskio.length; ++i) {
        diskio.appendChild(htmlToElement(
            templateDiskIO.replace("specName",all.diskio[i].disk_name)
                .replace("specRead",FileConvertSize(all.diskio[i].read_bytes))
                .replace("specWrite",FileConvertSize(all.diskio[i].write_bytes))
            ));
    }
}

function viewFileSYS() {
    var templateFileSYS=`<tr><td class="mdl-data-table__cell--non-numeric">specName</td><td>specMnt</td><td>specUsed</td><td>specTotal</td><td>specPercent%</td></tr>`
    var filesys = document.getElementById("filesys").getElementsByTagName("tbody")[0];
    while (filesys.firstChild) {
        filesys.removeChild(filesys.firstChild);
    }
    for (var i = 0; i < all.fs.length; ++i) {
        filesys.appendChild(htmlToElement(
            templateFileSYS.replace("specName",all.fs[i].mnt_point)
                .replace("specMnt",all.fs[i].device_name)
                .replace("specUsed",FileConvertSize(all.fs[i].used))
                .replace("specTotal",FileConvertSize(all.fs[i].size))
                .replace("specPercent",all.fs[i].percent)
            ));
    }
}

function viewSensor() {
    var templateSensor=`<tr><td class="mdl-data-table__cell--non-numeric">specName</td><td>specValue</td></tr>`
    var sensor = document.getElementById("sensor").getElementsByTagName("tbody")[0];
    while (sensor.firstChild) {
        sensor.removeChild(sensor.firstChild);
    }
    for (var i = 0; i < all.sensors.length; ++i) {
        sensor.appendChild(htmlToElement(
            templateSensor.replace("specName",all.sensors[i].label)
                .replace("specValue",all.sensors[i].value+all.sensors[i].unit)
            ));
    }
}

function viewThread() {
    document.getElementById("thread-total").innerText = all.processcount.total;
    document.getElementById("thread-thread").innerText = all.processcount.thread;
    document.getElementById("thread-run").innerText = all.processcount.running;
    document.getElementById("thread-sleep").innerText = all.processcount.sleeping;

    var templateThread=`<tr><td>specCpu</td><td>specMem</td><td class="no-mobile">specUser</td><td>specCommand</td></tr>`
    var thread = document.getElementById("thread").getElementsByTagName("tbody")[0];
    while (thread.firstChild) {
        thread.removeChild(thread.firstChild);
    }
    var procs = all.processlist
    procs.sort(function (a, b) {
        return a.cpu_percent < b.cpu_percent;
    });
    for (var i = 0; i < procs.length; ++i) {
        thread.appendChild(htmlToElement(
            templateThread.replace("specCpu",procs[i].cpu_percent)
                .replace("specMem",(procs[i].memory_percent).toFixed(1))
                .replace("specUser",procs[i].username)
                .replace("specCommand",procs[i].name)
            ));
    }
}


function init()
{
    circles.push(Circles.create({
        id:         "circles-quicklook-cpu",
        value:		0,
        radius:     24,
        width:      2,
        colors:     ['#FFFFFF', 'grey']
    }))
    circles.push(Circles.create({
        id:         "circles-quicklook-mem",
        value:		0,
        radius:     24,
        width:      2,
        colors:     ['#FFFFFF', 'grey']
    }))
    circles.push(Circles.create({
        id:         "circles-quicklook-swap",
        value:		0,
        radius:     24,
        width:      2,
        colors:     ['#FFFFFF', 'grey']
    }))
    circles.push(Circles.create({
        id:         "circles-memory-mem",
        value:		0,
        radius:     40,
        width:      10,
        colors:     ['#FFFFFF', 'grey']
    }))
    circles.push(Circles.create({
        id:         "circles-swap-swap",
        value:		0,
        radius:     40,
        width:      10,
        colors:     ['#FFFFFF', 'grey']
    }))
    circles.push(Circles.create({
        id:         "circles-cpu-cpu",
        value:		0,
        radius:     40,
        width:      10,
        colors:     ['#FFFFFF', 'grey']
    }))
}

function clickRefresh(){
    callGlances("all", processRequestAll);
}


function Autorefresh(){
    setTimeout(function(){
        callGlances("all", processRequestAll);
        Autorefresh();  
     }, 10000);
}

init();
callGlances("all/limits", processRequestLimit);
Autorefresh();
