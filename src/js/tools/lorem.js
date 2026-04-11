  // LOREM IPSUM GENERATOR
  // ============================================================
  const LOREM = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat','cupidatat','non','proident','sunt','culpa','qui','officia','deserunt','mollit','anim','id','est','laborum'];
  const rWord = () => LOREM[Math.floor(Math.random() * LOREM.length)];
  const cap   = (s) => s[0].toUpperCase() + s.slice(1);

  const genSentence = () => {
    const n = Math.floor(Math.random() * 10) + 6;
    const words = Array.from({ length: n }, rWord);
    if (n > 8 && Math.random() > 0.5) words[Math.floor(n * 0.4)] += ',';
    return cap(words.join(' ')) + '.';
  };
  const genParagraph = () => Array.from({ length: Math.floor(Math.random() * 3) + 4 }, genSentence).join(' ');

  const generateLorem = () => {
    const count = parseInt($('#lorem-count').val());
    const type  = $('#lorem-type').val();
    let html = '';
    if (type === 'paragraphs') {
      html = Array.from({ length: count }, (_, i) => {
        const p = i === 0
          ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' + Array.from({ length: 3 }, genSentence).join(' ')
          : genParagraph();
        return `<p>${p}</p>`;
      }).join('');
    } else if (type === 'sentences') {
      html = `<p>${Array.from({ length: count }, genSentence).join(' ')}</p>`;
    } else {
      // words: count × 15
      const words = Array.from({ length: count * 15 }, rWord);
      html = `<p>${cap(words.join(' '))}.</p>`;
    }
    $('#lorem-output').html(html);
  };

  $('#lorem-count').on('input', function() { $('#lorem-count-val').text($(this).val()); generateLorem(); });
  $('#lorem-type').on('change', generateLorem);
  $('#lorem-gen-btn').on('click', generateLorem);
  $('#lorem-copy-btn').on('click', function() {
    navigator.clipboard.writeText($('#lorem-output').text());
    $(this).text('Copied!');
    setTimeout(() => $(this).text('Copy'), 1500);
  });
  generateLorem();

  // ============================================================