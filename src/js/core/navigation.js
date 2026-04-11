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

  window.updateActiveNav = (targetId) => {
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
    window.updateActiveNav($this.data('target'));
  });

  // Initialize: animate default section and position pill on Base64
  window.updateActiveNav('base64-tool');

  // ============================================================