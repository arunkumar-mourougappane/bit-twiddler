$(document).ready(function() {
  const $input = $('#crc-input');
  const $output = $('#crc-output');
  const $algo = $('#crc-algo');
  const $error = $('#crc-error');
  
  let inputMode = 'text'; // 'text' or 'hex'

  const stringToBytes = (str) => {
    return new TextEncoder().encode(str);
  };

  const hexToBytes = (hex) => {
    const clean = hex.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length % 2 !== 0) throw new Error("Invalid hex");
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
    }
    return bytes;
  };

  // CRC-8 Implementation (SMBus)
  const calcCrc8 = (data) => {
    let crc = 0;
    for (let b of data) {
      crc ^= b;
      for (let i = 0; i < 8; i++) {
        if (crc & 0x80) crc = (crc << 1) ^ 0x07;
        else crc <<= 1;
      }
    }
    return (crc & 0xFF).toString(16).toUpperCase().padStart(2, '0');
  };

  // CRC-16-CCITT (XModem)
  const calcCrc16Ccitt = (data) => {
    let crc = 0;
    for (let b of data) {
      crc ^= (b << 8);
      for (let i = 0; i < 8; i++) {
        if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
        else crc <<= 1;
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  };

  // CRC-32 (Ethernet)
  const calcCrc32 = (data) => {
    let crc = 0xFFFFFFFF;
    for (let b of data) {
      crc ^= b;
      for (let i = 0; i < 8; i++) {
        if (crc & 1) crc = (crc >>> 1) ^ 0xEDB88320;
        else crc >>>= 1;
      }
    }
    return ((~crc) >>> 0).toString(16).toUpperCase().padStart(8, '0');
  };

  const process = () => {
    const val = $input.val();
    if (!val) {
      $output.text('-');
      $error.addClass('hidden');
      return;
    }

    try {
      const data = inputMode === 'text' ? stringToBytes(val) : hexToBytes(val);
      const algo = $algo.val();
      let result = '';

      if (algo === 'crc8') result = calcCrc8(data);
      else if (algo === 'crc16ccitt') result = calcCrc16Ccitt(data);
      else if (algo === 'crc32') result = calcCrc32(data);
      else if (algo === 'xor') {
        let sum = 0;
        for (let b of data) sum ^= b;
        result = sum.toString(16).toUpperCase().padStart(2, '0');
      } else if (algo === 'sum8') {
        let sum = 0;
        for (let b of data) sum = (sum + b) & 0xFF;
        result = sum.toString(16).toUpperCase().padStart(2, '0');
      }

      $output.text(result);
      $error.addClass('hidden');
    } catch (e) {
      $error.removeClass('hidden').text(e.message);
      $output.text('-');
    }
  };

  $input.on('input', process);
  $algo.on('change', process);

  $('#crc-input-type-text').on('click', () => {
    inputMode = 'text';
    $('#crc-input-type-text').addClass('bg-blue-600 text-white').removeClass('text-gray-500');
    $('#crc-input-type-hex').removeClass('bg-blue-600 text-white').addClass('text-gray-500');
    process();
  });

  $('#crc-input-type-hex').on('click', () => {
    inputMode = 'hex';
    $('#crc-input-type-hex').addClass('bg-blue-600 text-white').removeClass('text-gray-500');
    $('#crc-input-type-text').removeClass('bg-blue-600 text-white').addClass('text-gray-500');
    process();
  });

  $('#crc-clear-btn').on('click', () => { $input.val('').focus(); process(); });
  $('#crc-copy-btn').on('click', function() {
    const text = $output.text();
    if (text !== '-') window.copyToClipboard(text, $(this));
  });
});
