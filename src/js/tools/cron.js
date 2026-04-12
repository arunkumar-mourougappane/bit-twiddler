import cronstrue from 'cronstrue';

$(document).ready(function() {
  const $input = $('#cron-input');
  const $explanation = $('#cron-explanation');
  const $error = $('#cron-error');

  const examples = [
    '* * * * *',
    '*/15 * * * *',
    '0 0 * * *',
    '0 9-17 * * 1-5',
    '0 0 1 1 *',
    '30 18 * * 1-5',
    '45 23 * * 6',
    '0 0 * * 0'
  ];

  const process = () => {
    const val = $input.val().trim();
    if (!val) {
      $explanation.text('Enter an expression above to see the schedule...');
      $error.addClass('hidden');
      updateParts(['-', '-', '-', '-', '-']);
      return;
    }

    try {
      const parts = val.split(/\s+/);
      if (parts.length < 5) throw new Error("Incomplete expression");

      const desc = cronstrue.toString(val);
      $explanation.text(desc);
      $error.addClass('hidden');
      updateParts(parts);
    } catch (e) {
      $error.removeClass('hidden').text(`Error: ${e.message}`);
      $explanation.text('Waiting for a valid expression...');
      updateParts(['-', '-', '-', '-', '-']);
    }
  };

  const updateParts = (parts) => {
    $('#cron-part-min').text(parts[0] || '-');
    $('#cron-part-hour').text(parts[1] || '-');
    $('#cron-part-day').text(parts[2] || '-');
    $('#cron-part-month').text(parts[3] || '-');
    $('#cron-part-week').text(parts[4] || '-');
  };

  $input.on('input', process);

  $('#cron-example-btn').on('click', () => {
    const random = examples[Math.floor(Math.random() * examples.length)];
    $input.val(random);
    process();
  });

  // Initialize
  $input.val('0 9 * * 1-5');
  process();
});
