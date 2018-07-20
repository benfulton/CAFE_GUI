const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const dialog = require('electron').dialog;
const { spawn, execSync } = require('child_process');


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

function launch(arguments) {
    arguments[arguments.length-1] = arguments[arguments.length-1] + '"';

    arguments.unshift("\"/home/befulton/Documents/GIT/CAFExp/bin/cafexp");
    arguments.unshift("-c");


    console.log(arguments.join(" "));

    const { spawn, execSync } = require('child_process');

    const bat = spawn(`bash.exe`,  arguments, {shell: true });

    bat.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    bat.stderr.on('data', (data) => {
        console.log(data.toString());
    });

    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
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
    const file = dialog.showOpenDialog({properties: ['openFile']});
    win.send('treefile', file)
});

ipcMain.on('select_family', () => {
    const file = dialog.showOpenDialog({properties: ['openFile']});
    win.send('famfile', file)
});
/*
*/

