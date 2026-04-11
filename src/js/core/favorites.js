  // FAVORITES — pin tools to the top of the sidebar
  // ============================================================
  window.toolOrder = [...window.navTargets]; // capture DOM order before any reordering

  // Inject star buttons into every nav link dynamically
  window.$navLinks.each(function() {
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
    window.toolOrder.forEach(t => $(`a[data-target="${t}"]`).closest('li').appendTo($ul));

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
    if ($active.length) window.movePillTo($active.closest('li'));
  };

  applyFavoritesOrder(); // apply on load (restores persisted favorites)

  // ============================================================