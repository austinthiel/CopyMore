const electron = require('electron');
const ipc = require('electron').ipcRenderer;

const currentWindow = electron.remote.getCurrentWindow();
const settings = currentWindow.settings;

$('#setting-open-at-cursor').prop('checked', settings.openAtCursorPosition);
$('#setting-auto-paste-selection').prop('checked', settings.autoPasteOnSelection);

$('#setting-open-at-cursor').change(function cc() {
  ipc.send('setting-change-openAtCursor', this.checked);
});

$('#setting-auto-paste-selection').change(function cc() {
  ipc.send('setting-change-autoPasteOnSelection', this.checked);
});

$('#hide-to-tray-btn').click(() => {
  ipc.send('hide-to-tray-btn');
});
