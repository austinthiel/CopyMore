const electron = require('electron');
const { globalShortcut, ipcMain } = require('electron');
const { clipboard } = require('electron');
const { Tray, Menu } = require('electron');
const User32Module = require('./lib/user32');
const SettingsModule = require('./lib/settings');

const user32 = new User32Module();

let foregroundHWnd;

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

const clipboardWatcher = require('./lib/electron-clipboard-watcher');
const Positioner = require('electron-positioner');

const STATIC_PATH = path.join(__dirname, 'static');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let childWindow;
let positioner;
let settings;
let screen = null;

const settingsAccessor = new SettingsModule({
  onSettingChange: (key, value) => {
    childWindow.webContents.send('setting-changed', key, value);
    mainWindow.webContents.send('setting-changed', key, value);
    settings[key] = value;
  },
});

settings = settingsAccessor.loadAllSettings();
let tray = null;

function createTray() {
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
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 350, height: 400, title: 'TEST', icon: './build/background.png',
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(STATIC_PATH, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  mainWindow.settings = settings;

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
    pathname: path.join(STATIC_PATH, 'copylist.html'),
    protocol: 'file:',
    slashes: true,
  }));

  childWindow.settings = settings;

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
    if (settings.openAtCursorPosition) {
      const mouse = screen.getCursorScreenPoint();
      const currScreenSize = screen.getDisplayNearestPoint(mouse).workArea;
      const childWindowWidth = childWindow.getSize()[0];
      const childWindowHeight = childWindow.getSize()[1];
      let xVal = mouse.x;
      let yVal = mouse.y;
      if (mouse.x > currScreenSize.width - childWindowWidth) {
        xVal = currScreenSize.width - childWindowWidth;
      }
      if (mouse.y > currScreenSize.height - childWindowHeight) {
        yVal = currScreenSize.height - childWindowHeight;
      }
      childWindow.setPosition(xVal, yVal);
    } else {
      positioner.move('bottomRight');
    }
    childWindow.webContents.send('render');
    childWindow.show();
    childWindow.focus();
  }
  childIsVisible = !childIsVisible;
}

function setHotkeys() {
  globalShortcut.register('F8', () => {
    foregroundHWnd = user32.GetForegroundWindow();
    toggleChildWindow();
  });
}

function clipboardListener() {
  clipboardWatcher({
    watchDelay: 20,
    callOnlyAny: true,
    onImageChange: (nativeImage) => {
      childWindow.webContents.send('add-new-copy', nativeImage);
    },
    onTextChange: (text) => {
      childWindow.webContents.send('add-new-copy', text);
    },
    onAnyChange: (val) => {
      childWindow.webContents.send('add-new-copy', val);
    },
  });
}

/*
IPC Callbacks
*/

ipcMain.on('log', (e, message) => {
  console.log(message);
});

ipcMain.on('set-clipboard-value', (e, val) => {
  if (typeof val === 'string') {
    clipboard.writeText(val);
  } else {
    clipboard.writeImage(val);
  }
});

ipcMain.on('toggleChildWindow', () => {
  toggleChildWindow();
});

ipcMain.on('setting-change-openAtCursor', (e, val) => {
  settingsAccessor.setByKey('openAtCursorPosition', val);
});

ipcMain.on('setting-change-autoPasteOnSelection', (e, val) => {
  settingsAccessor.setByKey('autoPasteOnSelection', val);
});

ipcMain.on('hide-to-tray-btn', () => {
  mainWindow.minimize();
});

/*
App Events
*/
app.on('ready', () => {
  screen = electron.screen;
  setHotkeys();
  clipboardListener();

  createWindow();
  createChildWindow();
  createTray();
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
