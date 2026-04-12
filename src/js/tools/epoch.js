  // --- Epoch Converter Logic ---
  const $epochInput = $('#epoch-input');
  const $epochCurrentBtn = $('#epoch-current-btn');
  const $epochLocalOut = $('#epoch-local-out');
  const $epochGmtOut = $('#epoch-gmt-out');
  const $epochIsoOut = $('#epoch-iso-out');
  const $epochRelativeOut = $('#epoch-relative-out');

  const $dateInput = $('#date-input');
  const $dateTimestampOut = $('#date-timestamp-out');
  const $dateMsOut = $('#date-ms-out');
  const $liveTicker = $('#live-epoch');
  
  const $tzSelector = $('#tz-selector');
  const $tzOutput = $('#tz-output');

  // Relative Time Helper
  const getRelativeTime = (timestamp) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = timestamp - Date.now();
    const absDiff = Math.abs(diff);

    if (absDiff < 1000) return 'just now';
    if (absDiff < 60000) return rtf.format(Math.round(diff / 1000), 'second');
    if (absDiff < 3600000) return rtf.format(Math.round(diff / 60000), 'minute');
    if (absDiff < 86400000) return rtf.format(Math.round(diff / 3600000), 'hour');
    if (absDiff < 2592000000) return rtf.format(Math.round(diff / 86400000), 'day');
    return rtf.format(Math.round(diff / 2592000000), 'month');
  };

  const updateEpochUI = (val) => {
    if (!val) {
      $('#epoch-local-out, #epoch-gmt-out, #epoch-iso-out, #epoch-relative-out, #tz-output').text("");
      return;
    }
    let timestamp = parseInt(val, 10);
    // Heuristic: if > 100bn, assume milliseconds
    const isMs = timestamp > 100000000000;
    const dateMs = isMs ? timestamp : timestamp * 1000;
    
    const d = new Date(dateMs);
    if (isNaN(d.getTime())) {
      $('#epoch-local-out, #epoch-gmt-out, #epoch-iso-out, #epoch-relative-out, #tz-output').text("Invalid Date");
    } else {
      $epochLocalOut.text(d.toLocaleString());
      $epochGmtOut.text(d.toUTCString());
      $epochIsoOut.text(d.toISOString());
      $epochRelativeOut.text(getRelativeTime(dateMs));
      
      const tz = $tzSelector.val();
      if (tz) {
        $tzOutput.text(d.toLocaleString('en-US', { 
          timeZone: tz,
          dateStyle: 'full',
          timeStyle: 'medium'
        }));
      }
    }
  };

  $epochInput.on('input', function() {
    updateEpochUI($epochInput.val());
  });
  
  $tzSelector.on('change', function() {
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
       $dateMsOut.text("");
       return;
     }
     const d = new Date(val);
     if (isNaN(d.getTime())) {
       $dateTimestampOut.text("Invalid Date");
       $dateMsOut.text("Invalid Date");
     } else {
       const ms = d.getTime();
       $dateTimestampOut.text(Math.floor(ms / 1000));
       $dateMsOut.text(ms);
     }
  };

  $dateInput.on('input', function() {
    updateDateUI($dateInput.val());
  });

  // Copy Buttons
  $('.copy-field').on('click', function() {
    const targetId = $(this).data('from');
    const text = $(`#${targetId}`).text();
    if (text && text !== "Invalid Date") {
       window.copyToClipboard(text, $(this));
    }
  });

  // Live Ticker
  setInterval(() => {
    $liveTicker.text(Math.floor(Date.now() / 1000));
    // Also update timezone if it's currently showing "now"
    const currentVal = $epochInput.val();
    const nowS = Math.floor(Date.now() / 1000);
    if (Math.abs(parseInt(currentVal) - nowS) <= 1) {
       updateEpochUI(currentVal);
    }
  }, 1000);

  // Initialize
  // Populate timezones
  const timeZones = Intl.supportedValuesOf('timeZone');
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  $tzSelector.html(timeZones.map(tz => 
    `<option value="${tz}" ${tz === localTz ? 'selected' : ''}>${tz.replace(/_/g, ' ')}</option>`
  ).join(''));

  $epochCurrentBtn.trigger('click');
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  $dateInput.val(now.toISOString().slice(0, 19));
  updateDateUI($dateInput.val());

  // ============================================================
