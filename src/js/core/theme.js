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
