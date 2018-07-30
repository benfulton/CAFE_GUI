const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const dialog = require('electron').dialog;
const { spawn, execSync } = require('child_process');
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

function countFileLines(filePath){
    return new Promise((resolve, reject) => {
        let lineCount = 0;
        fs.createReadStream(filePath)
            .on("data", (buffer) => {
                let idx = -1;
                lineCount--; // Because the loop will run once for idx=-1
                do {
                    idx = buffer.indexOf(10, idx+1);
                    lineCount++;
                } while (idx !== -1);
            }).on("end", () => {
            resolve(lineCount);
        }).on("error", reject);
    });
}

function readFileStart(path, num_chars) {
    try {
        var buf = new Buffer(num_chars);
        var fd = fs.openSync(path, 'r');
        fs.readSync(fd, buf, 0, num_chars, 0);
        fs.closeSync(fd);
        return buf;
    }
    catch(err)
    {
        console.log(err)
        return '';
    }
}

function read_increase_decrease(filename) {
    var lines = require('fs').readFileSync(filename, 'utf-8')
        .split('\n')
        .filter(Boolean);

    return lines.map( line => {
        const x = line.split('\t')
        const y = x[1].split('/');
        const inc = parseInt(y[0]);
        const dec = parseInt(y[1]);
        if (dec > inc)
            return [x[0], 'Decrease'];
        else if (inc > dec)
            return [x[0], 'Increase'];
        return [x[0], 'Constant'];
    }).reduce((hash, elem) => {
        hash[elem[0]] = elem[1];
        return hash;
    }, {});
}

function launch(arguments) {
    arguments[arguments.length-1] = arguments[arguments.length-1] + '"';

    arguments.unshift("\"/home/befulton/Documents/GIT/CAFExp/bin/cafexp");
    arguments.unshift("-c");


    console.log(arguments.join(" "));

    const { spawn, execSync } = require('child_process');

    const bat = spawn(`bash.exe`,  arguments, {shell: true });

    const x = { iteration: 1, lambda: 0, score: 0 };

    bat.stdout.on('data', (data) => {
        console.log(data.toString());
        const d = data.toString().split('\n');
        x.iteration++;
        d.forEach( v => {
            if (v.startsWith('Lambda: '))
                x.lambda = parseFloat(v.substring(9));
            if (v.startsWith('Score (-lnL): '))
                x.score = parseFloat(v.substring(14));
        });
        win.send('show_results', x)
    });

    bat.stderr.on('data', (data) => {
        dialog.showErrorBox("CAFE XP", data.toString());
    });

    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
        win.send('colortree', read_increase_decrease('Base_clade_results.txt'));
    });

    bat.on('error', function(err) {
        console.log('Error launching CAFE: ' + err);
    });
}

ipcMain.on('cafe', (event, args) => {
    console.log(args);

    const windows_treefile = execSync(`bash.exe -c "wslpath \\"${args.treefile}\\""`).toString().trim();
    const windows_famfile = execSync(`bash.exe -c "wslpath \\"${args.famfile}\\""`).toString().trim();

    if (args.action == 'simulate') {
            launch([
                "-s",
                "-t", windows_treefile,
                "-f", windows_famfile,
                "-k", args.k,
                "-a", args.alpha,
                "-l", args.lambda]);
    }

    if (args.action == 'estimate lambda') {
        launch(['-t', windows_treefile, '-i', windows_famfile]);
    }
});

ipcMain.on('select_tree', () => {
    try {
        const file = dialog.showOpenDialog({properties: ['openFile']});
        win.send('treefile', file[0])
        var data = fs.readFileSync(file.toString());
        win.send('treedata', data.toString());
    }
    catch(err)
    {
        console.log(err)
        win.send('treefile', '')
        win.send('treedata', '')
    }
});

ipcMain.on('update_tree', (event, args) => {
    try {
        var data = fs.readFileSync(args);
        win.send('treedata', data.toString())

    }
    catch(err)
    {
        console.log(err)
        win.send('treefile', '')
        win.send('treedata', '')
    }

});

ipcMain.on('update_family', (event, args) => {
    const c = countFileLines(args);
    var data = readFileStart(args, 1000);

    win.send('famdata', {lines: c, text: data.toString()})
});

ipcMain.on('select_family', () => {
    const file = dialog.showOpenDialog({properties: ['openFile']});
    win.send('famfile', file[0])
    const c = countFileLines(file[0]);
    var data = readFileStart(file[0], 1000);

    win.send('famdata', {lines: c, text: data.toString()})
});
/*
*/

