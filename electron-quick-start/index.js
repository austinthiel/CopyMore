const ipc = require('electron').ipcRenderer;

$('#setting-open-at-cursor').change(function cc() {
  ipc.send('setting-change-openAtCursor', this.checked);
});
