const { ipcMain } = require('electron');
const qrcode = require('qrcode');

function setupQrHandlers() {
  ipcMain.handle('generate-qr', async (event, text) => {
    try {
      return await qrcode.toDataURL(text, { width: 400, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } });
    } catch (e) {
      console.error("Main Process QR Error:", e);
      throw e;
    }
  });
}

module.exports = { setupQrHandlers };
