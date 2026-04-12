$(document).ready(function() {
  const $input = $('#cidr-input');
  const $maskSelect = $('#cidr-mask-select');
  const $error = $('#cidr-error');

  const ipToInt = (ip) => {
    return ip.split('.').reduce((res, octet) => (res << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  const intToIp = (int) => {
    return [
      (int >>> 24) & 0xFF,
      (int >>> 16) & 0xFF,
      (int >>> 8) & 0xFF,
      int & 0xFF
    ].join('.');
  };

  const calculate = () => {
    let val = $input.val().trim();
    if (!val) {
      $error.addClass('hidden');
      clearOutputs();
      return;
    }

    let ip = val;
    let bits = parseInt($maskSelect.val(), 10);

    // If input contains CIDR slash (e.g. 192.168.1.0/24)
    if (val.includes('/')) {
      const parts = val.split('/');
      ip = parts[0];
      bits = parseInt(parts[1], 10);
      if (isNaN(bits) || bits < 0 || bits > 32) {
        $error.removeClass('hidden');
        return;
      }
      $maskSelect.val(bits);
    }

    // Basic IP validation
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      $error.removeClass('hidden');
      return;
    }

    try {
      const ipInt = ipToInt(ip);
      const maskInt = (0xFFFFFFFF << (32 - bits)) >>> 0;
      const networkInt = (ipInt & maskInt) >>> 0;
      const broadcastInt = (networkInt | (~maskInt)) >>> 0;
      const hostCount = (bits === 32) ? 1 : (bits === 31) ? 2 : (broadcastInt - networkInt - 1);

      $('#cidr-out-network').text(intToIp(networkInt));
      $('#cidr-out-mask').text(intToIp(maskInt));
      $('#cidr-out-broadcast').text(intToIp(broadcastInt));
      $('#cidr-out-hosts').text(hostCount.toLocaleString());
      
      $('#cidr-out-first').text(bits >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1));
      $('#cidr-out-last').text(bits >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1));
      $('#cidr-out-hex').text('0x' + maskInt.toString(16).toUpperCase());
      $('#cidr-out-wildcard').text(intToIp(~maskInt >>> 0));

      $error.addClass('hidden');
    } catch (e) {
      $error.removeClass('hidden');
    }
  };

  const clearOutputs = () => {
    $('#cidr-out-network, #cidr-out-mask, #cidr-out-broadcast, #cidr-out-hosts, #cidr-out-first, #cidr-out-last, #cidr-out-hex, #cidr-out-wildcard').text("");
  };

  $input.on('input', calculate);
  $maskSelect.on('change', calculate);

  $('.copy-field').on('click', function() {
    const targetId = $(this).data('from');
    const text = $(`#${targetId}`).text();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });

  // Initialize
  $input.val("192.168.1.0/24");
  calculate();
});
