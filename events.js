ipcRenderer.on("treefile", function(event, arg) {
    document.querySelector("#treefile").innerText = path.basename(arg);
    localStorage.setItem("treefile", arg);
    return false;
});

ipcRenderer.on("treedata", function(event, arg) {
    draw_tree(arg);
    return false;
});

ipcRenderer.on("famdata", function(event, arg) {
    draw_families(arg.text);
    return false;
});


ipcRenderer.on("famfile", function(event, arg) {
    document.querySelector("#famfile").innerText = path.basename(arg);
    localStorage.setItem("famfile", arg);
    return false;
});

ipcRenderer.on("show_results", function(event, arg) {
    document.querySelector("#output").innerText = arg;
    return false;
});

document.querySelector("#launch").addEventListener("click", function(event){
    ipcRenderer.send('cafe', get_parameters());
});

document.querySelector("#select_tree").addEventListener("click", function(event){
    ipcRenderer.send('select_tree', null);
    return false;
});

document.querySelector("#select_family").addEventListener("click", function(event){
    ipcRenderer.send('select_family', null);
    return false;
});