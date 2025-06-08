const { contextBridge, ipcRenderer } = require('electron');

// Aquí expondremos funciones seguras al frontend más adelante
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld('electronAPI', {
  validateMasterKey: (password) => ipcRenderer.invoke('validate-master-key', password),
  getPasswords: (key) => ipcRenderer.invoke('get-passwords', key),
  addPassword: (data, key) => ipcRenderer.invoke('add-password', data, key),
  deletePassword: (id, key) => ipcRenderer.invoke('delete-password', id, key),
  updatePassword: (id, newData, key) => ipcRenderer.invoke('update-password', id, newData, key),
  generatePassword: (length = 16) => ipcRenderer.invoke('generate-password', length),
});
