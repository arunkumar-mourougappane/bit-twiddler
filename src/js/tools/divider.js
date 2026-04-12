$(document).ready(function() {
  // Voltage Divider
  const $vin = $('#div-vin'), $r1 = $('#div-r1'), $r2 = $('#div-r2'), $vout = $('#div-vout');
  
  const calcDivider = (target) => {
    const vin = parseFloat($vin.val()), r1 = parseFloat($r1.val()), r2 = parseFloat($r2.val()), vout = parseFloat($vout.val());
    
    if (target === 'vout') {
      const result = vin * (r2 / (r1 + r2));
      $vout.val(result.toFixed(3));
    } else if (target === 'r2') {
      const result = (vout * r1) / (vin - vout);
      $r2.val(result.toFixed(1));
    } else if (target === 'r1') {
      const result = (r2 * (vin - vout)) / vout;
      $r1.val(result.toFixed(1));
    } else if (target === 'vin') {
      const result = (vout * (r1 + r2)) / r2;
      $vin.val(result.toFixed(3));
    }
  };

  $vin.on('input', () => calcDivider('vout'));
  $r1.on('input', () => calcDivider('vout'));
  $r2.on('input', () => calcDivider('vout'));
  $vout.on('input', () => calcDivider('r2'));

  // Ohm's Law
  const $v = $('#ohm-v'), $i = $('#ohm-i'), $r = $('#ohm-r'), $pOut = $('#ohm-p-out');

  const calcOhm = (target) => {
    const v = parseFloat($v.val()), i = parseFloat($i.val()), r = parseFloat($r.val());
    
    if (target === 'v') {
      $v.val((i * r).toFixed(3));
    } else if (target === 'i') {
      $i.val((v / r).toFixed(4));
    } else if (target === 'r') {
      $r.val((v / i).toFixed(1));
    }

    // Power P = V * I
    const p = parseFloat($v.val()) * parseFloat($i.val());
    let pFormatted = '';
    if (p >= 1) pFormatted = p.toFixed(2) + '<small class="text-xs font-normal text-gray-500 ml-1">W</small>';
    else pFormatted = (p * 1000).toFixed(1) + '<small class="text-xs font-normal text-gray-500 ml-1">mW</small>';
    $pOut.html(pFormatted);
  };

  $v.on('input', () => calcOhm('i'));
  $i.on('input', () => calcOhm('v'));
  $r.on('input', () => calcOhm('v'));

  // Initial
  calcDivider('vout');
  calcOhm('i');
});
