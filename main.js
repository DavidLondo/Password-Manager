const { app, BrowserWindow, ipcMain, shell, clipboard} = require('electron');
const path = require('path');
const { 
  validateMasterKey,
  addPassword,
  deletePassword,
  updatePassword,
  getDecryptedPasswords,
  generatePassword
} = require('./security');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 650,
    title: "Gestor de Contraseñas",
    icon: path.join(__dirname, "..", "frontend", "src", "assets", "Logo.ico"),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.setMenu(null);

  win.loadFile(path.join(__dirname, '../build/index.html'));

  // 🔒 Abre los enlaces externos en el navegador predeterminado
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    const currentURL = win.webContents.getURL();
    const isExternal = new URL(url).origin !== new URL(currentURL).origin;

    if (isExternal) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
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

ipcMain.handle('generate-password', async (_event, length = 16) => {
  return generatePassword(length);
});

ipcMain.handle('copy-to-clipboard', (event, text) => {
  clipboard.writeText(text);
});

ipcMain.handle('clear-clipboard', () => {
  clipboard.clear();
  return true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
