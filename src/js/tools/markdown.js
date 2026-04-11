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