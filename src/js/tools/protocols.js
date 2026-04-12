$(document).ready(function() {
  const protocols = [
    {
      name: 'I2C (Inter-Integrated Circuit)',
      lines: ['SDA (Data)', 'SCL (Clock)', 'GND', 'VCC'],
      desc: 'Synchronous, multi-master, multi-slave, packet switched, single-ended, serial communication bus.',
      speed: '100kbps (Std), 400kbps (Fast), 3.4Mbps (High)',
      color: 'blue'
    },
    {
      name: 'SPI (Serial Peripheral Interface)',
      lines: ['MOSI (Master Out)', 'MISO (Master In)', 'SCK (Clock)', 'SS/CS (Select)'],
      desc: 'Full duplex synchronous serial communication interface used for short distance communication.',
      speed: 'Commonly 1MHz to 100MHz+',
      color: 'emerald'
    },
    {
      name: 'UART (Universal Asynchronous)',
      lines: ['TX (Transmit)', 'RX (Receive)', 'GND'],
      desc: 'Asynchronous serial communication in which the data format and transmission speeds are configurable.',
      speed: 'Commonly 9600 to 115200 (up to 4Mbps+)',
      color: 'amber'
    },
    {
      name: 'JTAG (Joint Test Action Group)',
      lines: ['TMS', 'TCK', 'TDI', 'TDO', 'TRST (optional)'],
      desc: 'Standard for verifying designs and testing printed circuit boards after manufacture.',
      speed: 'Depends on debugger (100kHz to 50MHz)',
      color: 'rose'
    },
    {
      name: 'SWD (Serial Wire Debug)',
      lines: ['SWDIO (Data I/O)', 'SWCLK (Clock)', 'GND'],
      desc: 'Alternative to JTAG for ARM processors, using fewer pins.',
      speed: 'Up to 50MHz+',
      color: 'violet'
    },
    {
      name: 'CAN Bus (Controller Area Network)',
      lines: ['CAN High', 'CAN Low', 'GND (Optional)'],
      desc: 'Robust vehicle bus standard optimized for microcontrollers to communicate without a host computer.',
      speed: 'Up to 1Mbps (CAN), 5Mbps+ (CAN-FD)',
      color: 'indigo'
    }
  ];

  const $grid = $('#prot-grid');
  const $search = $('#prot-search');

  const render = (query = '') => {
    $grid.empty();
    const q = query.toLowerCase();
    
    const filtered = protocols.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.desc.toLowerCase().includes(q) ||
      p.lines.some(l => l.toLowerCase().includes(q))
    );

    filtered.forEach(p => {
      const card = `
        <div class="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm hover:border-${p.color}-500/30 transition-all shadow-lg group">
           <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-${p.color}-500/10 flex items-center justify-center border border-${p.color}-500/20">
                 <span class="text-${p.color}-400 font-bold text-xs">${p.name.substring(0, 1)}</span>
              </div>
              <h4 class="text-sm font-bold text-gray-100">${p.name}</h4>
           </div>
           
           <div class="space-y-3">
              <div>
                 <span class="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Pinout / Lines</span>
                 <div class="flex flex-wrap gap-1">
                    ${p.lines.map(l => `<span class="px-2 py-0.5 bg-gray-900 border border-gray-700 rounded text-[10px] text-gray-400 font-mono">${l}</span>`).join('')}
                 </div>
              </div>
              <div>
                 <span class="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Description</span>
                 <p class="text-[10px] text-gray-500 leading-relaxed">${p.desc}</p>
              </div>
              <div class="pt-2 border-t border-gray-700/30 flex justify-between items-center">
                 <span class="text-[9px] font-bold text-${p.color}-400/70 uppercase">Max Speed</span>
                 <span class="text-[9px] text-gray-400 font-mono">${p.speed}</span>
              </div>
           </div>
        </div>
      `;
      $grid.append(card);
    });
  };

  $search.on('input', function() {
    render($(this).val());
  });

  // Initial
  render();
});
