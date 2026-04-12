$(document).ready(function() {
  const $input = $('#pem-input');
  const $details = $('#pem-details');
  const $empty = $('#pem-empty-state');
  const $error = $('#pem-error');

  const process = () => {
    const val = $input.val().trim();
    if (!val) {
      $details.addClass('hidden');
      $empty.removeClass('hidden');
      $error.addClass('hidden');
      return;
    }

    // Basic PEM detection
    if (val.includes("-----BEGIN")) {
      const match = val.match(/-----BEGIN (.*)-----/);
      const type = match ? match[1] : "PEM Block";
      
      $details.removeClass('hidden');
      $empty.addClass('hidden');
      $error.addClass('hidden');

      $('#pem-out-subject').text("Detection logic for X.509 fields requires additional cryptography libraries. Type: " + type);
      $('#pem-out-issuer').text("-");
      $('#pem-out-start').text("-");
      $('#pem-out-end').text("-");
      $('#pem-out-serial').text("-");
      $('#pem-type-badge').text(type);
    } else {
      $error.removeClass('hidden').text("Not a valid PEM block (missing BEGIN/END markers)");
      $details.addClass('hidden');
      $empty.removeClass('hidden');
    }
  };

  $input.on('input', process);

  $('#pem-clear-btn').on('click', () => {
    $input.val('').focus();
    process();
  });
});
