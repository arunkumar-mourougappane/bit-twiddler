$(document).ready(function() {

  // --- Navigation Logic ---
  const $navLinks = $('.nav-link');
  const $toolSections = $('.tool-section');

  const updateActiveNav = (targetId) => {
    $navLinks.each(function() {
      const $link = $(this);
      if ($link.data('target') === targetId) {
        $link.removeClass('text-gray-400 hover:bg-gray-700/50 hover:text-gray-200');
        $link.addClass('bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-sm');
      } else {
        $link.addClass('text-gray-400 hover:bg-gray-700/50 hover:text-gray-200');
        $link.removeClass('bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-sm');
      }
    });

    $toolSections.each(function() {
      const $section = $(this);
      if ($section.attr('id') === targetId) {
        $section.removeClass('hidden');
      } else {
        $section.addClass('hidden');
      }
    });
  };

  $navLinks.on('click', function(e) {
    e.preventDefault();
    const target = $(this).data('target');
    updateActiveNav(target);
  });

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

  // --- Hash Generator Logic ---
  const $hashInput = $('#hash-input');
  const $hashMd5 = $('#hash-md5');
  const $hashSha1 = $('#hash-sha1');
  const $hashSha256 = $('#hash-sha256');
  const $hashSha512 = $('#hash-sha512');

  const updateHashes = async () => {
    const text = $hashInput.val();
    if (text === "") {
       $hashMd5.val("d41d8cd98f00b204e9800998ecf8427e");
       $hashSha1.val("da39a3ee5e6b4b0d3255bfef95601890afd80709");
       $hashSha256.val("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
       $hashSha512.val("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"); 
       return;
    }
    
    try {
      const hashes = await window.api.generateHashes(text);
      $hashMd5.val(hashes.md5);
      $hashSha1.val(hashes.sha1);
      $hashSha256.val(hashes.sha256);
      $hashSha512.val(hashes.sha512);
    } catch (e) {
      console.error(e);
    }
  };

  $hashInput.on('input', updateHashes);

  $('.copy-hash-btn').on('click', function() {
    const targetId = $(this).data('target');
    const $inputEl = $('#' + targetId);
    $inputEl.select();
    
    const hasSvgContext = $(this).find('svg').length > 0;
    copyToClipboard($inputEl.val(), hasSvgContext ? $(this) : $(this)); 
  });

  // --- Epoch Converter Logic ---
  const $epochInput = $('#epoch-input');
  const $epochCurrentBtn = $('#epoch-current-btn');
  const $epochLocalOut = $('#epoch-local-out');
  const $epochGmtOut = $('#epoch-gmt-out');

  const $dateInput = $('#date-input');
  const $dateTimestampOut = $('#date-timestamp-out');

  const updateEpochUI = (val) => {
    if (!val) {
      $epochLocalOut.text("");
      $epochGmtOut.text("");
      return;
    }
    let timestamp = parseInt(val, 10);
    if (timestamp < 10000000000) {
      timestamp *= 1000;
    }
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) {
      $epochLocalOut.text("Invalid Date");
      $epochGmtOut.text("Invalid Date");
    } else {
      $epochLocalOut.text(d.toLocaleString());
      $epochGmtOut.text(d.toUTCString());
    }
  };

  $epochInput.on('input', function() {
    updateEpochUI($epochInput.val());
  });
  
  $epochCurrentBtn.on('click', function() {
    const nowS = Math.floor(Date.now() / 1000);
    $epochInput.val(nowS);
    updateEpochUI(nowS);
  });

  const updateDateUI = (val) => {
     if (!val) {
       $dateTimestampOut.text("");
       return;
     }
     const d = new Date(val);
     if (isNaN(d.getTime())) {
       $dateTimestampOut.text("Invalid Date");
     } else {
       $dateTimestampOut.text(Math.floor(d.getTime() / 1000));
     }
  };

  $dateInput.on('input', function() {
    updateDateUI($dateInput.val());
  });

  // Initialize
  $epochCurrentBtn.trigger('click');
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  $dateInput.val(now.toISOString().slice(0, 19));
  updateDateUI($dateInput.val());

});
