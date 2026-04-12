$(document).ready(function() {
  const $grid = $('#bits-grid-container');
  const $outHex = $('#bits-out-hex');
  const $outDec = $('#bits-out-dec');
  const $outBin = $('#bits-out-bin');
  const $outCode = $('#bits-out-code');

  let currentValue = 0n;

  const initGrid = () => {
    $grid.empty();
    // 64 bits, from 63 down to 0
    for (let i = 63; i >= 0; i--) {
      const bitNum = i;
      const html = `
        <div class="bit-item flex flex-col items-center bg-gray-900 border border-gray-700 rounded-lg p-2 cursor-pointer hover:border-emerald-500/50 transition-all select-none group" data-bit="${bitNum}">
           <span class="text-[8px] font-bold text-gray-600 group-hover:text-gray-400 mb-1">${bitNum}</span>
           <div class="bit-indicator w-3 h-3 rounded-sm bg-gray-800 transition-colors"></div>
        </div>
      `;
      $grid.append(html);
    }
  };

  const updateUI = () => {
    // Update bit indicators
    $('.bit-item').each(function() {
      const bit = BigInt($(this).data('bit'));
      const isOn = (currentValue & (1n << bit)) !== 0n;
      $(this).find('.bit-indicator').toggleClass('bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]', isOn).toggleClass('bg-gray-800', !isOn);
    });

    // Hex
    const hex = '0x' + currentValue.toString(16).toUpperCase().padStart(16, '0');
    $outHex.val(hex);

    // Dec
    $outDec.val(currentValue.toString());

    // Bin
    const bin = currentValue.toString(2).padStart(64, '0').match(/.{8}/g).join(' ');
    $outBin.text(bin);

    // Code
    $outCode.text(`#define MASK ${hex}ULL`);
  };

  $grid.on('click', '.bit-item', function() {
    const bit = BigInt($(this).data('bit'));
    currentValue ^= (1n << bit);
    updateUI();
  });

  $outHex.on('input', function() {
    try {
      let val = $(this).val().trim();
      if (!val.startsWith('0x')) val = '0x' + val;
      currentValue = BigInt(val);
      updateUI();
    } catch (e) {}
  });

  $outDec.on('input', function() {
    try {
      currentValue = BigInt($(this).val());
      updateUI();
    } catch (e) {}
  });

  $('#bits-clear').on('click', () => { currentValue = 0n; updateUI(); });
  $('#bits-set-all').on('click', () => { currentValue = 0xFFFFFFFFFFFFFFFFn; updateUI(); });
  $('#bits-invert').on('click', () => { currentValue = ~currentValue & 0xFFFFFFFFFFFFFFFFn; updateUI(); });

  // Initialize
  initGrid();
  updateUI();
});
