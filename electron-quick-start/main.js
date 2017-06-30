const electron = require('electron');
const { globalShortcut, ipcMain } = require('electron');
const { clipboard } = require('electron');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

const clipboardWatcher = require('electron-clipboard-watcher');
const Positioner = require('electron-positioner');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let childWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800, height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    childWindow.close();
  });
}

function createChildWindow() {
  childWindow = new BrowserWindow({
    show: false, frame: false, width: 400, height: 300,
  });
  const positioner = new Positioner(childWindow);
  positioner.move('bottomRight');

  childWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'copylist.html'),
    protocol: 'file:',
    slashes: true,
  }));

  // Emitted when the window is closed.
  childWindow.on('closed', () => {
    childWindow = null;
  });
}

let childIsVisible = false;

function toggleChildWindow() {
  if (childIsVisible) {
    childWindow.hide();
  } else {
    childWindow.show();
    childWindow.focus();
  }
  childIsVisible = !childIsVisible;
}

function setHotkeys() {
  globalShortcut.register('CommandOrControl+X', () => {
    toggleChildWindow();
  });
}

function clipboardListener() {
  clipboardWatcher({
    watchDelay: 50, // optional
    onImageChange: (nativeImage) => {
      console.log(nativeImage);
    },
    onTextChange: (text) => {
      // console.log(text);
      childWindow.webContents.send('add-new-copy', text);
    },
  });
}

ipcMain.on('log', (e, message) => {
  console.log(message);
});
ipcMain.on('set-clipboard-value', (e, val) => {
  clipboard.writeText(val);
});
ipcMain.on('toggleChildWindow', () => {
  toggleChildWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  setHotkeys();
  clipboardListener();

  createWindow();
  createChildWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll();
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
