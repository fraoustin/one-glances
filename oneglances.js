console.log("run oneglances.js");

var limit = null;
var all =null;
var circles = [];
var colorCircle = ['rgb(76,175,80)', 'rgb(68,138,255)', 'rgb(255,152,0)', 'rgb(255,64,129)']; //['green', 'blue', 'orange', 'red'];
var colorClassName = ['default', 'careful', 'warning', 'critical'];

function addBadge(id, cnt) {
    var badge = document.getElementById(id).getElementsByClassName("mdl-badge")[0];
    badge.removeAttribute('data-badge');
    if (cnt > 0) {
        badge.setAttribute('data-badge',cnt);        
    }
}

function waitIhmStart() {
    var dialog = document.getElementById("waitihm")
    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    };
    dialog.showModal();
}
function waitIhmStop() {
    var dialog = document.getElementById("waitihm")
    dialog.close();
}


function clickCloseDialog() {
    var dialog = document.querySelector('dialog');
    dialog.close();
}

function OpenChartTemporary(data, label, yAxes) {
    // var data = {"values" : [],  "labels" : []};
    // var label = "label";
    // var yAxes = [];
    var dialog = document.querySelector('dialog');
    var showDialogButton = document.querySelector('#show-dialog');
    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    };

    while (document.getElementById("dialog-content").firstChild) {
        document.getElementById("dialog-content").removeChild(document.getElementById("dialog-content").firstChild);
    }
    var chart = document.createElement('canvas');
    chart.setAttribute("id","chartTemporary");
    //manage width of dialog in css and here
    chart.setAttribute("width",screen.width * 0.9);
    chart.setAttribute("height","200px");
    document.getElementById("dialog-content").appendChild(chart);

    var ctx = document.getElementById("chartTemporary");
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets:[{
                label : label,
                data : data.values,
                pointRadius : 0,
                borderColor : 'rgb(68,138,255)'
                
            }]
        },
        options: {
            animation: {
                duration: 0
            },
            legend: {
                position: 'bottom'
            },
            scales: {
                yAxes: yAxes,
                xAxes: [
                    {
                        display: false
                    }
                    ],
            },                
        responsive: false,
        maintainAspectRatio: false
        }
    });
    
    dialog.showModal();
}

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
    for (var i = 0; i < levels.length; ++i) {
        if (value >= levels[i]) { color = colorClassName[i+1]}
    };
    // cleanColor
    for (var i = 0; i < colorClassName.length; ++i) {
        if (colorClassName[i] in elt.classList) { elt.classList.remove(colorClassName[i])}
    };
    elt.classList.add(color);
}

function updateColorEltText(elt, level, value) {
    // level normal
    color = colorClassName[0];
    if (level != value) {
        color = colorClassName[3];        
    }
    // cleanColor
    for (var i = 0; i < colorClassName.length; ++i) {
        if (colorClassName[i] in elt.classList) { elt.classList.remove(colorClassName[i])}
    };
    elt.classList.add(color);
}

function updateColorCircle(ci, levels, value) {
    // levels: careful, warning, critical
    color = colorCircle[0];
    for (var i = 0; i < levels.length; ++i) {
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
        var def = [[1, 'o', 0], [1024, 'ko', 2], [1024*1024, 'Mo', 2], [1024*1024*1024, 'Go', 2], [1024*1024*1024*1024, 'To', 2]];
        for(var i=0; i<def.length; i++){
            if(aSize<def[i][0]) return (aSize/def[i-1][0]).toFixed(def[i-1][2])+' '+def[i-1][1];
        }
        return (aSize/def[def.length-1][0]).toFixed(def[def.length-1][2])+' '+def[def.length-1][1]
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
        if(checkPanel("speedtest", all.speedtest)) {viewSpeedtest()};
        if(checkPanel("port", all.ports)) {viewPort()};
        if(checkPanel("diskio", all.diskio)) {viewDiskIO()};
        if(checkPanel("filesys", all.fs)) {viewFileSYS()};
        if(checkPanel("sensors", all.sensors)) {viewSensor()};
        if(checkPanel("logfiles", all.logfiles)) {viewLogfiles()};
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
    
    //Badge
    var cntBadge = document.getElementById('quicklook').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('quicklook').getElementsByClassName('warning').length;
    addBadge('shortcut-quicklook', cntBadge)
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
    
    // chart memory
    var graphMemory = function(event) {
        waitIhmStart();
        callGlances("mem/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.percent.length; i >= 1 ; --i) {
                    data.labels.push(datas.percent[datas.percent.length - i][0])
                    data.values.push(datas.percent[datas.percent.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "Memory", [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
            }

        });
    };
    document.getElementById("circles-memory-mem").parentElement.addEventListener('click', graphMemory);
    document.getElementById("circles-quicklook-mem").addEventListener('click', graphMemory);
    //Badge
    var cntBadge = document.getElementById('memory').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('memory').getElementsByClassName('warning').length;
    var cntBadge = cntBadge + document.getElementById('swap').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('swap').getElementsByClassName('warning').length;
    addBadge('shortcut-memory', cntBadge)

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
    
    // chart swap
    var graphSwap = function(event) {
        waitIhmStart();
        callGlances("swap/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.percent.length; i >= 1 ; --i) {
                    data.labels.push(datas.percent[datas.percent.length - i][0])
                    data.values.push(datas.percent[datas.percent.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "Swap", [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
            }

        });
    };
    document.getElementById("circles-swap-swap").addEventListener('click', graphSwap);
    document.getElementById("circles-quicklook-swap").addEventListener('click', graphSwap);
    //Badge
    var cntBadge = document.getElementById('memory').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('memory').getElementsByClassName('warning').length;
    var cntBadge = cntBadge + document.getElementById('swap').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('swap').getElementsByClassName('warning').length;
    addBadge('shortcut-memory', cntBadge)

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

    
    // chart cpu
    var graphCpu = function(event) {
        waitIhmStart();
        callGlances("cpu/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.system.length; i >= 1 ; --i) {
                    data.labels.push(datas.system[datas.system.length - i][0])
                    data.values.push(datas.user[datas.system.length - i][1]+datas.system[datas.system.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "Cpu", [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
            }

        });
    };
    document.getElementById("circles-cpu-cpu").addEventListener('click', graphCpu);
    document.getElementById("circles-quicklook-cpu").addEventListener('click', graphCpu);
    
    // chart cpu user
    var graphCpuUser = function(event) {
        waitIhmStart();
        callGlances("cpu/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.system.length; i >= 1 ; --i) {
                    data.labels.push(datas.system[datas.system.length - i][0])
                    data.values.push(datas.user[datas.system.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "Cpu User", [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
            }

        });
    };
    document.getElementById("cpu-user").addEventListener('click', graphCpuUser);

    // chart cpu system
    var graphCpuSystem = function(event) {
        waitIhmStart();
        callGlances("cpu/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.system.length; i >= 1 ; --i) {
                    data.labels.push(datas.system[datas.system.length - i][0])
                    data.values.push(datas.system[datas.system.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "Cpu System", [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
            }

        });
    };
    document.getElementById("cpu-system").addEventListener('click', graphCpuSystem);

    // cpu by cpu
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
        
        // chart by cpu by dialog
        document.getElementById("cpu"+i).addEventListener('click', function(event) {
            waitIhmStart();
            var targetElement = event.target || event.srcElement;
            var idCpu = targetElement.id.substring(3,targetElement.id.length);
            callGlances("percpu/history", function processRequestPerCpuChart(e) {
                if (e.target.readyState == 4 && e.target.status == 200) {
                    var datas = JSON.parse(e.target.responseText);
                    var data = {"values" : [], "labels" : []};
                    for (var k = datas[idCpu+'_system'].length; k >= 1 ; --k) {
                        data.labels.push(datas[idCpu+'_system'][datas[idCpu+'_system'].length - k][0])
                        data.values.push(datas[idCpu+'_user'][datas[idCpu+'_system'].length - k][1]+datas[idCpu+'_system'][datas[idCpu+'_system'].length - k][1])
                    } 
                    waitIhmStop();
                    OpenChartTemporary(data, "Cpu " + idCpu, [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
                }

            });
        });
    }
    //Badge
    var cntBadge = document.getElementById('cpu').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('cpu').getElementsByClassName('warning').length;
    addBadge('shortcut-cpu', cntBadge)

}


function viewLoad() {
    document.getElementById("load-cpucore").innerText = all.load.cpucore;
    updateColorElt(document.getElementById("load-cpucore"), [limit.load.load_careful, limit.load.load_warning, limit.load.load_critical] , all.load.cpucore);
    document.getElementById("load-min1").innerText = all.load.min1;
    document.getElementById("load-min5").innerText = all.load.min5;
    document.getElementById("load-min15").innerText = all.load.min15;   
    
    // chart min1
    var graphMin1 = function(event) {
        waitIhmStart();
        callGlances("load/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.min1.length; i >= 1 ; --i) {
                    data.labels.push(datas.min1[datas.min1.length - i][0])
                    data.values.push(datas.min1[datas.min1.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "load min1", [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
            }

        });
    };
    document.getElementById("load-min1").addEventListener('click', graphMin1);

    // chart min5
    var graphMin5 = function(event) {
        waitIhmStart();
        callGlances("load/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.min5.length; i >= 1 ; --i) {
                    data.labels.push(datas.min5[datas.min5.length - i][0])
                    data.values.push(datas.min5[datas.min5.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "load min5", [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
            }

        });
    };
    document.getElementById("load-min5").addEventListener('click', graphMin5);

    // chart min15
    var graphMin15 = function(event) {
        waitIhmStart();
        callGlances("load/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.min15.length; i >= 1 ; --i) {
                    data.labels.push(datas.min15[datas.min15.length - i][0])
                    data.values.push(datas.min15[datas.min15.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "load min15", [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
            }

        });
    };
    document.getElementById("load-min15").addEventListener('click', graphMin15);
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
    //Badge
    var cntBadge = document.getElementById('alert').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('alert').getElementsByClassName('warning').length;
    addBadge('shortcut-alert', cntBadge)
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
            //updateColorElt(document.getElementById("net"+i).getElementsByTagName("td")[1], [limit.network.network_rx_careful, limit.network.network_rx_warning, limit.network.network_rx_critical] , all.network[i].rx);    
            //updateColorElt(document.getElementById("net"+i).getElementsByTagName("td")[2], [limit.network.network_tx_careful, limit.network.network_tx_warning, limit.network.network_tx_critical] , all.network[i].tx);  
        }
    }
    //Badge
    var cntBadge = document.getElementById('network').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('network').getElementsByClassName('warning').length;
    var cntBadge = cntBadge + document.getElementById('port').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('port').getElementsByClassName('warning').length;
    addBadge('shortcut-network', cntBadge)
}

function viewSpeedtest() {
    document.getElementById("speedtest-ip").innerText = all.speedtest.ip;
    document.getElementById("speedtest-client").innerText = all.speedtest.client;
    document.getElementById("speedtest-distance").innerText = all.speedtest.distance;
    document.getElementById("speedtest-download").innerText = FileConvertSize(all.speedtest.download);
    document.getElementById("speedtest-upload").innerText = FileConvertSize(all.speedtest.upload);
    
    // chart download
    var graphSpeedtestDownload = function(event) {
        waitIhmStart();
        callGlances("speedtest/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.download.length; i >= 1 ; --i) {
                    data.labels.push(datas.download[datas.download.length - i][0])
                    data.values.push(datas.download[datas.download.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "Download", []);
            }

        });
    };
    document.getElementById("speedtest-download").addEventListener('click', graphSpeedtestDownload);
    
    // chart upload
    var graphSpeedtestUpload = function(event) {
        waitIhmStart();
        callGlances("speedtest/history", function processRequestPerCpuChart(e) {
            if (e.target.readyState == 4 && e.target.status == 200) {
                var datas = JSON.parse(e.target.responseText);
                var data = {"values" : [], "labels" : []};
                for (var i = datas.upload.length; i >= 1 ; --i) {
                    data.labels.push(datas.upload[datas.upload.length - i][0])
                    data.values.push(datas.upload[datas.upload.length - i][1])
                }
                waitIhmStop();
                OpenChartTemporary(data, "Upload", []);
            }

        });
    };
    document.getElementById("speedtest-upload").addEventListener('click', graphSpeedtestUpload);
}

function viewLogfiles() {
    var templateLogfiles=`<h3>specPath</h3><span>specExtract</span>`
    var divLogfiles = document.getElementById("logiles").getElementsByClassName("mdl-card__supporting-text")[0];
    while (divLogfiles.firstChild) {
        divLogfiles.removeChild(divLogfiles.firstChild);
    }
    for (var i = 0; i < all.logfiles.length; ++i) {
        divLogfiles.appendChild(htmlToElement(
            templateLogfiles.replace("specPath",all.logfiles[i].path)
                            .replace("specExtract",all.logfiles[i].extract)
                            ));
        }
    }
}

function viewPort() {
    var templatePort=`<tr id="portspecId"><td  class="mdl-data-table__cell--non-numeric no-mobile">specName</td><td  class="mdl-data-table__cell--non-numeric only-mobile">specName</td><td class="no-mobile">specStatus</td><td>specElapsed</td></tr>`
    var port = document.getElementById("port").getElementsByTagName("tbody")[0];
    while (port.firstChild) {
        port.removeChild(port.firstChild);
    }
    for (var i = 0; i < all.ports.length; ++i) {
        port.appendChild(htmlToElement(
            templatePort.replace("specName",all.ports[i].description)
                .replace("specName",all.ports[i].description)
                .replace("specStatus",all.ports[i].status)
                .replace("specElapsed",defaultJson(all.ports[i], "elapsed", ""))
                .replace("specId",i)
            ));
        if (all.ports[i].status == false) {
            document.getElementById("port"+i).getElementsByTagName("td")[1].classList.add("critical")
            document.getElementById("port"+i).getElementsByTagName("td")[2].classList.add("critical")
        } else {
            document.getElementById("port"+i).getElementsByTagName("td")[1].classList.add("default")
            document.getElementById("port"+i).getElementsByTagName("td")[2].classList.add("default")
        }
    }
    //Badge
    var cntBadge = document.getElementById('network').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('network').getElementsByClassName('warning').length;
    var cntBadge = cntBadge + document.getElementById('port').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('port').getElementsByClassName('warning').length;
    addBadge('shortcut-network', cntBadge)
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
    var templateFileSYS=`<tr><td class="mdl-data-table__cell--non-numeric">specName</td><td class="mdl-data-table__cell--non-numeric no-mobile">specMnt</td><td class="no-mobile">specUsed</td><td>specTotal</td><td id="fsspecId">specPercent%</td></tr>`
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
    //Badge
    var cntBadge = document.getElementById('filesys').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('filesys').getElementsByClassName('warning').length;
    var cntBadge = cntBadge + document.getElementById('sensor').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('sensor').getElementsByClassName('warning').length;
    addBadge('shortcut-diskio', cntBadge)
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
    //Badge
    var cntBadge = document.getElementById('filesys').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('filesys').getElementsByClassName('warning').length;
    var cntBadge = cntBadge +document.getElementById('sensor').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('sensor').getElementsByClassName('warning').length;
    addBadge('shortcut-diskio', cntBadge)
}

function viewThread() {
    document.getElementById("thread-total").innerText = all.processcount.total;
    document.getElementById("thread-thread").innerText = all.processcount.thread;
    document.getElementById("thread-run").innerText = all.processcount.running;
    document.getElementById("thread-sleep").innerText = all.processcount.sleeping;

    var templateThread=`<tr id="threadspecId"><td>specCpu</td><td class="no-mobile">specMem</td><td class="no-mobile">specUser</td><td>specCommand</td></tr>`
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
    //Badge
    var cntBadge = document.getElementById('thread').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('thread').getElementsByClassName('warning').length;
    addBadge('shortcut-thread', cntBadge)
}

function viewDocker() {
    document.getElementById("docker-info").innerText = all.docker.version.Components[0].Version;

    var templateDocker=`<tr id="dockerspecId"><td class="mdl-data-table__cell--non-numeric no-mobile">specName</td><td  class="mdl-data-table__cell--non-numeric only-mobile">specName</td><td class="no-mobile">specStatus</td><td id="CpuspecName">specCpu%</td><td class="no-mobile">specMem</td><td class="no-mobile">specWrite</td><td class="no-mobile">specRead</td><td class="no-mobile">specRWrite</td><td class="no-mobile">specRRead</td></tr>`
    var docker = document.getElementById("docker").getElementsByTagName("tbody")[0];
    while (docker.firstChild) {
        docker.removeChild(docker.firstChild);
    }
    for (var i = 0; i < all.docker.containers.length; ++i) {
        docker.appendChild(htmlToElement(
            templateDocker.replace("specName",all.docker.containers[i].name)
                .replace("specName",all.docker.containers[i].name)
                .replace("specStatus",all.docker.containers[i].Status)
                .replace("specCpu",(all.docker.containers[i].cpu_percent).toFixed(1))
                .replace("specMem",FileConvertSize(all.docker.containers[i].memory_usage))
                .replace("specWrite",FileConvertSize(all.docker.containers[i].io_w))
                .replace("specRead",FileConvertSize(all.docker.containers[i].io_r))
                .replace("specRWrite",FileConvertSize(all.docker.containers[i].network_rx))
                .replace("specRRead",FileConvertSize(all.docker.containers[i].network_tx))
                .replace("specId",i)
                .replace("specId",i)
                .replace("specName",all.docker.containers[i].name)
            ));
            updateColorEltText(document.getElementById("docker"+i).getElementsByTagName('td')[1], 'running' , all.docker.containers[i].Status);
            updateColorEltText(document.getElementById("docker"+i).getElementsByTagName('td')[2], 'running' , all.docker.containers[i].Status);

            
        // chart by cpu by docker
        document.getElementById("Cpu"+all.docker.containers[i].name).addEventListener('click', function(event) {
            waitIhmStart();
            var targetElement = event.target || event.srcElement;
            var idCpu = targetElement.id.substring(3,targetElement.id.length);
            callGlances("docker/history", function processRequestPerCpuChart(e) {
                if (e.target.readyState == 4 && e.target.status == 200) {
                    var datas = JSON.parse(e.target.responseText);
                    var data = {"values" : [], "labels" : []};
                    for (var k = datas[idCpu+'_cpu_percent'].length; k >= 1 ; --k) {
                        data.labels.push(datas[idCpu+'_cpu_percent'][datas[idCpu+'_cpu_percent'].length - k][0])
                        data.values.push(datas[idCpu+'_cpu_percent'][datas[idCpu+'_cpu_percent'].length - k][1])
                    } 
                    waitIhmStop();
                    OpenChartTemporary(data, "Cpu " + idCpu, [{ ticks: { min: 0, max: 100, stepSize: 50 } }]);
                }

            });
        });
    }
    //Badge
    var cntBadge = document.getElementById('docker').getElementsByClassName('critical').length;
    var cntBadge = cntBadge + document.getElementById('docker').getElementsByClassName('warning').length;
    addBadge('shortcut-docker', cntBadge)
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
