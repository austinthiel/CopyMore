const electron = require('electron');
const ipc = require('electron').ipcRenderer;

const currentWindow = electron.remote.getCurrentWindow();
const settings = currentWindow.settings;

$('#setting-open-at-cursor').prop('checked', settings.openAtCursorPosition);

$('#setting-open-at-cursor').change(function cc() {
  ipc.send('setting-change-openAtCursor', this.checked);
});

$('#hide-to-tray-btn').click(() => {
  ipc.send('hide-to-tray-btn');
});
