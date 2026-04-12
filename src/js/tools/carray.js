$(document).ready(function() {
  const $input = $('#carray-input');
  const $output = $('#carray-output');
  const $cols = $('#carray-cols');
  const $name = $('#carray-name');

  const process = () => {
    let raw = $input.val().trim();
    if (!raw) {
      $output.val('');
      return;
    }

    // Attempt to detect format
    let bytes = [];
    if (/^[01\s]+$/.test(raw)) {
        // Binary
        const bits = raw.replace(/\s+/g, '');
        for (let i = 0; i < bits.length; i += 8) {
            bytes.push(parseInt(bits.substring(i, i + 8), 2));
        }
    } else {
        // Hex
        const clean = raw.replace(/[^0-9a-fA-F]/g, '');
        for (let i = 0; i < clean.length; i += 2) {
            bytes.push(parseInt(clean.substring(i, i + 2), 16));
        }
    }

    if (bytes.length === 0) {
        $output.val('// No valid hex/binary data found');
        return;
    }

    const varName = $name.val().trim() || 'rawData';
    const perLine = parseInt($cols.val(), 10) || 12;
    
    let result = `const uint8_t ${varName}[${bytes.length}] = {\n    `;
    
    for (let i = 0; i < bytes.length; i++) {
        result += '0x' + bytes[i].toString(16).toUpperCase().padStart(2, '0');
        if (i < bytes.length - 1) {
            result += ', ';
            if ((i + 1) % perLine === 0) result += '\n    ';
        }
    }
    
    result += '\n};';
    $output.val(result);
  };

  $input.on('input', process);
  $cols.on('input', process);
  $name.on('input', process);

  $('#carray-clear-btn').on('click', () => { $input.val('').focus(); process(); });
  $('#carray-copy-btn').on('click', function() {
    const text = $output.val();
    if (text) window.copyToClipboard(text, $(this));
  });

  // Init
  $input.val('DE AD BE EF 12 34 56 78');
  process();
});
