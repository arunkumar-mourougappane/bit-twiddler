$(document).ready(function() {
  const $input = $('#transform-input');
  const $output = $('#transform-output');
  const $lineCount = $('#transform-line-count');
  const $wordCount = $('#transform-word-count');
  const $charCount = $('#transform-char-count');

  const updateStats = (text) => {
    const lines = text ? text.split('\n').length : 0;
    const words = text ? text.trim().split(/\s+/).filter(w => w).length : 0;
    const chars = text ? text.length : 0;
    
    $lineCount.text(lines);
    $wordCount.text(words);
    $charCount.text(chars);
  };

  const getLines = () => $input.val().split('\n');

  const setOutput = (lines) => {
    const result = lines.join('\n');
    $output.val(result);
    updateStats(result);
  };

  $('#transform-sort-asc').on('click', () => {
    setOutput(getLines().sort((a, b) => a.localeCompare(b)));
  });

  $('#transform-sort-desc').on('click', () => {
    setOutput(getLines().sort((a, b) => b.localeCompare(a)));
  });

  $('#transform-unique').on('click', () => {
    setOutput([...new Set(getLines())]);
  });

  $('#transform-reverse').on('click', () => {
    setOutput(getLines().reverse());
  });

  $('#transform-trim').on('click', () => {
    setOutput(getLines().map(l => l.trim()));
  });

  $('#transform-apply-fix').on('click', () => {
    const prefix = $('#transform-prefix').val();
    const suffix = $('#transform-suffix').val();
    setOutput(getLines().map(l => prefix + l + suffix));
  });

  $input.on('input', () => {
    const val = $input.val();
    $output.val(val); // By default show current
    updateStats(val);
  });

  $('#transform-clear-btn').on('click', () => {
    $input.val('').focus();
    $output.val('');
    updateStats('');
  });

  $('#transform-copy-btn').on('click', function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
});
