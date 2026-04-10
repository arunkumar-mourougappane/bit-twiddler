const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

let activeFileWatcher = null;
let debounceTimer = null;

const calculateFileHashes = (filePath) => {
  return new Promise((resolve, reject) => {
    const md5Stream = crypto.createHash('md5');
    const sha1Stream = crypto.createHash('sha1');
    const sha256Stream = crypto.createHash('sha256');
    const sha512Stream = crypto.createHash('sha512');
    
    const readStream = fs.createReadStream(filePath);
    
    readStream.on('data', (chunk) => {
      md5Stream.update(chunk);
      sha1Stream.update(chunk);
      sha256Stream.update(chunk);
      sha512Stream.update(chunk);
    });
    
    readStream.on('end', () => {
      resolve({
        md5: md5Stream.digest('hex'),
        sha1: sha1Stream.digest('hex'),
        sha256: sha256Stream.digest('hex'),
        sha512: sha512Stream.digest('hex')
      });
    });
    
    readStream.on('error', (err) => {
      reject(err);
    });
  });
};
const qrcode = require('qrcode');

ipcMain.handle('generate-hashes', (event, text) => {
  return {
    md5: crypto.createHash('md5').update(text).digest('hex'),
    sha1: crypto.createHash('sha1').update(text).digest('hex'),
    sha256: crypto.createHash('sha256').update(text).digest('hex'),
    sha512: crypto.createHash('sha512').update(text).digest('hex')
  };
});

ipcMain.handle('generate-qr', async (event, text) => {
  try {
    return await qrcode.toDataURL(text, { width: 400, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } });
  } catch (e) {
    console.error("Main Process QR Error:", e);
    throw e;
  }
});

ipcMain.handle('hash-file', async (event, filePath) => {
  if (activeFileWatcher) {
    activeFileWatcher.close();
    activeFileWatcher = null;
  }
  
  try {
    const hashes = await calculateFileHashes(filePath);
    
    activeFileWatcher = fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
         clearTimeout(debounceTimer);
         debounceTimer = setTimeout(async () => {
            try {
               const newHashes = await calculateFileHashes(filePath);
               event.sender.send('file-hash-update', newHashes);
            } catch (e) {
               console.error("Watch calculation error:", e);
            }
         }, 300); // 300ms debounce
      }
    });

    return hashes;
  } catch (err) {
    throw err;
  }
});

ipcMain.handle('stop-file-watch', () => {
    if (activeFileWatcher) {
        activeFileWatcher.close();
        activeFileWatcher = null;
    }
});

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false // Wait for ready-to-show
  });

  mainWindow.loadFile('src/index.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

const isMac = process.platform === 'darwin';

const menuTemplate = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: false,
        accelerator: isMac ? 'Cmd+Shift+T' : 'Ctrl+Shift+T',
        click(menuItem) {
          if (mainWindow) mainWindow.setAlwaysOnTop(menuItem.checked);
        }
      }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  }
];

app.whenReady().then(() => {
  const customMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(customMenu);
  
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
