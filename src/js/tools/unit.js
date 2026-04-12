  // UNIT CONVERTER — Data Size & Time Duration
  // ============================================================
  const DATA_UNITS    = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const DATA_FACTORS  = [1, 1024, 1024**2, 1024**3, 1024**4, 1024**5];
  const TIME_UNITS    = ['ms', 's', 'min', 'hr', 'day', 'week'];
  const TIME_FACTORS  = [1, 1e3, 6e4, 3.6e6, 86400e3, 604800e3]; // ms
  
  const LENGTH_UNITS  = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'];
  const LENGTH_FACTORS = [1, 10, 1000, 1e6, 25.4, 304.8, 914.4, 1609344]; // mm
  
  const MASS_UNITS    = ['mg', 'g', 'kg', 'oz', 'lb', 'st'];
  const MASS_FACTORS  = [0.001, 1, 1000, 28.3495, 453.592, 6350.29]; // g
  
  const SPEED_UNITS   = ['m/s', 'km/h', 'mph', 'kn'];
  const SPEED_FACTORS = [1, 0.277778, 0.44704, 0.514444]; // m/s

  const fmtNum = (n) => {
    if (!isFinite(n) || isNaN(n)) return '—';
    if (n === 0) return '0';
    if (Math.abs(n) >= 1e12 || (Math.abs(n) < 0.00001 && n !== 0)) return n.toExponential(3);
    return parseFloat(n.toPrecision(9)).toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  const renderUnitCards = (containerId, rawVal, fromUnit, units, factors, accentClass) => {
    const fromIdx = units.indexOf(fromUnit);
    if (fromIdx < 0 || isNaN(rawVal)) { $(`#${containerId}`).html(''); return; }
    const base = rawVal * factors[fromIdx];
    $(`#${containerId}`).html(units.map((u, i) => {
      const val = base / factors[i];
      const isActive = u === fromUnit;
      const activeClasses = isActive ? `border-${accentClass}-500/40 bg-${accentClass}-500/10` : 'border-gray-700/50 hover:border-gray-500/30';
      return `<div class="bg-gray-800/40 border rounded-xl px-4 py-3 transition-all ${activeClasses}">
        <div class="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 ${isActive ? `text-${accentClass}-400` : ''}">${u}</div>
        <div class="font-mono text-sm text-gray-200 break-all">${fmtNum(val)}</div>
      </div>`;
    }).join(''));
  };

  const updateData = () => {
    renderUnitCards('unit-data-output', parseFloat($('#unit-data-input').val()), $('#unit-data-from').val(), DATA_UNITS, DATA_FACTORS, 'blue');
  };
  const updateTime = () => {
    renderUnitCards('unit-time-output', parseFloat($('#unit-time-input').val()), $('#unit-time-from').val(), TIME_UNITS, TIME_FACTORS, 'purple');
  };
  const updateLength = () => {
    renderUnitCards('unit-length-output', parseFloat($('#unit-length-input').val()), $('#unit-length-from').val(), LENGTH_UNITS, LENGTH_FACTORS, 'emerald');
  };
  const updateMass = () => {
    renderUnitCards('unit-mass-output', parseFloat($('#unit-mass-input').val()), $('#unit-mass-from').val(), MASS_UNITS, MASS_FACTORS, 'amber');
  };
  const updateSpeed = () => {
    renderUnitCards('unit-speed-output', parseFloat($('#unit-speed-input').val()), $('#unit-speed-from').val(), SPEED_UNITS, SPEED_FACTORS, 'rose');
  };

  $('#unit-data-input, #unit-data-from').on('input change', updateData);
  $('#unit-time-input, #unit-time-from').on('input change', updateTime);
  $('#unit-length-input, #unit-length-from').on('input change', updateLength);
  $('#unit-mass-input, #unit-mass-from').on('input change', updateMass);
  $('#unit-speed-input, #unit-speed-from').on('input change', updateSpeed);

  // Initial load
  updateData();
  updateTime();
  updateLength();
  updateMass();
  updateSpeed();

