/*jshint esversion: 6 */

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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});
  childWindow = new BrowserWindow({show: false, frame: false, width: 250, height: 300});

  childWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'copylist.html'),
    protocol: 'file:',
    slashes: true
  }));

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    childWindow.close();
  });

  // Emitted when the window is closed.
  childWindow.on('closed', function () {
    childWindow = null;
  });
}

let childIsVisible = false;

function toggleChildWindow() {
  if (childIsVisible ? childWindow.hide() : childWindow.show());
  childIsVisible = !childIsVisible;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

  globalShortcut.register('CommandOrControl+X', () => {
    toggleChildWindow();
  });

  clipboardWatcher({
    // (optional) delay in ms between polls
    watchDelay: 50,

    // handler for when image data is copied into the clipboard
    onImageChange: function (nativeImage) {
      console.log(nativeImage);
    },

    // handler for when text data is copied into the clipboard
    onTextChange: function (text) {
    //  console.log(text);
      childWindow.webContents.send('add-new-copy', text);
    }
  });

  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll();
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipcMain.on('log', function (e) {
  console.log(e);
})