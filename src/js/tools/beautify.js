$(document).ready(function() {
  const $input = $('#beautify-input');
  const $output = $('#beautify-output');

  const beautifyHtml = (html) => {
    let tab = '  ';
    let result = '';
    let indent = '';

    html.split(/>\s*</).forEach(function(element) {
      if (element.match(/^\/\w/)) {
        indent = indent.substring(tab.length);
      }

      result += indent + '<' + element + '>\r\n';

      if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith("input") && !element.startsWith("img") && !element.startsWith("br") && !element.startsWith("hr")) {
        indent += tab;
      }
    });

    return result.substring(1, result.length - 3);
  };

  const process = () => {
    const val = $input.val().trim();
    if (!val) {
      $output.val('');
      return;
    }

    // Clean up input: remove existing whitespace between tags
    const clean = val.replace(/>\s+</g, '><');
    try {
      $output.val(beautifyHtml(clean));
    } catch (e) {
      $output.val(val); // Fallback to raw if fail
    }
  };

  $input.on('input', process);

  $('#beautify-clear-btn').on('click', () => {
    $input.val('').focus();
    $output.val('');
  });

  $('#beautify-copy-btn').on('click', function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });
});
