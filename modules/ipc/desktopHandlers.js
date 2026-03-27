const { ipcMain } = require('electron');
const { getSnapshot, getCapabilities } = require('./desktopMetrics');

function registerDesktopHandlers() {
  ipcMain.handle('desktop-metrics-get-snapshot', async (event, options) => {
    try {
      return getSnapshot(options);
    } catch (error) {
      console.error('Error getting desktop metrics snapshot:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('desktop-metrics-get-capabilities', async () => {
    try {
      return getCapabilities();
    } catch (error) {
      console.error('Error getting desktop metrics capabilities:', error);
      return { error: error.message };
    }
  });
}

module.exports = { registerDesktopHandlers };
