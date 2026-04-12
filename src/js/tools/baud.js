$(document).ready(function() {
  const commonBauds = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];
  const $clock = $('#baud-clock');
  const $preset = $('#baud-preset');
  const $tableBody = $('#baud-table-body');
  
  let currentOS = 16;

  const calculate = () => {
    const clock = parseFloat($clock.val());
    if (isNaN(clock) || clock <= 0) return;

    $tableBody.empty();

    commonBauds.forEach(target => {
      // Logic for fractional/integer dividers depends on MCU, 
      // but standard approach is: Divider = Clock / (OS * Target)
      const idealDivider = clock / (currentOS * target);
      const actualDivider = Math.round(idealDivider);
      
      if (actualDivider <= 0) {
        $tableBody.append(`<tr><td class="px-6 py-4 text-emerald-400 font-bold">${target}</td><td colspan="4" class="px-6 py-4 text-gray-700 italic">Clock too slow</td></tr>`);
        return;
      }

      const actualBaud = clock / (currentOS * actualDivider);
      const error = ((actualBaud - target) / target) * 100;
      
      const errorClass = Math.abs(error) > 2 ? 'text-rose-400 font-bold' : 
                         Math.abs(error) > 1 ? 'text-amber-400' : 'text-emerald-400';

      const row = `
        <tr class="hover:bg-white/5 transition-colors">
           <td class="px-6 py-4 text-emerald-400 font-bold">${target.toLocaleString()}</td>
           <td class="px-6 py-4 text-gray-500">${idealDivider.toFixed(3)}</td>
           <td class="px-6 py-4 text-gray-300 font-bold">${actualDivider}</td>
           <td class="px-6 py-4 text-gray-400">${Math.round(actualBaud).toLocaleString()}</td>
           <td class="px-6 py-4 text-right ${errorClass}">${error.toFixed(2)}%</td>
        </tr>
      `;
      $tableBody.append(row);
    });
  };

  $clock.on('input', calculate);
  
  $preset.on('change', function() {
    const val = $(this).val();
    if (val !== 'custom') {
      $clock.val(val);
      calculate();
    }
  });

  $('.baud-os-btn').on('click', function() {
    $('.baud-os-btn').removeClass('bg-blue-600 text-white').addClass('text-gray-500 hover:text-gray-300');
    $(this).addClass('bg-blue-600 text-white').removeClass('text-gray-500 hover:text-gray-300');
    currentOS = parseInt($(this).data('os'));
    calculate();
  });

  // Init
  calculate();
});
