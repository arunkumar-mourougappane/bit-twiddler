$(document).ready(function() {
  const $input = $('#entities-input');
  const $output = $('#entities-output');
  
  let mode = 'encode'; // 'encode' or 'decode'

  const encodeEntities = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const decodeEntities = (str) => {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.textContent;
  };

  const updateUI = () => {
    const isEncode = mode === 'encode';
    $('#entities-mode-encode')
      .toggleClass('bg-blue-600 text-white shadow-sm', isEncode)
      .toggleClass('text-gray-500 hover:text-gray-300', !isEncode);
    
    $('#entities-mode-decode')
      .toggleClass('bg-blue-600 text-white shadow-sm', !isEncode)
      .toggleClass('text-gray-500 hover:text-gray-300', isEncode);
    
    process();
  };

  const process = () => {
    const val = $input.val();
    if (!val) {
      $output.val('');
      return;
    }

    if (mode === 'encode') {
      $output.val(encodeEntities(val));
    } else {
      $output.val(decodeEntities(val));
    }
  };

  $('#entities-mode-encode').on('click', () => {
    mode = 'encode';
    updateUI();
  });

  $('#entities-mode-decode').on('click', () => {
    mode = 'decode';
    updateUI();
  });

  $input.on('input', process);

  $('#entities-clear-btn').on('click', () => {
    $input.val('').focus();
    $output.val('');
  });

  $('#entities-copy-btn').on('click', function() {
    const text = $output.val();
    if (text) {
      window.copyToClipboard(text, $(this));
    }
  });

  // Initialize
  updateUI();
});
