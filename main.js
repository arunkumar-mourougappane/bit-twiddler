const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { marked } = require('marked');

// Custom Modules
const { setupCryptoHandlers } = require('./src-main/ipc/crypto-handlers');
const { setupQrHandlers } = require('./src-main/ipc/qr-handlers');
const { setupApplicationMenu } = require('./src-main/menu');

// Setup IPC Handlers
setupCryptoHandlers();
setupQrHandlers();

ipcMain.handle('render-markdown', async (event, md) => marked.parse(md));

function createWindow() {
  const mainWindow = new BrowserWindow({
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

app.whenReady().then(() => {
  setupApplicationMenu();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
