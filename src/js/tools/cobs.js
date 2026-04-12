$(document).ready(function() {
  const $input = $('#cobs-input');
  const $output = $('#cobs-output');

  const hexToBytes = (hex) => {
    const clean = hex.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length === 0) return [];
    const bytes = [];
    for (let i = 0; i < clean.length; i += 2) {
      bytes.push(parseInt(clean.substring(i, i + 2), 16));
    }
    return bytes;
  };

  const bytesToHex = (bytes) => {
    return Array.from(bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  };

  const encode = (data) => {
    let result = [];
    let readIndex = 0;
    let writeIndex = 0;
    let codeIndex = 0;
    let code = 1;

    result.push(0); // Placeholder for first code

    while (readIndex < data.length) {
      if (data[readIndex] === 0) {
        result[codeIndex] = code;
        codeIndex = result.length;
        result.push(0);
        code = 1;
      } else {
        result.push(data[readIndex]);
        code++;
        if (code === 0xFF) {
          result[codeIndex] = code;
          codeIndex = result.length;
          result.push(0);
          code = 1;
        }
      }
      readIndex++;
    }

    result[codeIndex] = code;
    result.push(0); // Standard footer
    return result;
  };

  const decode = (data) => {
    let result = [];
    let readIndex = 0;

    while (readIndex < data.length) {
      let code = data[readIndex];
      if (code === 0) break; // End of packet
      
      readIndex++;
      for (let i = 1; i < code; i++) {
        result.push(data[readIndex++]);
      }
      if (code < 0xFF && readIndex < data.length && data[readIndex] !== 0) {
        result.push(0);
      }
    }
    return result;
  };

  $('#cobs-encode-btn').on('click', () => {
    const bytes = hexToBytes($input.val());
    if (bytes.length === 0) return;
    $output.val(bytesToHex(encode(bytes)));
  });

  $('#cobs-decode-btn').on('click', () => {
    const bytes = hexToBytes($output.val());
    if (bytes.length === 0) return;
    $input.val(bytesToHex(decode(bytes)));
  });
});
