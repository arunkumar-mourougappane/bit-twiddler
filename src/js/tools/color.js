  // --- Color Converter Logic ---
  const $colorInput = $('#color-input');
  const $colorError = $('#color-error');
  const $colorSwatch = $('#color-swatch');
  const $colorOutHex = $('#color-out-hex');
  const $colorOutRgb = $('#color-out-rgb');
  const $colorOutHsl = $('#color-out-hsl');
  const $colorOutCmyk = $('#color-out-cmyk');

  const hexToRgb = (hex) => {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
          r = "0x" + hex[1] + hex[1];
          g = "0x" + hex[2] + hex[2];
          b = "0x" + hex[3] + hex[3];
      } else if (hex.length === 7) {
          r = "0x" + hex[1] + hex[2];
          g = "0x" + hex[3] + hex[4];
          b = "0x" + hex[5] + hex[6];
      }
      return [Number(r), Number(g), Number(b)];
  };

  const rgbToHsl = (r, g, b) => {
      r /= 255; g /= 255; b /= 255;
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) {
          h = s = 0;
      } else {
          let d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
      }
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const rgbToCmyk = (r, g, b) => {
      let c = 1 - (r / 255);
      let m = 1 - (g / 255);
      let y = 1 - (b / 255);
      let k = Math.min(c, Math.min(m, y));
      if (k === 1) {
          return [0, 0, 0, 100];
      }
      c = Math.round((c - k) / (1 - k) * 100);
      m = Math.round((m - k) / (1 - k) * 100);
      y = Math.round((y - k) / (1 - k) * 100);
      k = Math.round(k * 100);
      return [c, m, y, k];
  };

  const clearColorUI = () => {
       $colorSwatch.css('background-color', '');
       $colorOutHex.text('');
       $colorOutRgb.text('');
       $colorOutHsl.text('');
       $colorOutCmyk.text('');
  };

  $colorInput.on('input', function() {
      let val = $(this).val().trim();
      if (!val) {
          $colorError.addClass('hidden');
          clearColorUI();
          return;
      }
      if (!val.startsWith('#')) {
          val = '#' + val;
      }
      const validHex = /^#([0-9A-F]{3}){1,2}$/i.test(val);
      if (!validHex) {
          $colorError.removeClass('hidden');
          clearColorUI();
      } else {
          $colorError.addClass('hidden');
          const [r, g, b] = hexToRgb(val);
          const [h, s, l] = rgbToHsl(r, g, b);
          const [c, m, y, k] = rgbToCmyk(r, g, b);
          
          let fullHex = val.toUpperCase();
          if (fullHex.length === 4) {
              fullHex = '#' + fullHex[1]+fullHex[1]+fullHex[2]+fullHex[2]+fullHex[3]+fullHex[3];
          }

          $colorSwatch.css('background-color', fullHex);
          $colorOutHex.text(fullHex);
          $colorOutRgb.text(`rgb(${r}, ${g}, ${b})`);
          $colorOutHsl.text(`hsl(${h}, ${s}%, ${l}%)`);
          $colorOutCmyk.text(`cmyk(${c}%, ${m}%, ${y}%, ${k}%)`);
      }
  });
