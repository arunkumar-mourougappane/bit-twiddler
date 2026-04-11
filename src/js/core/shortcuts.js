  // KEYBOARD SHORTCUTS — Cmd/Ctrl + 1–9 to jump to tools
  // ============================================================
  window.navTargets = window.$navLinks.map(function() { return $(this).data('target'); }).get();

  $(document).on('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9 && num <= window.navTargets.length) {
        e.preventDefault();
        window.updateActiveNav(window.navTargets[num - 1]);
      }
    }
  });

  // ============================================================