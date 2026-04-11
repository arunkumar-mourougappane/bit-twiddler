  // --- Base64 Tool Logic ---
  const $b64Plain = $('#base64-plain');
  const $b64Encoded = $('#base64-encoded');

  $b64Plain.on('input', function() {
    try {
      $b64Encoded.val(btoa($b64Plain.val()));
    } catch (e) {
      if (e.name === 'InvalidCharacterError') {
         $b64Encoded.val(btoa(unescape(encodeURIComponent($b64Plain.val()))));
      } else {
         $b64Encoded.val("");
      }
    }
  });

  $b64Encoded.on('input', function() {
    try {
      $b64Plain.val(decodeURIComponent(escape(atob($b64Encoded.val()))));
    } catch (e) {
      // Ignore Invalid base64 during partial typing
    }
  });

  const copyToClipboard = async (text, $btnElement) => {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = $btnElement.text();
      $btnElement.text("Copied!");
      setTimeout(() => { $btnElement.text(originalText); }, 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  $('#b64-copy-plain').on('click', function() {
    copyToClipboard($b64Plain.val(), $(this));
  });
  
  $('#b64-copy-encoded').on('click', function() {
    copyToClipboard($b64Encoded.val(), $(this));
  });
