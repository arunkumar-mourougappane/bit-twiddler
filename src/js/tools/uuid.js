  // --- UUID Generator Logic ---
  const $uuidQty = $('#uuid-qty');
  const $uuidUpper = $('#uuid-upper');
  const $uuidHyphens = $('#uuid-hyphens');
  const $uuidGenerateBtn = $('#uuid-generate-btn');
  const $uuidOutput = $('#uuid-output');
  const $uuidCopyBtn = $('#uuid-copy-btn');

  $uuidGenerateBtn.on('click', () => {
      let qty = parseInt($uuidQty.val(), 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      if (qty > 1000) qty = 1000;
      
      const isUpper = $uuidUpper.is(':checked');
      const removeHyphens = $uuidHyphens.is(':checked');
      
      let results = [];
      for(let i=0; i<qty; i++) {
          let id = window.crypto.randomUUID();
          if (removeHyphens) id = id.replaceAll('-', '');
          if (isUpper) id = id.toUpperCase();
          results.push(id);
      }
      
      $uuidOutput.val(results.join('\n'));
  });

  $uuidCopyBtn.on('click', () => {
    const txt = $uuidOutput.val();
    if(txt) {
        navigator.clipboard.writeText(txt);
        const origBtnText = $uuidCopyBtn.html();
        $uuidCopyBtn.html('<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!');
        setTimeout(() => {
           $uuidCopyBtn.html(origBtnText);
        }, 2000);
    }
  });
