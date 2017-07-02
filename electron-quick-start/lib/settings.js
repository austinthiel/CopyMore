const storage = require('electron-json-storage');

function SettingsModule(callback) {
  // Set defaults. loadAllSettings will overwrite if the setting is already saved.
  const settings = {
    openAtCursorPosition: false,
    autoPasteOnSelection: false,
  };

  this.getByKey = key => settings[key];

  this.setByKey = (key, data) => {
    storage.set(key, data);
    settings[key] = data;
    if (callback.onSettingChange) {
      callback.onSettingChange(key, data);
    }
  };

  this.loadAllSettings = () => {
    const keyNames = Object.keys(settings);
    for (let i = 0; i < keyNames.length; i += 1) {
      storage.get(keyNames[i], (error, data) => {
        if (error || data == null) {
          storage.set(keyNames[i], settings[keyNames[i]]);
        } else {
          settings[keyNames[i]] = data;
        }
      });
    }
    return settings;
  };
}

module.exports = SettingsModule;
