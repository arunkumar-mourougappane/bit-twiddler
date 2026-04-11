  // NUMBER BASE CONVERTER
  // ============================================================
  const VALID_CHARS = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[0-9]+$/, 16: /^[0-9A-Fa-f]+$/ };

  const runBaseConvert = () => {
    const raw      = $('#base-input').val().trim().replace(/\s/g, '');
    const fromBase = parseInt($('#base-select').val());
    const $error   = $('#base-error');
    const $bitViz  = $('#base-bit-viz');

    const clearOutputs = () => {
      ['bin','oct','dec','hex'].forEach(k => $(`#base-out-${k}`).text('—'));
      $bitViz.addClass('hidden');
    };

    if (!raw) { clearOutputs(); $error.addClass('hidden'); return; }

    if (!VALID_CHARS[fromBase].test(raw)) {
      $error.removeClass('hidden').text(`Invalid character for base ${fromBase}. Allowed: ${Object.keys(VALID_CHARS[fromBase].source.slice(2, -2).split(''))[0]}`);
      clearOutputs();
      return;
    }

    $error.addClass('hidden');

    try {
      const num = parseInt(raw, fromBase);
      if (!isFinite(num) || isNaN(num)) throw new Error('Out of range');

      const bin = num.toString(2);
      const oct = num.toString(8);
      const dec = num.toString(10);
      const hex = num.toString(16).toUpperCase();

      // Binary with space-separated nibbles (groups of 4)
      $('#base-out-bin').text(bin.match(/.{1,4}/g).join(' ') || bin);
      $('#base-out-oct').text(oct);
      $('#base-out-dec').text(dec);
      $('#base-out-hex').text('0x' + hex);

      // Bit width visualization
      const bitWidth = num <= 0xFF ? 8 : num <= 0xFFFF ? 16 : num <= 0xFFFFFFFF ? 32 : 64;
      const padded   = bin.padStart(bitWidth, '0');
      const grouped  = padded.match(/.{1,8}/g) || [padded];

      $('#base-bits').html(
        grouped.map((byte, bi) =>
          (bi > 0 ? '<span class="mx-2 text-gray-700 select-none">|</span>' : '') +
          byte.split('').map(c =>
            c === '1'
              ? `<span class="text-amber-400 font-bold">${c}</span>`
              : `<span class="text-gray-600">${c}</span>`
          ).join('')
        ).join('') +
        `<span class="ml-4 text-xs text-gray-600 font-sans">${bitWidth}-bit</span>`
      );
      $bitViz.removeClass('hidden');

    } catch (e) {
      $error.removeClass('hidden').text('Conversion error: ' + e.message);
      clearOutputs();
    }
  };

  $('#base-input').on('input', runBaseConvert);
  $('#base-select').on('change', () => { $('#base-input').val(''); runBaseConvert(); });

  // Copy buttons for base converter
  $(document).on('click', '.base-copy-btn', function () {
    const id  = $(this).data('target');
    const txt = $(`#${id}`).text().replace(/\s/g, '');
    if (!txt || txt === '—') return;
    navigator.clipboard.writeText(txt);
    const $btn = $(this), orig = $btn.text();
    $btn.text('Copied!');
    setTimeout(() => $btn.text(orig), 1500);
  });

  // ============================================================