$(document).ready(function() {
  const $input = $('#endian-input');
  const $width = $('#endian-width');
  const $outHex = $('#endian-out-hex');
  const $outDec = $('#endian-out-dec');
  const $viz = $('#endian-viz');
  const $error = $('#endian-error');

  const swap16 = (val) => {
    return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
  };

  const swap32 = (val) => {
    return ((val & 0xFF) << 24) |
           ((val & 0xFF00) << 8) |
           ((val >> 8) & 0xFF00) |
           ((val >> 24) & 0xFF);
  };

  const swap64 = (val) => {
    let result = 0n;
    for (let i = 0n; i < 8n; i++) {
        const byte = (val >> (i * 8n)) & 0xFFn;
        result |= (byte << ((7n - i) * 8n));
    }
    return result;
  };

  const renderViz = (val, width) => {
    $viz.empty();
    const bytesCount = width / 8;
    const hex = val.toString(16).padStart(width / 4, '0');
    
    for (let i = 0; i < bytesCount; i++) {
        const byteHex = hex.substring(i * 2, i * 2 + 2).toUpperCase();
        const html = `
            <div class="flex flex-col items-center">
                <div class="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-xs font-mono text-emerald-300 shadow-inner">
                   ${byteHex}
                </div>
                <span class="text-[8px] text-gray-600 mt-1 uppercase font-bold">Byte ${bytesCount - 1 - i}</span>
            </div>
        `;
        $viz.append(html);
        if (i < bytesCount - 1) {
            $viz.append('<div class="h-10 flex items-center text-gray-700">⇆</div>');
        }
    }
  };

  const process = () => {
    const raw = $input.val().trim();
    if (!raw) {
        $outHex.text('0x00000000');
        $outDec.text('0');
        $viz.empty();
        $error.addClass('hidden');
        return;
    }

    try {
        let val = raw;
        if (!val.startsWith('0x') && /^[0-9a-fA-F]+$/.test(val) && val.length > 2) val = '0x' + val;
        
        const width = parseInt($width.val(), 10);
        let numeric = BigInt(val);
        let swapped = 0n;

        if (width === 16) {
            if (numeric > 0xFFFFn) throw new Error("Overflow");
            swapped = BigInt(swap16(Number(numeric)));
        } else if (width === 32) {
            if (numeric > 0xFFFFFFFFn) throw new Error("Overflow");
            swapped = BigInt(swap32(Number(numeric)) >>> 0); // Force unsigned
        } else if (width === 64) {
            swapped = swap64(numeric);
        }

        const hexStr = '0x' + swapped.toString(16).toUpperCase().padStart(width / 4, '0');
        $outHex.text(hexStr);
        $outDec.text(swapped.toString());
        
        renderViz(swapped, width);
        $error.addClass('hidden');
    } catch (e) {
        $error.removeClass('hidden');
        $outHex.text('-');
        $outDec.text('-');
    }
  };

  $input.on('input', process);
  $width.on('change', process);

  $('.endian-copy-btn').on('click', function() {
    const target = $(this).data('from');
    window.copyToClipboard($(`#${target}`).text(), $(this));
  });

  // Init
  $input.val('0x12345678');
  process();
});
