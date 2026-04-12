$(document).ready(function() {
  const $m = $('#q-bits-int'), $n = $('#q-bits-frac');
  const $inFloat = $('#q-input-float'), $inFixed = $('#q-input-fixed');
  const $min = $('#q-info-min'), $max = $('#q-info-max'), $res = $('#q-info-res'), $total = $('#q-info-total');

  const updateInfo = () => {
    const m = parseInt($m.val()), n = parseInt($n.val());
    const total = m + n + 1; // +1 for sign bit
    $total.text(`${total} Bits (incl. sign)`);
    $res.text((1 / Math.pow(2, n)).toExponential(4));
    
    const maxVal = (Math.pow(2, m + n) - 1) / Math.pow(2, n);
    const minVal = -Math.pow(2, m);
    
    $max.text(maxVal.toFixed(n > 5 ? 5 : n));
    $min.text(minVal.toFixed(n > 5 ? 5 : n));
  };

  const toFixed = () => {
    const n = parseInt($n.val());
    const fVal = parseFloat($inFloat.val());
    if (isNaN(fVal)) return;

    // FixedValue = Float * 2^n
    const shifted = BigInt(Math.round(fVal * Math.pow(2, n)));
    $inFixed.val('0x' + shifted.toString(16).toUpperCase());
  };

  const toFloat = () => {
    const n = parseInt($n.val());
    let raw = $inFixed.val().trim();
    if (!raw.startsWith('0x')) raw = '0x' + raw;
    
    try {
        const fixed = BigInt(raw);
        // This is a simple unsigned treatement, for signed we'd need bit width check
        const result = Number(fixed) / Math.pow(2, n);
        $inFloat.val(result.toFixed(n > 10 ? 10 : n));
    } catch (e) {}
  };

  $m.on('input', () => { updateInfo(); toFixed(); });
  $n.on('input', () => { updateInfo(); toFixed(); });
  $inFloat.on('input', toFixed);
  $inFixed.on('input', toFloat);

  // Init
  updateInfo();
  toFixed();
});
