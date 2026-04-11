  // PASSWORD GENERATOR
  // ============================================================
  const generatePassword = () => {
    const length = parseInt($('#password-length').val());
    let charset = '';
    if ($('#pw-upper').is(':checked'))   charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if ($('#pw-lower').is(':checked'))   charset += 'abcdefghijklmnopqrstuvwxyz';
    if ($('#pw-numbers').is(':checked')) charset += '0123456789';
    if ($('#pw-symbols').is(':checked')) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    if ($('#pw-no-ambiguous').is(':checked')) charset = charset.replace(/[0Ol1IB8]/g, '');

    if (!charset) { $('#password-output').text('Select at least one character set'); return; }

    const arr = new Uint32Array(length);
    window.crypto.getRandomValues(arr);
    const pwd = Array.from(arr, n => charset[n % charset.length]).join('');
    $('#password-output').text(pwd);

    // Entropy-based strength
    const entropy = length * Math.log2(charset.length);
    const [label, color, width] = entropy < 40 ? ['Weak',        '#ef4444', '18%']
                                : entropy < 60 ? ['Fair',        '#f97316', '45%']
                                : entropy < 80 ? ['Strong',      '#22c55e', '72%']
                                :                ['Very Strong', '#10b981', '100%'];
    $('#password-strength-label').text(label).css('color', color);
    $('#password-strength-bar').css({ width, 'background-color': color });
  };

  $('#password-length').on('input', function() { $('#password-len-val').text($(this).val()); generatePassword(); });
  $('#pw-upper, #pw-lower, #pw-numbers, #pw-symbols, #pw-no-ambiguous').on('change', generatePassword);
  $('#password-gen').on('click', generatePassword);
  $('#password-copy').on('click', function() {
    const pwd = $('#password-output').text();
    if (!pwd || pwd === '—') return;
    navigator.clipboard.writeText(pwd);
    $(this).text('Copied!');
    setTimeout(() => $(this).text('Copy'), 1500);
  });
  generatePassword();

  // ============================================================