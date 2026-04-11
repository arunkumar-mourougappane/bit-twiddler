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
