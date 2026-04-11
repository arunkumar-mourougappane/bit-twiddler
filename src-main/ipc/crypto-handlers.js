const { ipcMain } = require('electron');
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

function setupCryptoHandlers() {
  ipcMain.handle('generate-hashes', (event, text) => {
    return {
      md5: crypto.createHash('md5').update(text).digest('hex'),
      sha1: crypto.createHash('sha1').update(text).digest('hex'),
      sha256: crypto.createHash('sha256').update(text).digest('hex'),
      sha512: crypto.createHash('sha512').update(text).digest('hex')
    };
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
}

module.exports = { setupCryptoHandlers };
