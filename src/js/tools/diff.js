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

  const createUnifiedPatch = (diffArray, oldLines, newLines) => {
    let patch = `--- original\n+++ modified\n`;
    patch += `@@ -1,${oldLines.length} +1,${newLines.length} @@\n`;
    
    diffArray.forEach(part => {
      if (part.type === 'added')   patch += `+${part.value}\n`;
      else if (part.type === 'removed') patch += `-${part.value}\n`;
      else patch += ` ${part.value}\n`;
    });
    return patch;
  };

  const runDiff = () => {
    const orig = $('#diff-original').val();
    const mod  = $('#diff-modified').val();
    const $copyBtn = $('#diff-copy-patch');

    if (!orig && !mod) {
      $('#diff-output').html('<div class="p-4 text-gray-600 italic">Paste text in both fields above to see the diff...</div>');
      $('#diff-stats').html('');
      $copyBtn.addClass('hidden');
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

    const hasChanges = added > 0 || removed > 0;
    if (hasChanges) {
      $copyBtn.removeClass('hidden');
    } else {
      $copyBtn.addClass('hidden');
    }

    const stats = [
      added   ? `<span class="text-green-400">+${added} added</span>` : '',
      removed ? `<span class="text-red-400">-${removed} removed</span>` : '',
      (!added && !removed) ? '<span class="text-gray-500">Identical</span>' : ''
    ].filter(Boolean).join('');
    $('#diff-stats').html(stats);
  };

  $('#diff-original, #diff-modified').on('input', runDiff);

  $('#diff-copy-patch').on('click', function() {
    const orig = $('#diff-original').val();
    const mod  = $('#diff-modified').val();
    const diff = computeLineDiff(orig, mod);
    const patch = createUnifiedPatch(diff, orig.split('\n'), mod.split('\n'));
    
    window.copyToClipboard(patch, $(this));
  });

  // ============================================================