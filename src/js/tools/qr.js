  // --- QR Code Generator Logic ---
  const $qrInput = $('#qr-input');
  const $qrClearBtn = $('#qr-clear-btn');
  const $qrImageContainer = $('#qr-image-container');
  const $qrPlaceholder = $('#qr-placeholder');
  const $qrImage = $('#qr-image');
  const $qrDownloadBtn = $('#qr-download-btn');

  $qrClearBtn.on('click', () => {
      $qrInput.val('').trigger('input');
  });

  $qrInput.on('input', async function() {
      const val = $(this).val().trim();
      
      if (!val) {
          $qrPlaceholder.removeClass('hidden');
          $qrImage.addClass('hidden').attr('src', '');
          $qrDownloadBtn.addClass('hidden');
          $qrImageContainer.addClass('opacity-20');
          return;
      }
      
      try {
          // Utilize secure preload API bridges to route string parsing across context domains safely
          const dataUrl = await window.api.generateQR(val);
          
          $qrPlaceholder.addClass('hidden');
          $qrImage.attr('src', dataUrl).removeClass('hidden');
          $qrDownloadBtn.removeClass('hidden');
          $qrImageContainer.removeClass('opacity-20');
      } catch (err) {
          console.error("QR Generation error via bridging:", err);
      }
  });

  $qrDownloadBtn.on('click', () => {
      // Export Native Blob string directly over to fs
      const dataURL = $qrImage.attr('src');
      if(!dataURL) return;
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = "qrcode.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  });



  // ============================================================