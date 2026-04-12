$(document).ready(function() {
  const colors = [
    { name: 'Black', hex: '#000000', val: 0, mult: 1, tol: null, ppm: null },
    { name: 'Brown', hex: '#8B4513', val: 1, mult: 10, tol: 1, ppm: 100 },
    { name: 'Red', hex: '#FF0000', val: 2, mult: 100, tol: 2, ppm: 50 },
    { name: 'Orange', hex: '#FFA500', val: 3, mult: 1000, tol: null, ppm: 15 },
    { name: 'Yellow', hex: '#FFFF00', val: 4, mult: 10000, tol: null, ppm: 25 },
    { name: 'Green', hex: '#008000', val: 5, mult: 100000, tol: 0.5, ppm: null },
    { name: 'Blue', hex: '#0000FF', val: 6, mult: 1000000, tol: 0.25, ppm: 10 },
    { name: 'Violet', hex: '#EE82EE', val: 7, mult: 10000000, tol: 0.1, ppm: 5 },
    { name: 'Grey', hex: '#808080', val: 8, mult: 100000000, tol: 0.05, ppm: null },
    { name: 'White', hex: '#FFFFFF', val: 9, mult: 1000000000, tol: null, ppm: 1 },
    { name: 'Gold', hex: '#FFD700', val: null, mult: 0.1, tol: 5, ppm: null },
    { name: 'Silver', hex: '#C0C0C0', val: null, mult: 0.01, tol: 10, ppm: null }
  ];

  let currentBands = 4;
  const selections = [1, 0, 0, 2, 10, 1]; // Indices in 'colors' array for bands 0-5

  const $selectors = $('#resistor-selectors');
  const $vizRef = $('#resistor-quick-ref');
  const $outVal = $('#resistor-out-value');
  const $outMeta = $('#resistor-out-meta');

  const init = () => {
    // Render Quick Ref Swatches
    $vizRef.empty();
    colors.forEach(c => {
      $vizRef.append(`<div class="w-full aspect-square rounded shadow-inner" style="background-color: ${c.hex}" title="${c.name}"></div>`);
    });
    renderSelectors();
    calculate();
  };

  const renderSelectors = () => {
    $selectors.empty();
    const bandLabels = currentBands === 4 
      ? ['1st Digit', '2nd Digit', 'Multiplier', 'Tolerance']
      : currentBands === 5 
      ? ['1st Digit', '2nd Digit', '3rd Digit', 'Multiplier', 'Tolerance']
      : ['1st Digit', '2nd Digit', '3rd Digit', 'Multiplier', 'Tolerance', 'Temp Coeff'];

    bandLabels.forEach((label, i) => {
      const actualIdx = i === 2 && currentBands === 4 ? 3 : i === 3 && currentBands === 4 ? 4 : i;
      const selectHtml = `
        <div class="flex items-center justify-between gap-4">
           <span class="text-[10px] font-bold text-gray-600 uppercase w-20">${label}</span>
           <select class="band-select flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none" data-band="${actualIdx}">
              ${colors.map((c, ci) => {
                const disabled = (i < (currentBands - 2) && c.val === null) ? 'disabled' : '';
                const selected = ci === selections[actualIdx] ? 'selected' : '';
                return `<option value="${ci}" ${disabled} ${selected}>${c.name}</option>`;
              }).join('')}
           </select>
        </div>
      `;
      $selectors.append(selectHtml);
    });
  };

  const calculate = () => {
    let val = 0;
    let tol = 0;
    let ppm = null;
    let multiplier = 1;

    // Digits
    if (currentBands === 4) {
      val = (colors[selections[0]].val * 10) + colors[selections[1]].val;
      multiplier = colors[selections[3]].mult;
      tol = colors[selections[4]].tol;
    } else {
      val = (colors[selections[0]].val * 100) + (colors[selections[1]].val * 10) + colors[selections[2]].val;
      multiplier = colors[selections[3]].mult;
      tol = colors[selections[4]].tol;
      if (currentBands === 6) ppm = colors[selections[5]].ppm;
    }

    const resistance = val * multiplier;
    let formatted = '';
    if (resistance >= 1e6) formatted = (resistance / 1e6).toFixed(resistance % 1e6 === 0 ? 0 : 1) + 'M Ω';
    else if (resistance >= 1e3) formatted = (resistance / 1e3).toFixed(resistance % 1e3 === 0 ? 0 : 1) + 'k Ω';
    else formatted = resistance.toFixed(resistance % 1 === 0 ? 0 : 2) + ' Ω';

    $outVal.text(formatted);
    $outMeta.text(`±${tol}%` + (ppm ? ` • ${ppm}ppm/K` : ''));

    // Update Visuals
    $('.resistor-band').each(function() {
      const bIdx = $(this).data('band');
      $(this).css('background-color', colors[selections[bIdx]].hex);
    });

    $('#band-3-visual').toggleClass('hidden', currentBands === 4);
    $('#band-6-visual').toggleClass('hidden', currentBands !== 6);
  };

  $selectors.on('change', '.band-select', function() {
    selections[$(this).data('band')] = parseInt($(this).val());
    calculate();
  });

  $('.resistor-mode-btn').on('click', function() {
    $('.resistor-mode-btn').removeClass('bg-blue-600 text-white').addClass('text-gray-400 hover:text-gray-200');
    $(this).addClass('bg-blue-600 text-white').removeClass('text-gray-400 hover:text-gray-200');
    currentBands = parseInt($(this).data('bands'));
    renderSelectors();
    calculate();
  });

  init();
});
