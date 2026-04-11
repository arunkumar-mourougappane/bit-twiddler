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