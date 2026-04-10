const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  generateHashes: (text) => ipcRenderer.invoke('generate-hashes', text),
  hashFile: (filePath) => ipcRenderer.invoke('hash-file', filePath),
  stopFileWatch: () => ipcRenderer.invoke('stop-file-watch'),
  onFileHashUpdate: (callback) => {
    ipcRenderer.removeAllListeners('file-hash-update');
    ipcRenderer.on('file-hash-update', (event, hashes) => callback(hashes));
  },
  generateQR: (text) => ipcRenderer.invoke('generate-qr', text),
  renderMarkdown: (md) => ipcRenderer.invoke('render-markdown', md)
});
