$(document).ready(function() {
  const $input = $('#case-input');
  
  const toWords = (str) => {
    // Handle camelCase, snake_case, kebab-case, and spaces
    return str
      .replace(/([A-Z])/g, ' $1') // Space before capitals
      .replace(/[_\-]/g, ' ')      // Underscores/hyphens to spaces
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);
  };

  const toCamel = (words) => {
    return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  };

  const toSnake = (words) => words.map(w => w.toLowerCase()).join('_');
  const toKebab = (words) => words.map(w => w.toLowerCase()).join('-');
  const toPascal = (words) => words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  const toConstant = (words) => words.map(w => w.toUpperCase()).join('_');
  const toSentence = (words) => {
    if (words.length === 0) return '';
    const s = words.join(' ').toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const convert = () => {
    const val = $input.val().trim();
    if (!val) {
       $('#out-camel, #out-snake, #out-kebab, #out-pascal, #out-constant, #out-sentence').text("");
       return;
    }
    const words = toWords(val);
    
    $('#out-camel').text(toCamel(words));
    $('#out-snake').text(toSnake(words));
    $('#out-kebab').text(toKebab(words));
    $('#out-pascal').text(toPascal(words));
    $('#out-constant').text(toConstant(words));
    $('#out-sentence').text(toSentence(words));
  };

  $input.on('input', convert);

  $('#case-clear-btn').on('click', () => {
    $input.val('').focus();
    convert();
  });

  $('.case-copy-btn').on('click', function() {
    const targetId = $(this).data('from');
    const text = $(`#${targetId}`).text();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
});
