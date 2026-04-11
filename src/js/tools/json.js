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
