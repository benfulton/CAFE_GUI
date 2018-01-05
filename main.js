const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const dialog = require('electron').dialog;

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

ipcMain.on('cafe', (event, args) => {
    console.log(args);

    const { exec } = require('child_process');
    const path = "Documents/GIT/CAFExp/bin";
    const x = "/mnt/c/Users/befulton/";
    const treefile = x + "Documents/GIT/CAFExp/examples/mammals_tree.txt"
    const famfile = x + "Documents/GIT/CAFExp/Base_asr_k4a1l001.txt"
    if (args.action == 'simulate') {
        const bat = exec(`bash -c "./cafexp -s -t ${treefile} -f ${famfile} -k ${args.k} -a ${args.alpha} -l ${args.lambda}"`);

        bat.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        bat.stderr.on('data', (data) => {
            console.log(data.toString());
        });

        bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
        });
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

