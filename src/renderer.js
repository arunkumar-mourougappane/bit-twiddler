$(document).ready(function() {

  // --- Navigation Logic ---
  const $navLinks = $('.nav-link');
  const $toolSections = $('.tool-section');

  // Build the sliding pill indicator element
  const $pill = $('<div>').addClass('nav-active-pill').appendTo('#nav-list');

  const movePillTo = ($li) => {
    $pill.css({
      top:     $li[0].offsetTop + 'px',
      height:  $li[0].offsetHeight + 'px',
      opacity: 1
    });
  };

  const updateActiveNav = (targetId) => {
    let $activeLink = null;

    $navLinks.each(function() {
      const $link = $(this);
      if ($link.data('target') === targetId) {
        $link.removeClass('text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent');
        $link.addClass('text-blue-400 active-tool');
        $activeLink = $link;
      } else {
        $link.removeClass('text-blue-400 active-tool bg-blue-600/10 border-blue-500/20 shadow-sm');
        $link.addClass('text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border-transparent');
      }
    });

    // Slide pill to the active nav item
    if ($activeLink) {
      movePillTo($activeLink.closest('li'));
    }

    // Animate the incoming tool section
    $toolSections.each(function() {
      const $section = $(this);
      if ($section.attr('id') === targetId) {
        $section.removeClass('entering hidden');
        void $section[0].offsetWidth; // force reflow to re-trigger animation
        $section.addClass('entering');
      } else {
        $section.removeClass('entering').addClass('hidden');
      }
    });
  };

  $navLinks.on('click', function(e) {
    e.preventDefault();
    const $this = $(this);
    // Icon pop-bounce on click
    $this.addClass('icon-clicked');
    setTimeout(() => $this.removeClass('icon-clicked'), 300);
    updateActiveNav($this.data('target'));
  });

  // Initialize: animate default section and position pill on Base64
  updateActiveNav('base64-tool');

  // ============================================================
  // KEYBOARD SHORTCUTS — Cmd/Ctrl + 1–9 to jump to tools
  // ============================================================
  const navTargets = $navLinks.map(function() { return $(this).data('target'); }).get();

  $(document).on('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9 && num <= navTargets.length) {
        e.preventDefault();
        updateActiveNav(navTargets[num - 1]);
      }
    }
  });

  // ============================================================
  // FAVORITES — pin tools to the top of the sidebar
  // ============================================================
  const toolOrder = [...navTargets]; // capture DOM order before any reordering

  // Inject star buttons into every nav link dynamically
  $navLinks.each(function() {
    const target = $(this).data('target');
    $(this).find('div').first()
      .removeClass('space-x-3')
      .addClass('gap-3 w-full');
    $('<button>')
      .addClass('fav-btn ml-auto flex-shrink-0')
      .attr({ 'data-tool': target, title: 'Pin to top' })
      .html('☆')
      .appendTo($(this).find('div').first())
      .on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const favs = JSON.parse(localStorage.getItem('bt-favorites') || '[]');
        const idx = favs.indexOf(target);
        idx >= 0 ? favs.splice(idx, 1) : favs.push(target);
        localStorage.setItem('bt-favorites', JSON.stringify(favs));
        applyFavoritesOrder();
      });
  });

  const applyFavoritesOrder = () => {
    const favs = JSON.parse(localStorage.getItem('bt-favorites') || '[]');
    const $ul  = $('#nav-list');
    const $pillEl = $('#nav-list .nav-active-pill').detach(); // remove pill from flow

    // Remove divider, restore original order
    $('.fav-divider').remove();
    toolOrder.forEach(t => $(`a[data-target="${t}"]`).closest('li').appendTo($ul));

    // Move favorites to top
    [...favs].reverse().forEach(t => $(`a[data-target="${t}"]`).closest('li').prependTo($ul));

    // Insert divider after last pinned item
    if (favs.length) {
      const $lastFav = $(`a[data-target="${favs[favs.length - 1]}"]`).closest('li');
      $('<li class="fav-divider px-3 py-1"><div class="h-px bg-gray-700/40 rounded"></div></li>').insertAfter($lastFav);
    }

    // Sync star visual state
    $('.fav-btn').each(function() {
      const isFav = favs.includes($(this).data('tool'));
      $(this).html(isFav ? '★' : '☆').toggleClass('is-fav', isFav);
      $(this).closest('.nav-link').toggleClass('has-fav', isFav);
    });

    // Re-attach pill and reposition it under active link
    $ul.append($pillEl);
    const $active = $('.nav-link.active-tool');
    if ($active.length) movePillTo($active.closest('li'));
  };

  applyFavoritesOrder(); // apply on load (restores persisted favorites)

  // ============================================================
  // THEME PICKER — 4 accent color schemes, persisted to localStorage
  // ============================================================
  const applyTheme = (theme) => {
    const t = theme || 'ocean';
    document.body.setAttribute('data-theme', t);
    localStorage.setItem('bt-theme', t);
    $('.theme-dot').removeClass('active-theme');
    $(`.theme-dot[data-theme="${t}"]`).addClass('active-theme');
  };

  $('.theme-dot').on('click', function() { applyTheme($(this).data('theme')); });

  // Restore saved theme (or default ocean)
  applyTheme(localStorage.getItem('bt-theme') || 'ocean');

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

  // ============================================================
  // Shared utility
  // ============================================================
  const escHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // ============================================================
  // REGEX TESTER
  // ============================================================
  const runRegex = () => {
    const pattern  = $('#regex-pattern').val();
    const testStr  = $('#regex-input').val();
    const $hl      = $('#regex-highlight');
    const $count   = $('#regex-match-count');
    const $status  = $('#regex-status');
    const $list    = $('#regex-match-list');

    if (!pattern) {
      $hl.text(testStr);
      $count.text('');
      $status.html('');
      $list.html('');
      return;
    }

    let flags = '';
    if ($('#rflag-g').is(':checked')) flags += 'g';
    if ($('#rflag-i').is(':checked')) flags += 'i';
    if ($('#rflag-m').is(':checked')) flags += 'm';
    if ($('#rflag-s').is(':checked')) flags += 's';

    let baseRegex;
    try {
      baseRegex = new RegExp(pattern, flags);
      $status.html('<span class="text-green-400 font-mono">✓ valid</span>');
    } catch (e) {
      $status.html(`<span class="text-red-400">${escHtml(e.message)}</span>`);
      $hl.text(testStr || '');
      $count.text('');
      $list.html('');
      return;
    }

    // Collect all matches using a global copy to allow looping
    const globalRegex = new RegExp(baseRegex.source, flags.includes('g') ? flags : flags + 'g');
    globalRegex.lastIndex = 0;
    const matches = [];
    let m;
    while ((m = globalRegex.exec(testStr)) !== null) {
      matches.push({ index: m.index, value: m[0], groups: Array.from(m).slice(1) });
      if (m[0].length === 0) globalRegex.lastIndex++; // avoid infinite loop on zero-width matches
    }

    // Build highlighted HTML
    let html = '', last = 0;
    matches.forEach((match, i) => {
      html += escHtml(testStr.slice(last, match.index));
      html += `<mark style="background:rgba(139,92,246,0.30);color:#c4b5fd;border-radius:2px;padding:0 1px" title="Match ${i + 1}">${escHtml(match.value)}</mark>`;
      last = match.index + match.value.length;
    });
    html += escHtml(testStr.slice(last));
    $hl.html(html || '<span class="text-gray-600 italic text-xs">Start typing a pattern...</span>');

    const n = matches.length;
    $count.text(n ? `${n} match${n !== 1 ? 'es' : ''}` : 'no matches');

    // Match detail list
    if (n === 0) {
      $list.html('<div class="text-xs text-gray-600 italic px-2 py-1">No matches found.</div>');
    } else {
      $list.html(matches.map((match, i) => {
        const groups = match.groups.filter(g => g !== undefined)
          .map((g, gi) => `<span class="text-blue-400 ml-2">$${gi + 1}:<span class="text-gray-300">${escHtml(String(g))}</span></span>`).join('');
        return `<div class="flex items-center gap-2 px-2 py-1 bg-gray-800/50 rounded-lg text-xs font-mono">
          <span class="text-violet-500 font-bold w-5 text-right flex-shrink-0">${i + 1}</span>
          <span class="text-gray-600">@${match.index}</span>
          <span class="text-violet-300 truncate max-w-xs">${escHtml(match.value || '(empty)')}</span>
          ${groups}
        </div>`;
      }).join(''));
    }
  };

  $('#regex-pattern, #regex-input').on('input', runRegex);
  $('#rflag-g, #rflag-i, #rflag-m, #rflag-s').on('change', runRegex);

  // ============================================================
  // DIFF VIEWER — pure LCS line diff, no external library needed
  // ============================================================
  const computeLineDiff = (oldText, newText) => {
    const a = oldText.split('\n');
    const b = newText.split('\n');
    const m = a.length, n = b.length;

    // Build LCS DP table
    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

    // Backtrack to produce diff
    const result = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i-1] === b[j-1]) {
        result.unshift({ type: 'equal', value: a[i-1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
        result.unshift({ type: 'added', value: b[j-1] });
        j--;
      } else {
        result.unshift({ type: 'removed', value: a[i-1] });
        i--;
      }
    }
    return result;
  };

  const runDiff = () => {
    const orig = $('#diff-original').val();
    const mod  = $('#diff-modified').val();

    if (!orig && !mod) {
      $('#diff-output').html('<div class="p-4 text-gray-600 italic">Paste text in both fields above to see the diff...</div>');
      $('#diff-stats').html('');
      return;
    }

    const diff = computeLineDiff(orig, mod);
    let added = 0, removed = 0, html = '';

    diff.forEach(part => {
      const v = escHtml(part.value);
      if (part.type === 'added') {
        added++;
        html += `<div class="flex items-stretch bg-green-500/10 border-l-2 border-green-500 hover:bg-green-500/15">
          <span class="text-green-500 px-3 py-0.5 select-none font-bold flex-shrink-0">+</span>
          <span class="flex-1 py-0.5 text-green-300 pr-3">${v}</span>
        </div>`;
      } else if (part.type === 'removed') {
        removed++;
        html += `<div class="flex items-stretch bg-red-500/10 border-l-2 border-red-600 hover:bg-red-500/15">
          <span class="text-red-500 px-3 py-0.5 select-none font-bold flex-shrink-0">-</span>
          <span class="flex-1 py-0.5 text-red-400 line-through opacity-75 pr-3">${v}</span>
        </div>`;
      } else {
        html += `<div class="flex items-stretch border-l-2 border-transparent hover:bg-gray-800/20">
          <span class="text-gray-700 px-3 py-0.5 select-none flex-shrink-0"> </span>
          <span class="flex-1 py-0.5 text-gray-500 pr-3">${v}</span>
        </div>`;
      }
    });

    $('#diff-output').html(html || '<div class="p-4 text-gray-500">No differences — both texts are identical.</div>');

    const stats = [
      added   ? `<span class="text-green-400">+${added} added</span>` : '',
      removed ? `<span class="text-red-400">-${removed} removed</span>` : '',
      (!added && !removed) ? '<span class="text-gray-500">Identical</span>' : ''
    ].filter(Boolean).join('');
    $('#diff-stats').html(stats);
  };

  $('#diff-original, #diff-modified').on('input', runDiff);

  // ============================================================
  // NUMBER BASE CONVERTER
  // ============================================================
  const VALID_CHARS = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[0-9]+$/, 16: /^[0-9A-Fa-f]+$/ };

  const runBaseConvert = () => {
    const raw      = $('#base-input').val().trim().replace(/\s/g, '');
    const fromBase = parseInt($('#base-select').val());
    const $error   = $('#base-error');
    const $bitViz  = $('#base-bit-viz');

    const clearOutputs = () => {
      ['bin','oct','dec','hex'].forEach(k => $(`#base-out-${k}`).text('—'));
      $bitViz.addClass('hidden');
    };

    if (!raw) { clearOutputs(); $error.addClass('hidden'); return; }

    if (!VALID_CHARS[fromBase].test(raw)) {
      $error.removeClass('hidden').text(`Invalid character for base ${fromBase}. Allowed: ${Object.keys(VALID_CHARS[fromBase].source.slice(2, -2).split(''))[0]}`);
      clearOutputs();
      return;
    }

    $error.addClass('hidden');

    try {
      const num = parseInt(raw, fromBase);
      if (!isFinite(num) || isNaN(num)) throw new Error('Out of range');

      const bin = num.toString(2);
      const oct = num.toString(8);
      const dec = num.toString(10);
      const hex = num.toString(16).toUpperCase();

      // Binary with space-separated nibbles (groups of 4)
      $('#base-out-bin').text(bin.match(/.{1,4}/g).join(' ') || bin);
      $('#base-out-oct').text(oct);
      $('#base-out-dec').text(dec);
      $('#base-out-hex').text('0x' + hex);

      // Bit width visualization
      const bitWidth = num <= 0xFF ? 8 : num <= 0xFFFF ? 16 : num <= 0xFFFFFFFF ? 32 : 64;
      const padded   = bin.padStart(bitWidth, '0');
      const grouped  = padded.match(/.{1,8}/g) || [padded];

      $('#base-bits').html(
        grouped.map((byte, bi) =>
          (bi > 0 ? '<span class="mx-2 text-gray-700 select-none">|</span>' : '') +
          byte.split('').map(c =>
            c === '1'
              ? `<span class="text-amber-400 font-bold">${c}</span>`
              : `<span class="text-gray-600">${c}</span>`
          ).join('')
        ).join('') +
        `<span class="ml-4 text-xs text-gray-600 font-sans">${bitWidth}-bit</span>`
      );
      $bitViz.removeClass('hidden');

    } catch (e) {
      $error.removeClass('hidden').text('Conversion error: ' + e.message);
      clearOutputs();
    }
  };

  $('#base-input').on('input', runBaseConvert);
  $('#base-select').on('change', () => { $('#base-input').val(''); runBaseConvert(); });

  // Copy buttons for base converter
  $(document).on('click', '.base-copy-btn', function () {
    const id  = $(this).data('target');
    const txt = $(`#${id}`).text().replace(/\s/g, '');
    if (!txt || txt === '—') return;
    navigator.clipboard.writeText(txt);
    const $btn = $(this), orig = $btn.text();
    $btn.text('Copied!');
    setTimeout(() => $btn.text(orig), 1500);
  });

  // ============================================================
  // LOREM IPSUM GENERATOR
  // ============================================================
  const LOREM = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum'];
  const rWord = () => LOREM[Math.floor(Math.random() * LOREM.length)];
  const cap   = (s) => s[0].toUpperCase() + s.slice(1);

  const genSentence = () => {
    const n = Math.floor(Math.random() * 10) + 6;
    const words = Array.from({ length: n }, rWord);
    if (n > 8 && Math.random() > 0.5) words[Math.floor(n * 0.4)] += ',';
    return cap(words.join(' ')) + '.';
  };
  const genParagraph = () => Array.from({ length: Math.floor(Math.random() * 3) + 4 }, genSentence).join(' ');

  const generateLorem = () => {
    const count = parseInt($('#lorem-count').val());
    const type  = $('#lorem-type').val();
    let html = '';
    if (type === 'paragraphs') {
      html = Array.from({ length: count }, (_, i) => {
        const p = i === 0
          ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' + Array.from({ length: 3 }, genSentence).join(' ')
          : genParagraph();
        return `<p>${p}</p>`;
      }).join('');
    } else if (type === 'sentences') {
      html = `<p>${Array.from({ length: count }, genSentence).join(' ')}</p>`;
    } else {
      // words: count × 15
      const words = Array.from({ length: count * 15 }, rWord);
      html = `<p>${cap(words.join(' '))}.</p>`;
    }
    $('#lorem-output').html(html);
  };

  $('#lorem-count').on('input', function() { $('#lorem-count-val').text($(this).val()); generateLorem(); });
  $('#lorem-type').on('change', generateLorem);
  $('#lorem-gen-btn').on('click', generateLorem);
  $('#lorem-copy-btn').on('click', function() {
    navigator.clipboard.writeText($('#lorem-output').text());
    $(this).text('Copied!');
    setTimeout(() => $(this).text('Copy'), 1500);
  });
  generateLorem();

  // ============================================================
  // STRING INSPECTOR
  // ============================================================
  const inspectString = () => {
    const text  = $('#inspect-input').val();
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const bytes = new TextEncoder().encode(text).length;

    $('#inspect-chars').text(text.length.toLocaleString());
    $('#inspect-no-spaces').text(text.replace(/\s/g, '').length.toLocaleString());
    $('#inspect-words').text(words.length.toLocaleString());
    $('#inspect-lines').text((text.split('\n').length).toLocaleString());
    $('#inspect-sentences').text((text.split(/[.!?]+\s+/).filter(Boolean).length).toLocaleString());
    $('#inspect-bytes').text(bytes.toLocaleString());
    $('#inspect-unique').text(new Set(text).size.toLocaleString());
    $('#inspect-avg-word').text(words.length ? (words.join('').length / words.length).toFixed(1) : '0');

    if (text) {
      const freq = {};
      for (const c of text) if (c.trim()) freq[c] = (freq[c] || 0) + 1;
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
      if (top) {
        const [ch, cnt] = top;
        const safeChar = ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch;
        $('#inspect-freq').removeClass('hidden').html(
          `Most frequent: <strong class="text-blue-300 font-mono">${safeChar}</strong> &mdash; appears <strong class="text-blue-300">${cnt}</strong> time${cnt !== 1 ? 's' : ''}`
        );
      }
    } else {
      $('#inspect-freq').addClass('hidden');
    }
  };
  $('#inspect-input').on('input', inspectString);

  // ============================================================
  // PASSWORD GENERATOR
  // ============================================================
  const generatePassword = () => {
    const length = parseInt($('#password-length').val());
    let charset = '';
    if ($('#pw-upper').is(':checked'))   charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if ($('#pw-lower').is(':checked'))   charset += 'abcdefghijklmnopqrstuvwxyz';
    if ($('#pw-numbers').is(':checked')) charset += '0123456789';
    if ($('#pw-symbols').is(':checked')) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    if ($('#pw-no-ambiguous').is(':checked')) charset = charset.replace(/[0Ol1IB8]/g, '');

    if (!charset) { $('#password-output').text('Select at least one character set'); return; }

    const arr = new Uint32Array(length);
    window.crypto.getRandomValues(arr);
    const pwd = Array.from(arr, n => charset[n % charset.length]).join('');
    $('#password-output').text(pwd);

    // Entropy-based strength
    const entropy = length * Math.log2(charset.length);
    const [label, color, width] = entropy < 40 ? ['Weak',        '#ef4444', '18%']
                                : entropy < 60 ? ['Fair',        '#f97316', '45%']
                                : entropy < 80 ? ['Strong',      '#22c55e', '72%']
                                :                ['Very Strong', '#10b981', '100%'];
    $('#password-strength-label').text(label).css('color', color);
    $('#password-strength-bar').css({ width, 'background-color': color });
  };

  $('#password-length').on('input', function() { $('#password-len-val').text($(this).val()); generatePassword(); });
  $('#pw-upper, #pw-lower, #pw-numbers, #pw-symbols, #pw-no-ambiguous').on('change', generatePassword);
  $('#password-gen').on('click', generatePassword);
  $('#password-copy').on('click', function() {
    const pwd = $('#password-output').text();
    if (!pwd || pwd === '—') return;
    navigator.clipboard.writeText(pwd);
    $(this).text('Copied!');
    setTimeout(() => $(this).text('Copy'), 1500);
  });
  generatePassword();

  // ============================================================
  // MARKDOWN PREVIEWER (via IPC → marked in main process)
  // ============================================================
  let mdDebounce = null;
  $('#markdown-input').on('input', function() {
    clearTimeout(mdDebounce);
    mdDebounce = setTimeout(async () => {
      const md = $(this).val();
      if (!md.trim()) { $('#markdown-preview').html(''); return; }
      try {
        const html = await window.api.renderMarkdown(md);
        $('#markdown-preview').html(html);
      } catch(e) { console.error('Markdown render error:', e); }
    }, 120);
  });

  // ============================================================
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

});
