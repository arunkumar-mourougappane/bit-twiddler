$(document).ready(function() {
  const $input = $('#naming-input');
  
  const toPascal = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const toLower = (str) => str.toLowerCase();

  const getSuggestions = (subject) => {
    if (!subject) return;
    const subj = toLower(subject);
    const Subj = toPascal(subj);
    
    // Booleans
    const bools = [
      `is${Subj}`, `has${Subj}`, `can${Subj}`, `should${Subj}`, 
      `is${Subj}Visible`, `is${Subj}Enabled`, `was${Subj}Modified`
    ];

    // Actions
    const actions = [
      `get${Subj}`, `set${Subj}`, `update${Subj}`, `delete${Subj}`, 
      `fetch${Subj}`, `handle${Subj}Change`, `validate${Subj}`
    ];

    // Collections
    const lists = [
      `${subj}List`, `${subj}Map`, `${subj}s`, `active${Subj}s`, 
      `filtered${Subj}s`, `${subj}Count`, `total${Subj}s`
    ];

    renderList('#naming-out-bool', bools, 'bg-violet-500/10 text-violet-300');
    renderList('#naming-out-action', actions, 'bg-emerald-500/10 text-emerald-300');
    renderList('#naming-out-list', lists, 'bg-amber-500/10 text-amber-300');
  };

  const renderList = (container, items, classes) => {
    const $c = $(container);
    $c.empty();
    items.forEach(item => {
      const el = `
        <div class="flex justify-between items-center group/item p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" data-copy="${item}">
           <span class="text-sm font-mono ${classes} px-2 py-1 rounded inline-block">${item}</span>
           <svg class="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
        </div>
      `;
      $c.append(el);
    });
  };

  $input.on('input', function() {
    getSuggestions($(this).val().trim());
  });

  $('.space-y-2').on('click', '[data-copy]', function() {
    window.copyToClipboard($(this).data('copy'), $(this));
  });

  // Initial
  $input.val('user');
  getSuggestions('user');
});
