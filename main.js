const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { 
  validateMasterKey,
  addPassword,
  deletePassword,
  updatePassword,
  getDecryptedPasswords
 } = require('./security');

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

ipcMain.handle('get-passwords', (_event, masterKey) => {
  return getDecryptedPasswords(masterKey);
});

ipcMain.handle('add-password', (_event, account, masterKey) => {
  return addPassword(account, masterKey);
});

ipcMain.handle('delete-password', (_event, id, masterKey) => {
  deletePassword(id, masterKey);
});

ipcMain.handle('update-password', (_event, id, newData, masterKey) => {
  updatePassword(id, newData, masterKey);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
