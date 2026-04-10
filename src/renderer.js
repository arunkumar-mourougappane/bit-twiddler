$(document).ready(function() {

  // --- Navigation Logic ---
  const $navLinks = $('.nav-link');
  const $toolSections = $('.tool-section');

  const updateActiveNav = (targetId) => {
    $navLinks.each(function() {
      const $link = $(this);
      if ($link.data('target') === targetId) {
        $link.removeClass('text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent');
        $link.addClass('bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-sm');
      } else {
        $link.removeClass('bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-sm');
        $link.addClass('text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent');
      }
    });

    $toolSections.each(function() {
      const $section = $(this);
      if ($section.attr('id') === targetId) {
        $section.removeClass('hidden');
      } else {
        $section.addClass('hidden');
      }
    });
  };

  $navLinks.on('click', function(e) {
    e.preventDefault();
    const target = $(this).data('target');
    updateActiveNav(target);
  });

  // --- Base64 Tool Logic ---
  const $b64Plain = $('#base64-plain');
  const $b64Encoded = $('#base64-encoded');

  $b64Plain.on('input', function() {
    try {
      $b64Encoded.val(btoa($b64Plain.val()));
    } catch (e) {
      if (e.name === 'InvalidCharacterError') {
         $b64Encoded.val(btoa(unescape(encodeURIComponent($b64Plain.val()))));
      } else {
         $b64Encoded.val("");
      }
    }
  });

  $b64Encoded.on('input', function() {
    try {
      $b64Plain.val(decodeURIComponent(escape(atob($b64Encoded.val()))));
    } catch (e) {
      // Ignore Invalid base64 during partial typing
    }
  });

  const copyToClipboard = async (text, $btnElement) => {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = $btnElement.text();
      $btnElement.text("Copied!");
      setTimeout(() => { $btnElement.text(originalText); }, 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  $('#b64-copy-plain').on('click', function() {
    copyToClipboard($b64Plain.val(), $(this));
  });
  
  $('#b64-copy-encoded').on('click', function() {
    copyToClipboard($b64Encoded.val(), $(this));
  });

  // --- Hash Generator Logic ---
  const $hashInput = $('#hash-input');
  const $hashMd5 = $('#hash-md5');
  const $hashSha1 = $('#hash-sha1');
  const $hashSha256 = $('#hash-sha256');
  const $hashSha512 = $('#hash-sha512');
  
  const $hashTabs = $('.hash-tab-btn');
  const $hashViews = $('.hash-view');
  const $hashFileInput = $('#hash-file-input');
  const $hashFileName = $('#hash-file-name');
  const $hashLiveIndicator = $('#hash-file-live-indicator');
  
  let currentHashMode = 'text';

  const clearHashes = () => {
       $hashMd5.val("d41d8cd98f00b204e9800998ecf8427e");
       $hashSha1.val("da39a3ee5e6b4b0d3255bfef95601890afd80709");
       $hashSha256.val("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
       $hashSha512.val("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e");
  };

  const setHashes = (hashes) => {
      $hashMd5.val(hashes.md5);
      $hashSha1.val(hashes.sha1);
      $hashSha256.val(hashes.sha256);
      $hashSha512.val(hashes.sha512);
  };

  $hashTabs.on('click', function() {
      $hashTabs.removeClass('active text-blue-400 border-blue-500').addClass('text-gray-500 border-transparent hover:text-gray-300');
      $(this).addClass('active text-blue-400 border-blue-500').removeClass('text-gray-500 border-transparent hover:text-gray-300');
      
      $hashViews.addClass('hidden');
      const targetId = $(this).data('view');
      $('#' + targetId).removeClass('hidden');
      
      currentHashMode = targetId === 'hash-text-view' ? 'text' : 'file';
      
      if (currentHashMode === 'text') {
         window.api.stopFileWatch();
         $hashLiveIndicator.addClass('hidden');
         updateHashes();
      } else {
         if ($hashFileInput[0].files.length === 0) {
             clearHashes();
         } else {
             triggerFileHash($hashFileInput[0].files[0].path);
         }
      }
  });

  const updateHashes = async () => {
    if (currentHashMode !== 'text') return;
    const text = $hashInput.val();
    if (text === "") {
       clearHashes();
       return;
    }
    
    try {
      const hashes = await window.api.generateHashes(text);
      setHashes(hashes);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerFileHash = async (filePath) => {
     try {
       $hashLiveIndicator.removeClass('hidden text-green-400').addClass('text-blue-400');
       $hashLiveIndicator.html(`
           <svg class="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           <span class="uppercase tracking-widest text-[10px]">Calculating Secure Hashes...</span>
       `);

       const hashes = await window.api.hashFile(filePath);
       setHashes(hashes);
       
       $hashLiveIndicator.removeClass('text-blue-400').addClass('text-green-400');
       $hashLiveIndicator.html(`
               <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span class="uppercase tracking-widest text-[10px]">Calculation Complete! Live watch active</span>
       `);
     } catch (e) {
       console.error("File hash error", e);
       clearHashes();
       $hashLiveIndicator.addClass('hidden');
     }
  };

  $hashFileInput.on('change', function(e) {
      if (e.target.files.length > 0) {
         const file = e.target.files[0];
         $hashFileName.text(file.name);
         triggerFileHash(file.path);
      } else {
         $hashFileName.text('');
         clearHashes();
         window.api.stopFileWatch();
         $hashLiveIndicator.addClass('hidden');
      }
  });

  window.api.onFileHashUpdate((newHashes) => {
      if (currentHashMode === 'file') {
         setHashes(newHashes);
         $hashLiveIndicator.removeClass('text-blue-400 hidden').addClass('text-green-400');
         $hashLiveIndicator.html(`
               <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span class="uppercase tracking-widest text-[10px]">File Modified! Updated Hashes Live</span>
         `);
      }
  });

  $hashInput.on('input', updateHashes);

  $('.copy-hash-btn').on('click', function() {
    const targetId = $(this).data('target');
    const $inputEl = $('#' + targetId);
    $inputEl.select();
    
    const hasSvgContext = $(this).find('svg').length > 0;
    copyToClipboard($inputEl.val(), hasSvgContext ? $(this) : $(this)); 
  });

  // --- Epoch Converter Logic ---
  const $epochInput = $('#epoch-input');
  const $epochCurrentBtn = $('#epoch-current-btn');
  const $epochLocalOut = $('#epoch-local-out');
  const $epochGmtOut = $('#epoch-gmt-out');

  const $dateInput = $('#date-input');
  const $dateTimestampOut = $('#date-timestamp-out');

  const updateEpochUI = (val) => {
    if (!val) {
      $epochLocalOut.text("");
      $epochGmtOut.text("");
      return;
    }
    let timestamp = parseInt(val, 10);
    if (timestamp < 10000000000) {
      timestamp *= 1000;
    }
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) {
      $epochLocalOut.text("Invalid Date");
      $epochGmtOut.text("Invalid Date");
    } else {
      $epochLocalOut.text(d.toLocaleString());
      $epochGmtOut.text(d.toUTCString());
    }
  };

  $epochInput.on('input', function() {
    updateEpochUI($epochInput.val());
  });
  
  $epochCurrentBtn.on('click', function() {
    const nowS = Math.floor(Date.now() / 1000);
    $epochInput.val(nowS);
    updateEpochUI(nowS);
  });

  const updateDateUI = (val) => {
     if (!val) {
       $dateTimestampOut.text("");
       return;
     }
     const d = new Date(val);
     if (isNaN(d.getTime())) {
       $dateTimestampOut.text("Invalid Date");
     } else {
       $dateTimestampOut.text(Math.floor(d.getTime() / 1000));
     }
  };

  $dateInput.on('input', function() {
    updateDateUI($dateInput.val());
  });

  // --- JSON Formatter Logic ---
  const $jsonInput = $('#json-input');
  const $jsonStatus = $('#json-status');
  const $jsonTextOut = $('#json-output-text');
  const $jsonTreeOut = $('#json-output-tree');
  const $jsonTabs = $('.json-tab-btn');
  const $jsonPanes = $('.json-view-pane');
  const $jsonSearch = $('#json-search');
  const $jsonCopyBtn = $('#json-copy-btn');
  const $jsonClearBtn = $('#json-clear-btn');
  
  let currentFormattedJson = "";

  $jsonClearBtn.on('click', function() {
      $jsonInput.val('').trigger('input');
      $jsonSearch.val('');
  });

  $jsonCopyBtn.on('click', function() {
     if(currentFormattedJson) {
        navigator.clipboard.writeText(currentFormattedJson);
        const originalText = $(this).text();
        $(this).text("Copied!").removeClass('text-blue-400 border-blue-500/40').addClass('text-green-400 border-green-500/50 hover:bg-green-500/20');
        setTimeout(() => {
           $(this).text(originalText).removeClass('text-green-400 border-green-500/50 hover:bg-green-500/20').addClass('text-blue-400 border-blue-500/40');
        }, 2000);
     }
  });

  $jsonSearch.on('input', function() {
    const q = $(this).val();
    if(q) {
        $('#json-tree-view details').prop('open', true);
    }
  });

  $jsonSearch.on('keydown', function(e) {
    if(e.key === 'Enter') {
       e.preventDefault();
       const q = $(this).val();
       if(q) {
          window.find(q, false, false, true, false, true, false);
       }
    }
  });

  $jsonTabs.on('click', function() {
    $jsonTabs.removeClass('active border-blue-500 text-blue-400').addClass('border-transparent text-gray-500');
    $(this).addClass('active border-blue-500 text-blue-400').removeClass('border-transparent text-gray-500');
    
    $jsonPanes.addClass('hidden');
    $('#' + $(this).data('view')).removeClass('hidden');
  });

  const syntaxHighlight = (json) => {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'text-orange-400';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'text-blue-400 font-semibold';
            } else {
                cls = 'text-green-400';
            }
        } else if (/true|false/.test(match)) {
            cls = 'text-purple-400 font-bold';
        } else if (/null/.test(match)) {
            cls = 'text-gray-500 italic';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
  };

  const createTreeNode = (key, value, isLast) => {
    const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    
    let badgeColor = 'bg-gray-700 text-gray-300';
    if (type === 'object') badgeColor = 'bg-blue-900/50 text-blue-300 border border-blue-700/50';
    else if (type === 'array') badgeColor = 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50';
    else if (type === 'string') badgeColor = 'bg-green-900/50 text-green-300 border border-green-700/50';
    else if (type === 'number') badgeColor = 'bg-orange-900/50 text-orange-300 border border-orange-700/50';
    else if (type === 'boolean') badgeColor = 'bg-purple-900/50 text-purple-300 border border-purple-700/50';
    else if (type === 'null') badgeColor = 'bg-gray-800 text-gray-500 border border-gray-700/50';

    let typeBadge = `<span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded mr-2 ${badgeColor} shadow-sm align-middle tracking-wider">${type === 'array' ? 'Array['+value.length+']' : type}</span>`;
    
    let html = `<div class="ml-4 border-l border-gray-700/50 pl-2 py-0.5 opacity-95 hover:opacity-100 transition-opacity">`;
    let keyHtml = key !== null ? `<span class="text-blue-400 font-semibold">"${key}"</span><span class="text-gray-400 mr-2">:</span>${typeBadge}` : `${typeBadge}`;

    if (type === 'object' || type === 'array') {
      const isArr = type === 'array';
      const open = isArr ? '[' : '{';
      const close = isArr ? ']' : '}';
      const keys = Object.keys(value);
      
      if (keys.length === 0) {
        html += `${keyHtml}<span class="text-gray-400">${open}${close}</span>${!isLast ? '<span class="text-gray-500">,</span>' : ''}`;
      } else {
        html += `<details open class="group">
                  <summary class="cursor-pointer hover:text-white select-none list-none relative flex items-center -ml-3 pl-3">
                    <span class="absolute left-0 text-gray-500 group-open:rotate-90 transition-transform text-[10px]">▶</span>
                    ${keyHtml}<span class="text-gray-400">${open}</span>
                  </summary>
                  <div>`;
        keys.forEach((k, i) => {
           html += createTreeNode(isArr ? null : k, value[k], i === keys.length - 1);
        });
        html += ` </div>
                  <span class="text-gray-400">${close}</span>${!isLast ? '<span class="text-gray-500">,</span>' : ''}
                </details>`;
      }
    } else {
      let valHtml = '';
      if (type === 'string') {
        const escapedStr = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        valHtml = `<span class="text-green-400">"${escapedStr}"</span>`;
      } else if (type === 'number') {
        valHtml = `<span class="text-orange-400">${value}</span>`;
      } else if (type === 'boolean') {
        valHtml = `<span class="text-purple-400 font-bold">${value}</span>`;
      } else if (type === 'null') {
        valHtml = `<span class="text-gray-500 italic">null</span>`;
      }
      html += `${keyHtml}${valHtml}${!isLast ? '<span class="text-gray-500">,</span>' : ''}`;
    }
    html += `</div>`;
    return html;
  };

  const updateJSONUI = () => {
    const raw = $jsonInput.val().trim();
    if (!raw) {
      $jsonStatus.text("Ready").removeClass('bg-red-500/20 text-red-400 bg-green-500/20 text-green-400').addClass('bg-gray-800 text-gray-500');
      $jsonTextOut.html('');
      $jsonTreeOut.html('');
      currentFormattedJson = "";
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, 2);
      currentFormattedJson = formatted;
      
      // Update Status
      $jsonStatus.text("Valid JSON").removeClass('bg-gray-800 text-gray-500 bg-red-500/20 text-red-400').addClass('bg-green-500/20 text-green-400');
      
      // Update Text View
      $jsonTextOut.html(syntaxHighlight(formatted));
      
      // Update Tree View (Wrap root in pseudo key)
      $jsonTreeOut.html(createTreeNode(null, parsed, true));

    } catch (e) {
      $jsonStatus.text("Invalid JSON").removeClass('bg-gray-800 text-gray-500 bg-green-500/20 text-green-400').addClass('bg-red-500/20 text-red-400');
    }
  };

  $jsonInput.on('input', updateJSONUI);

  // --- JWT Decoder Logic ---
  const $jwtInput = $('#jwt-input');
  const $jwtStatus = $('#jwt-status');
  const $jwtOutHeader = $('#jwt-output-header');
  const $jwtOutPayload = $('#jwt-output-payload');
  const $jwtOutSignature = $('#jwt-output-signature');
  const $jwtSearch = $('#jwt-search');
  const $jwtClearBtn = $('#jwt-clear-btn');

  $jwtClearBtn.on('click', function() {
      $jwtInput.val('').trigger('input');
      $jwtSearch.val('');
  });

  $jwtSearch.on('input', function() {
    const q = $(this).val();
    if(q) {
        $('#jwt-tree-view details').prop('open', true);
    }
  });

  $jwtSearch.on('keydown', function(e) {
    if(e.key === 'Enter') {
       e.preventDefault();
       const q = $(this).val();
       if(q) {
          window.find(q, false, false, true, false, true, false);
       }
    }
  });

  const decodeJWT = (token) => {
    const parts = token.split('.');
    if(parts.length !== 3) throw new Error("Invalid JWT Format: Must have 3 parts.");
    
    // Safely parse Base64Url string bounds
    const b64DecodeUnicode = str => {
       const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
       const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
       return decodeURIComponent(
         atob(padded).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
       );
    };

    return {
       header: JSON.parse(b64DecodeUnicode(parts[0])),
       payload: JSON.parse(b64DecodeUnicode(parts[1])),
       signature: parts[2]
    };
  };

  const updateJWTUI = () => {
    const raw = $jwtInput.val().trim();
    if (!raw) {
      $jwtStatus.text("Ready").removeClass('bg-red-500/20 text-red-400 bg-green-500/20 text-green-400').addClass('bg-gray-800 text-gray-500');
      $jwtOutHeader.html('');
      $jwtOutPayload.html('');
      $jwtOutSignature.text('');
      return;
    }

    try {
      const decoded = decodeJWT(raw);
      
      $jwtStatus.text("Valid Token").removeClass('bg-gray-800 text-gray-500 bg-red-500/20 text-red-400').addClass('bg-green-500/20 text-green-400');
      
      // Hook into our robust JSON formatting structures (null key wraps the root map)
      $jwtOutHeader.html(createTreeNode(null, decoded.header, true));
      $jwtOutPayload.html(createTreeNode(null, decoded.payload, true));
      $jwtOutSignature.text(decoded.signature);

    } catch (e) {
      $jwtStatus.text("Invalid Token").removeClass('bg-gray-800 text-gray-500 bg-green-500/20 text-green-400').addClass('bg-red-500/20 text-red-400');
      $jwtOutHeader.html('');
      $jwtOutPayload.html('');
      $jwtOutSignature.text('');
    }
  };

  $jwtInput.on('input', updateJWTUI);

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

  // --- UUID Generator Logic ---
  const $uuidQty = $('#uuid-qty');
  const $uuidUpper = $('#uuid-upper');
  const $uuidHyphens = $('#uuid-hyphens');
  const $uuidGenerateBtn = $('#uuid-generate-btn');
  const $uuidOutput = $('#uuid-output');
  const $uuidCopyBtn = $('#uuid-copy-btn');

  $uuidGenerateBtn.on('click', () => {
      let qty = parseInt($uuidQty.val(), 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      if (qty > 1000) qty = 1000;
      
      const isUpper = $uuidUpper.is(':checked');
      const removeHyphens = $uuidHyphens.is(':checked');
      
      let results = [];
      for(let i=0; i<qty; i++) {
          let id = window.crypto.randomUUID();
          if (removeHyphens) id = id.replaceAll('-', '');
          if (isUpper) id = id.toUpperCase();
          results.push(id);
      }
      
      $uuidOutput.val(results.join('\n'));
  });

  $uuidCopyBtn.on('click', () => {
    const txt = $uuidOutput.val();
    if(txt) {
        navigator.clipboard.writeText(txt);
        const origBtnText = $uuidCopyBtn.html();
        $uuidCopyBtn.html('<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!');
        setTimeout(() => {
           $uuidCopyBtn.html(origBtnText);
        }, 2000);
    }
  });

  // --- QR Code Generator Logic ---
  const $qrInput = $('#qr-input');
  const $qrClearBtn = $('#qr-clear-btn');
  const $qrImageContainer = $('#qr-image-container');
  const $qrPlaceholder = $('#qr-placeholder');
  const $qrImage = $('#qr-image');
  const $qrDownloadBtn = $('#qr-download-btn');

  $qrClearBtn.on('click', () => {
      $qrInput.val('').trigger('input');
  });

  $qrInput.on('input', async function() {
      const val = $(this).val().trim();
      
      if (!val) {
          $qrPlaceholder.removeClass('hidden');
          $qrImage.addClass('hidden').attr('src', '');
          $qrDownloadBtn.addClass('hidden');
          $qrImageContainer.addClass('opacity-20');
          return;
      }
      
      try {
          // Utilize secure preload API bridges to route string parsing across context domains safely
          const dataUrl = await window.api.generateQR(val);
          
          $qrPlaceholder.addClass('hidden');
          $qrImage.attr('src', dataUrl).removeClass('hidden');
          $qrDownloadBtn.removeClass('hidden');
          $qrImageContainer.removeClass('opacity-20');
      } catch (err) {
          console.error("QR Generation error via bridging:", err);
      }
  });

  $qrDownloadBtn.on('click', () => {
      // Export Native Blob string directly over to fs
      const dataURL = $qrImage.attr('src');
      if(!dataURL) return;
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = "qrcode.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  });

  // Initialize
  $epochCurrentBtn.trigger('click');
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  $dateInput.val(now.toISOString().slice(0, 19));
  updateDateUI($dateInput.val());

});
