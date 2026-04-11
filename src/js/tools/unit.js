  // UNIT CONVERTER — Data Size & Time Duration
  // ============================================================
  const DATA_UNITS    = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const DATA_FACTORS  = [1, 1024, 1024**2, 1024**3, 1024**4, 1024**5];
  const TIME_UNITS    = ['ms', 's', 'min', 'hr', 'day', 'week'];
  const TIME_FACTORS  = [1, 1e3, 6e4, 3.6e6, 86400e3, 604800e3]; // all in ms

  const fmtNum = (n) => {
    if (!isFinite(n) || isNaN(n)) return '—';
    if (n === 0) return '0';
    if (Math.abs(n) >= 1e15 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(3);
    return parseFloat(n.toPrecision(9)).toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  const renderUnitCards = (containerId, rawVal, fromUnit, units, factors, accentClass) => {
    const fromIdx = units.indexOf(fromUnit);
    if (fromIdx < 0 || isNaN(rawVal)) { $(`#${containerId}`).html(''); return; }
    const base = rawVal * factors[fromIdx];
    $(`#${containerId}`).html(units.map((u, i) => {
      const val = base / factors[i];
      const active = u === fromUnit ? 'border-blue-500/30 bg-blue-600/5' : '';
      return `<div class="bg-gray-800/40 border border-gray-700/50 hover:border-blue-500/20 rounded-xl px-4 py-3 transition-colors ${active}">
        <div class="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">${u}</div>
        <div class="font-mono text-sm text-gray-200 break-all">${fmtNum(val)}</div>
      </div>`;
    }).join(''));
  };

  $('#unit-data-input, #unit-data-from').on('input change', function() {
    renderUnitCards('unit-data-output', parseFloat($('#unit-data-input').val()), $('#unit-data-from').val(), DATA_UNITS, DATA_FACTORS, 'blue');
  });
  $('#unit-time-input, #unit-time-from').on('input change', function() {
    renderUnitCards('unit-time-output', parseFloat($('#unit-time-input').val()), $('#unit-time-from').val(), TIME_UNITS, TIME_FACTORS, 'purple');
  });

