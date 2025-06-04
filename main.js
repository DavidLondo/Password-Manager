const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { validateMasterKey } = require('./security');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.handle('validate-master-key', async (_event, password) => {
  const result = await validateMasterKey(password);
  return result;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
