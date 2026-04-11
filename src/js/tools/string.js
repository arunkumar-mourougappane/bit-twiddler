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