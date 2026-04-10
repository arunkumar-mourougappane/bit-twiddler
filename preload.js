const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  generateHashes: (text) => ipcRenderer.invoke('generate-hashes', text)
});
