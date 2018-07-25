console.log("run oneglances.js");

var limit = null;
var all =null;
var circles = [];
var colorCircle = ['rgb(76,175,80)', 'rgb(68,138,255)', 'rgb(255,152,0)', 'rgb(255,64,129)']; //['green', 'blue', 'orange', 'red'];
var colorClassName = ['default', 'careful', 'warning', 'critical'];

function checkPanel(panel, elt) {
    if (elt) {
        try {
            var shortcut = document.getElementById("shortcut-"+ panel);
            shortcut.classList.remove('nodisplay')
        } catch (error) {}
        return true;
    } else {
        try {
            var shortcut = document.getElementById("shortcut-"+ panel);
            shortcut.classList.add('nodisplay')
        } catch (error) {}
        try {
            var pan = document.getElementById(panel);
            pan.classList.add('nodisplay')
        } catch (error) {}
        return false;
    }
}

function defaultJson(parent, son, def) {
    try {
        return parent[son]
    } catch (error) {
        return def
    }
}

function updateColorElt(elt, levels, value) {
    // levels: careful, warning, critical
    color = colorClassName[0];
    for (var i = 0; i < levels; ++i) {
        if (value >= levels[i]) { color = colorClassName[i+1]}
    };
    // cleanColor
    for (var i = 0; i < colorClassName; ++i) {
        if (colorClassName[i] in elt.classList) { elt.classList.remove(colorClassName[i])}
    };
    elt.classList.add(color);
}

function updateColorCircle(ci, levels, value) {
    // levels: careful, warning, critical
    color = colorCircle[0];
    for (var i = 0; i < levels; ++i) {
        if (value >= levels[i]) { color = colorCircle[i+1]}
    };
    ci.updateColors(['#FFFFFF', color]);
}

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
        if(checkPanel("system", all.system)) {viewSystem()};
        if(checkPanel("cpu", all.cpu)) {viewCpu()};
        if(checkPanel("memory", all.mem)) {viewMemory()};
        if(checkPanel("swap", all.memswap)) {viewSwap()};
        if(checkPanel("load", all.load)) {viewLoad()};
        if(checkPanel("alert", all.alert)) {viewAlert()};
        if(checkPanel("network", all.network)) {viewNetwork()};
        if(checkPanel("port", all.ports)) {viewPort()};
        if(checkPanel("diskio", all.diskio)) {viewDiskIO()};
        if(checkPanel("filesys", all.fs)) {viewFileSYS()};
        if(checkPanel("sensors", all.sensors)) {viewSensor()};
        if(checkPanel("processlist", all.system)) {viewThread()};
        if(checkPanel("docker", all.system)) {viewDocker()};
    };
}

function viewQuickLook() {
    document.getElementById("quicklook-hostname").innerText = all.system.hostname;
    circles[0].update(all.quicklook.cpu);
    updateColorCircle(circles[0], [limit.quicklook.cpu_careful, limit.quicklook.cpu_warning, limit.quicklook.cpu_critical] , all.quicklook.cpu)
    updateColorElt(document.getElementById("quickbox-cpu"), [limit.quicklook.cpu_careful, limit.quicklook.cpu_warning, limit.quicklook.cpu_critical] , all.quicklook.cpu)
    circles[1].update(all.quicklook.mem);
    updateColorCircle(circles[1], [limit.quicklook.mem_careful, limit.quicklook.mem_warning, limit.quicklook.mem_critical] , all.quicklook.mem)
    updateColorElt(document.getElementById("quickbox-mem"), [limit.quicklook.mem_careful, limit.quicklook.mem_warning, limit.quicklook.mem_critical] , all.quicklook.mem)
    circles[2].update(all.quicklook.swap);
    updateColorCircle(circles[2], [limit.quicklook.swap_careful, limit.quicklook.swap_warning, limit.quicklook.swaps_critical] , all.quicklook.swap)
    updateColorElt(document.getElementById("quickbox-swap"), [limit.quicklook.swap_careful, limit.quicklook.swap_warning, limit.quicklook.swaps_critical] , all.quicklook.swap)
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
    updateColorCircle(circles[3], [limit.mem.mem_careful, limit.mem.mem_warning, limit.mem.mem_critical] , all.mem.percent);
    updateColorElt(document.getElementById("circles-memory-mem"), [limit.mem.mem_careful, limit.mem.mem_warning, limit.mem.mem_critical] , all.mem.percent);
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
    circles[4].update(all.memswap.percent);
    updateColorCircle(circles[4], [limit.memswap.memswap_careful, limit.memswap.memswap_warning, limit.memswap.memswap_critical] , all.memswap.percent);
    updateColorElt(document.getElementById("circles-swap-swap"), [limit.memswap.memswap_careful, limit.memswap.memswap_warning, limit.memswap.memswap_critical] , all.memswap.percent);
    document.getElementById("swap-sout").innerText = FileConvertSize(all.memswap.sout);
    document.getElementById("swap-used").innerText = FileConvertSize(all.memswap.used);
    document.getElementById("swap-total").innerText = FileConvertSize(all.memswap.total);
    document.getElementById("swap-free").innerText = FileConvertSize(all.memswap.free);
    document.getElementById("swap-sin").innerText = FileConvertSize(all.memswap.sin);
}

function viewCpu() {
    circles[5].update(all.cpu.total);
    updateColorCircle(circles[5], [limit.quicklook.cpu_careful, limit.quicklook.cpu_warning, limit.quicklook.cpu_critical] , all.cpu.total);
    updateColorElt(document.getElementById("circles-cpu-cpu"), [limit.quicklook.cpu_careful, limit.quicklook.cpu_warning, limit.quicklook.cpu_critical] , all.cpu.total);
    document.getElementById("cpu-user").innerText = all.cpu.user;
    updateColorElt(document.getElementById("cpu-user"), [limit.cpu.cpu_user_careful, limit.cpu.cpu_user_warning, limit.cpu.cpu_user_critical] , all.cpu.user);
    document.getElementById("cpu-system").innerText = all.cpu.system;
    updateColorElt(document.getElementById("cpu-system"), [limit.cpu.cpu_system_careful, limit.cpu.cpu_system_warning, limit.cpu.cpu_system_critical] , all.cpu.system);
    document.getElementById("cpu-idle").innerText = all.cpu.idle;
    document.getElementById("cpu-nice").innerText = all.cpu.nice;
    document.getElementById("cpu-irq").innerText = all.cpu.irq;
    document.getElementById("cpu-iowait").innerText = all.cpu.iowait;
    updateColorElt(document.getElementById("cpu-iowait"), [limit.cpu.cpu_iowait_careful, limit.cpu.cpu_iowait_warning, limit.cpu.cpu_iowait_critical] , all.cpu.iowait);
    document.getElementById("cpu-steal").innerText = all.cpu.steal;
    updateColorElt(document.getElementById("cpu-steal"), [limit.cpu.cpu_steal_careful, limit.cpu.cpu_steal_warning, limit.cpu.cpu_steal_critical] , all.cpu.steal);
    document.getElementById("cpu-ctx_sw").innerText = all.cpu.ctx_switches;
    updateColorElt(document.getElementById("cpu-ctx_sw"), [limit.cpu.cpu_ctx_switches_careful, limit.cpu.cpu_ctx_switches_warning, limit.cpu.cpu_ctx_switches_critical] , all.cpu.ctx_switches);
    document.getElementById("cpu-inter").innerText = all.cpu.interrupts;
    document.getElementById("cpu-sw_int").innerText = all.cpu.soft_interrupts;

    var templateCpu=`<tr><td>Cpu specId</td><td><span id="cpuspecId" class="space-left">specPercent%</span></td></tr>`
    var byCpu = document.getElementById("bycpu");
    while (byCpu.firstChild) {
        byCpu.removeChild(byCpu.firstChild);
    }
    for (var i = 0; i < all.percpu.length; ++i) {
        byCpu.appendChild(htmlToElement(
                            templateCpu.replace("specId",i)
                                .replace("specPercent",all.percpu[i].total)
                                .replace("specId",i)
                        ));
        updateColorElt(document.getElementById("cpu"+i), [limit.quicklook.cpu_careful, limit.quicklook.cpu_warning, limit.quicklook.cpu_critical] , all.percpu[i].total);
    }
    
    callGlances("cpu/history", processRequestCpuChart);

}

function processRequestCpuChart(e) {
    if (e.target.readyState == 4 && e.target.status == 200) {
        var datas = JSON.parse(e.target.responseText);
        var data = {"system" : [], "user" : [], "total" : [], "labels" : []};
        for (var i = datas.system.length; i >= 1 ; --i) {
            data.labels.push(datas.system[datas.system.length - i][0])
            data.system.push(datas.system[datas.system.length - i][1])
            data.user.push(datas.user[datas.system.length - i][1])
            data.total.push(datas.user[datas.system.length - i][1]+datas.system[datas.system.length - i][1])
        } 
        var ctx = document.getElementById("chartCpu");
        var myLineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets:[{
                    label : 'system',
                    data : data.system,
                    pointRadius : 0,
                    borderColor : rgb(76,175,80)
                    
                },{
                    label : 'user',
                    data : data.user,
                    pointRadius : 0,
                    borderColor : rgb(68,138,255)
                },{
                    label : 'total',
                    data : data.total,
                    pointRadius : 0,
                    borderColor : rgb(255,64,129)
                }]
            },
            options: {
                legend: {
                    position: 'right'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 100,
                            stepSize: 50
                        }
                    }],
                    xAxes: [
                        {
                            display: false
                        }
                      ],
                },                
            responsive: true,
            maintainAspectRatio: false
            }
        });
    };
}

function viewLoad() {
    document.getElementById("load-cpucore").innerText = all.load.cpucore;
    updateColorElt(document.getElementById("load-cpucore"), [limit.load.load_careful, limit.load.load_warning, limit.load.load_critical] , all.load.cpucore);
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
    var templateNetwork=`<tr id="netspecId"><td class="mdl-data-table__cell--non-numeric">specInterfaceName</td><td>specRx</td><td>specTx</td></tr>`
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
                                .replace("specId",i)
                            ));
            updateColorElt(document.getElementById("net"+i).getElementsByTagName("td")[1], [limit.network.network_rx_careful, limit.network.network_rx_warning, limit.network.network_rx_critical] , all.network[i].rx);    
            updateColorElt(document.getElementById("net"+i).getElementsByTagName("td")[2], [limit.network.network_tx_careful, limit.network.network_tx_warning, limit.network.network_tx_critical] , all.network[i].tx);  
        }
    }
}

function viewPort() {
    var templatePort=`<tr id="portspecId"><td  class="mdl-data-table__cell--non-numeric">specName</td><td>specStatus</td><td>specElapsed</td></tr>`
    var port = document.getElementById("port").getElementsByTagName("tbody")[0];
    while (port.firstChild) {
        port.removeChild(port.firstChild);
    }
    for (var i = 0; i < all.ports.length; ++i) {
        port.appendChild(htmlToElement(
            templatePort.replace("specName",all.ports[i].description)
                .replace("specStatus",all.ports[i].status)
                .replace("specElapsed",defaultJson(all.ports[i], "elapsed", ""))
                .replace("specId",i)
            ));
        if (all.ports[i].status == false) {
            document.getElementById("port"+i).getElementsByTagName("td")[1].classList.add("critical")
        } else {
            document.getElementById("port"+i).getElementsByTagName("td")[1].classList.add("default")
        }
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
    var templateFileSYS=`<tr><td class="mdl-data-table__cell--non-numeric">specName</td><td>specMnt</td><td>specUsed</td><td>specTotal</td><td id="fsspecId">specPercent%</td></tr>`
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
                .replace("specId",i)
            ));
        updateColorElt(document.getElementById("fs"+i), [limit.fs.fs_careful, limit.fs.fs_warning, limit.fs.fs_critical] , all.fs[i].percent);
    }
}

function viewSensor() {
    var templateSensor=`<tr><td class="mdl-data-table__cell--non-numeric">specName</td><td id="sensorspecId">specValue</td></tr>`
    var sensor = document.getElementById("sensor").getElementsByTagName("tbody")[0];
    while (sensor.firstChild) {
        sensor.removeChild(sensor.firstChild);
    }
    for (var i = 0; i < all.sensors.length; ++i) {
        sensor.appendChild(htmlToElement(
            templateSensor.replace("specName",all.sensors[i].label)
                .replace("specValue",all.sensors[i].value+all.sensors[i].unit)
                .replace("specId",i)
            ));
        updateColorElt(document.getElementById("sensor"+i), [limit.sensors[all.sensors[i].type+"_careful"], limit.sensors[all.sensors[i].type+"_warning"], limit.sensors[all.sensors[i].type+"_critical"]] , all.sensors[i].value);
    }
}

function viewThread() {
    document.getElementById("thread-total").innerText = all.processcount.total;
    document.getElementById("thread-thread").innerText = all.processcount.thread;
    document.getElementById("thread-run").innerText = all.processcount.running;
    document.getElementById("thread-sleep").innerText = all.processcount.sleeping;

    var templateThread=`<tr id="threadspecId"><td>specCpu</td><td>specMem</td><td class="no-mobile">specUser</td><td>specCommand</td></tr>`
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
                .replace("specId",i)
            ));
        updateColorElt(document.getElementById("thread"+i).getElementsByTagName('td')[0], [limit.processlist.processlist_cpu_careful, limit.processlist.processlist_cpu_warning, limit.processlist.processlist_cpu_critical] , procs[i].cpu_percent);
        updateColorElt(document.getElementById("thread"+i).getElementsByTagName('td')[1], [limit.processlist.processlist_mem_careful, limit.processlist.processlist_mem_warning, limit.processlist.processlist_mem_critical] , procs[i].memory_percent);
    }
}

function viewDocker() {
    document.getElementById("docker-info").innerText = all.docker.version.Components[0].Version;

    var templateDocker=`<tr><td class="mdl-data-table__cell--non-numeric">specName</td><td>specStatus</td><td>specCpu%</td><td>specMem</td><td class="no-mobile">specWrite</td><td class="no-mobile">specRead</td><td class="no-mobile">specRWrite</td><td class="no-mobile">specRRead</td></tr>`
    var docker = document.getElementById("docker").getElementsByTagName("tbody")[0];
    while (docker.firstChild) {
        docker.removeChild(docker.firstChild);
    }
    for (var i = 0; i < all.docker.containers.length; ++i) {
        docker.appendChild(htmlToElement(
            templateDocker.replace("specName",all.docker.containers[i].name)
                .replace("specStatus",all.docker.containers[i].Status)
                .replace("specCpu",(all.docker.containers[i].cpu_percent).toFixed(1))
                .replace("specMem",FileConvertSize(all.docker.containers[i].memory_usage))
                .replace("specWrite",FileConvertSize(all.docker.containers[i].io_w))
                .replace("specRead",FileConvertSize(all.docker.containers[i].io_r))
                .replace("specRWrite",FileConvertSize(all.docker.containers[i].network_rx))
                .replace("specRRead",FileConvertSize(all.docker.containers[i].network_tx))
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
        colors:    ['#FFFFFF', 'green']
    }))
    circles.push(Circles.create({
        id:         "circles-quicklook-mem",
        value:		0,
        radius:     24,
        width:      2,
        colors:     ['#FFFFFF', 'green']
    }))
    circles.push(Circles.create({
        id:         "circles-quicklook-swap",
        value:		0,
        radius:     24,
        width:      2,
        colors:     ['#FFFFFF', 'green']
    }))
    circles.push(Circles.create({
        id:         "circles-memory-mem",
        value:		0,
        radius:     40,
        width:      10,
        colors:     ['#FFFFFF', 'green']
    }))
    circles.push(Circles.create({
        id:         "circles-swap-swap",
        value:		0,
        radius:     40,
        width:      10,
        colors:     ['#FFFFFF', 'green']
    }))
    circles.push(Circles.create({
        id:         "circles-cpu-cpu",
        value:		0,
        radius:     40,
        width:      10,
        colors:     ['#FFFFFF', 'green']
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
