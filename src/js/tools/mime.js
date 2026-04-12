$(document).ready(function() {
  const mimeData = [
    { ext: '.html', type: 'text/html', category: 'Text' },
    { ext: '.css', type: 'text/css', category: 'Text' },
    { ext: '.js', type: 'text/javascript', category: 'Text' },
    { ext: '.json', type: 'application/json', category: 'Data' },
    { ext: '.xml', type: 'application/xml', category: 'Data' },
    { ext: '.png', type: 'image/png', category: 'Image' },
    { ext: '.jpg', type: 'image/jpeg', category: 'Image' },
    { ext: '.svg', type: 'image/svg+xml', category: 'Image' },
    { ext: '.webp', type: 'image/webp', category: 'Image' },
    { ext: '.pdf', type: 'application/pdf', category: 'Document' },
    { ext: '.zip', type: 'application/zip', category: 'Archive' },
    { ext: '.mp3', type: 'audio/mpeg', category: 'Audio' },
    { ext: '.mp4', type: 'video/mp4', category: 'Video' },
    { ext: '.csv', type: 'text/csv', category: 'Data' },
    { ext: '.yaml', type: 'application/x-yaml', category: 'Data' },
    { ext: '.txt', type: 'text/plain', category: 'Text' },
    { ext: '.wasm', type: 'application/wasm', category: 'Data' },
    { ext: '.woff2', type: 'font/woff2', category: 'Font' },
    { ext: '.ico', type: 'image/x-icon', category: 'Image' },
    { ext: '.gif', type: 'image/gif', category: 'Image' }
  ];

  const $input = $('#mime-search');
  const $results = $('#mime-results');
  const $empty = $('#mime-empty');

  const render = (search = '') => {
    $results.empty();
    const query = search.toLowerCase().replace(/^\./, '');
    
    const filtered = mimeData.filter(m => 
      m.ext.toLowerCase().includes(query) || 
      m.type.toLowerCase().includes(query) || 
      m.category.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      $empty.removeClass('hidden');
    } else {
      $empty.addClass('hidden');
      filtered.forEach(m => {
        const card = `
          <div class="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm group hover:border-indigo-500/30 transition-all flex justify-between items-center">
             <div>
                <span class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">${m.category}</span>
                <span class="text-lg font-mono text-indigo-300">${m.ext}</span>
                <span class="block text-sm text-gray-400 mt-1 font-mono">${m.type}</span>
             </div>
             <button class="copy-mime p-2 text-gray-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" data-type="${m.type}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
             </button>
          </div>
        `;
        $results.append(card);
      });
    }
  };

  $input.on('input', function() {
    render($(this).val());
  });

  $results.on('click', '.copy-mime', function() {
    window.copyToClipboard($(this).data('type'), $(this));
  });

  // Initial render
  render();
});
