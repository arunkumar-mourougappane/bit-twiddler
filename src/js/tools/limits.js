$(document).ready(function() {
  const types = [
    { name: 'uint8_t',  bits: 8,  min: '0', max: '255', hmax: '0xFF' },
    { name: 'int8_t',   bits: 8,  min: '-128', max: '127', hmax: '0x7F' },
    { name: 'uint16_t', bits: 16, min: '0', max: '65,535', hmax: '0xFFFF' },
    { name: 'int16_t',  bits: 16, min: '-32,768', max: '32,767', hmax: '0x7FFF' },
    { name: 'uint32_t', bits: 32, min: '0', max: '4,294,967,295', hmax: '0xFFFF FFFF' },
    { name: 'int32_t',  bits: 32, min: '-2,147,483,648', max: '2,147,483,647', hmax: '0x7FFF FFFF' },
    { name: 'uint64_t', bits: 64, min: '0', max: '18,446,744,073,709,551,615', hmax: '0xFFFF FFFF FFFF FFFF' },
    { name: 'int64_t',  bits: 64, min: '-9,223,372,036,854,775,808', max: '9,223,372,036,854,775,807', hmax: '0x7FFF FFFF FFFF FFFF' }
  ];

  const $body = $('#limits-table-body');

  const render = () => {
    $body.empty();
    types.forEach(t => {
      const isSigned = t.name.startsWith('i');
      const nameColor = isSigned ? 'text-amber-400' : 'text-blue-400';
      
      const row = `
        <tr class="hover:bg-white/5 transition-colors group cursor-copy" data-copy-max="${t.max.replace(/,/g, '')}">
           <td class="px-6 py-4 font-bold ${nameColor}">${t.name}</td>
           <td class="px-6 py-4 text-gray-500">${t.bits}</td>
           <td class="px-6 py-4 text-gray-300">${t.min}</td>
           <td class="px-6 py-4 text-gray-100">${t.max}</td>
           <td class="px-6 py-4 text-right text-emerald-400 font-bold opacity-80 group-hover:opacity-100">${t.hmax}</td>
        </tr>
      `;
      $body.append(row);
    });
  };

  $body.on('click', 'tr', function() {
    window.copyToClipboard($(this).data('copy-max'), $(this));
  });

  render();
});
