const { contextBridge, ipcRenderer } = require('electron');

// Aquí expondremos funciones seguras al frontend más adelante
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
