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
    document.querySelector("#iteration_lambda").innerText = arg.lambda;
    document.querySelector("#iteration_id").innerText = arg.iteration;
    document.querySelector("#iteration_score").innerText = arg.score;
    return false;
});

var nodeColorizer = function(element, data) {
};

ipcRenderer.on("colortree", function(event, arg) {
    $("#legend-increase-decrease").show();
    tree.style_nodes((element, data) => {
        const name = tree.descendants(data).map(n => n.name).sort().join('');
        console.log(name);
        if (arg[name] == 'Increase')
            element.style('fill', 'lightgreen');
        if (arg[name] == 'Decrease')
            element.style('fill', 'red');

    });
    tree.update();
});

$(function() {
    $("#launch").click(function (event) {
        ipcRenderer.send('cafe', get_parameters());
    });

    $("#select_tree").click(function (event) {
        ipcRenderer.send('select_tree', null);
        return false;
    });

    $("#select_family").click("click", function (event) {
        ipcRenderer.send('select_family', null);
        return false;
    });
});
