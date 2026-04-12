$(document).ready(function() {
  const $input = $('#url-input');
  const $output = $('#url-output');
  const $error = $('#url-error');
  
  let mode = 'encode'; // 'encode' or 'decode'

  const updateUI = () => {
    const isEncode = mode === 'encode';
    $('#url-mode-encode')
      .toggleClass('bg-blue-600 text-white shadow-sm', isEncode)
      .toggleClass('text-gray-500 hover:text-gray-300', !isEncode);
    
    $('#url-mode-decode')
      .toggleClass('bg-blue-600 text-white shadow-sm', !isEncode)
      .toggleClass('text-gray-500 hover:text-gray-300', isEncode);
    
    process();
  };

  const process = () => {
    const val = $input.val();
    if (!val) {
      $output.val('');
      $error.addClass('hidden');
      return;
    }

    try {
      if (mode === 'encode') {
        $output.val(encodeURIComponent(val));
      } else {
        $output.val(decodeURIComponent(val));
      }
      $error.addClass('hidden');
    } catch (e) {
      $error.removeClass('hidden').text(`Error: ${e.message}`);
      $output.val('');
    }
  };

  $('#url-mode-encode').on('click', () => {
    mode = 'encode';
    updateUI();
  });

  $('#url-mode-decode').on('click', () => {
    mode = 'decode';
    updateUI();
  });

  $input.on('input', process);

  $('#url-clear-btn').on('click', () => {
    $input.val('').focus();
    $output.val('');
    $error.addClass('hidden');
  });

  $('#url-copy-btn').on('click', function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });

  // Initialize
  updateUI();
});
