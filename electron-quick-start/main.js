const electron = require('electron');
const { globalShortcut, ipcMain } = require('electron');
const { clipboard } = require('electron');
const { Tray, Menu } = require('electron');
const User32Module = require('./lib/user32');

const user32 = new User32Module();

let foregroundHWnd;
let openAtCursor = false;

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
let positioner;

let tray = null;

function hideToTray() {
  tray = new Tray('./build/background.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
    tray.destroy();
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350, height: 400, title: 'TEST', icon: './build/background.png',
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  mainWindow.on('minimize', () => {
    hideToTray();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    childWindow.close();
  });
}

function createChildWindow() {
  childWindow = new BrowserWindow({
    show: false,
    frame: false,
    width: 400,
    height: 300,
    webPreferences: {
      backgroundThrottling: false,
    },
  });
  positioner = new Positioner(childWindow);
  positioner.move('bottomRight');

  childWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'copylist.html'),
    protocol: 'file:',
    slashes: true,
  }));

  childWindow.on('closed', () => {
    childWindow = null;
  });
}

let childIsVisible = false;

function toggleChildWindow() {
  if (childIsVisible) {
    user32.ReturnAllFocusToWindow(foregroundHWnd);
    childWindow.hide();
  } else {
    if (openAtCursor) {
      const mouse = user32.GetCursorCoordinates();
      childWindow.setPosition(mouse.x, mouse.y);
    } else {
      positioner.move('bottomRight');
    }
    childWindow.show();
    childWindow.focus();
  }
  childIsVisible = !childIsVisible;
}

function setHotkeys() {
  globalShortcut.register('CommandOrControl+X', () => {
    foregroundHWnd = user32.GetForegroundWindow();
    toggleChildWindow();
  });
}

function clipboardListener() {
  clipboardWatcher({
    watchDelay: 20, // optional
    onImageChange: (nativeImage) => {
      console.log(nativeImage);
    },
    onTextChange: (text) => {
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
ipcMain.on('setting-change-openAtCursor', (e, val) => {
  console.log(`Changed Setting openAtCursor to ${val}`);
  openAtCursor = val;
});
ipcMain.on('hide-to-tray-btn', () => {
  console.log('hiding to tray via button');
  mainWindow.minimize();
});

app.on('ready', () => {
  setHotkeys();
  clipboardListener();

  createWindow();
  createChildWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { // OSX windows close to dock, not quit
    globalShortcut.unregisterAll();
    app.quit();
  }
});

app.on('activate', () => { // OSX reactivate from dock
  if (mainWindow === null) {
    createWindow();
  }
});
