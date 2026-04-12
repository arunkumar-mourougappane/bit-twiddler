$(document).ready(function() {
  const codes = [
    { code: 200, title: 'OK', desc: 'Standard response for successful HTTP requests.' },
    { code: 201, title: 'Created', desc: 'The request has been fulfilled, resulting in the creation of a new resource.' },
    { code: 202, title: 'Accepted', desc: 'The request has been accepted for processing, but the processing has not been completed.' },
    { code: 204, title: 'No Content', desc: 'The server successfully processed the request and is not returning any content.' },
    { code: 301, title: 'Moved Permanently', desc: 'This and all future requests should be directed to the given URI.' },
    { code: 302, title: 'Found', desc: 'Common way of performing redirection.' },
    { code: 304, title: 'Not Modified', desc: 'Indicates that the resource has not been modified since the version specified by the request headers.' },
    { code: 400, title: 'Bad Request', desc: 'The server cannot or will not process the request due to an apparent client error.' },
    { code: 401, title: 'Unauthorized', desc: 'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.' },
    { code: 403, title: 'Forbidden', desc: 'The request was valid, but the server is refusing action.' },
    { code: 404, title: 'Not Found', desc: 'The requested resource could not be found but may be available in the future.' },
    { code: 405, title: 'Method Not Allowed', desc: 'A request method is not supported for the requested resource.' },
    { code: 408, title: 'Request Timeout', desc: 'The server timed out waiting for the request.' },
    { code: 409, title: 'Conflict', desc: 'Indicates that the request could not be processed because of conflict in the current state of the resource.' },
    { code: 418, title: "I'm a teapot", desc: 'The HTTP 418 I\'m a teapot client error response code indicates that the server refuses to brew coffee because it is, permanently, a teapot.' },
    { code: 422, title: 'Unprocessable Entity', desc: 'The request was well-formed but was unable to be followed due to semantic errors.' },
    { code: 429, title: 'Too Many Requests', desc: 'The user has sent too many requests in a given amount of time.' },
    { code: 500, title: 'Internal Server Error', desc: 'A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.' },
    { code: 501, title: 'Not Implemented', desc: 'The server either does not recognize the request method, or it lacks the ability to fulfil the request.' },
    { code: 502, title: 'Bad Gateway', desc: 'The server was acting as a gateway or proxy and received an invalid response from the upstream server.' },
    { code: 503, title: 'Service Unavailable', desc: 'The server cannot handle the request (because it is overloaded or down for maintenance).' },
    { code: 504, title: 'Gateway Timeout', desc: 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.' }
  ];

  const $grid = $('#http-grid');
  const $search = $('#http-search');

  const render = (filterText = '', category = 'all') => {
    $grid.empty();
    
    const filtered = codes.filter(c => {
      const matchText = (c.code.toString() + c.title + c.desc).toLowerCase().includes(filterText.toLowerCase());
      const matchCategory = category === 'all' || c.code.toString().startsWith(category);
      return matchText && matchCategory;
    });

    filtered.forEach(c => {
      const colorClass = c.code < 300 ? 'text-emerald-400' : 
                         c.code < 400 ? 'text-blue-400' : 
                         c.code < 500 ? 'text-amber-400' : 'text-rose-400';
      
      const shadowClass = c.code < 300 ? 'shadow-emerald-500/10' : 
                          c.code < 400 ? 'shadow-blue-500/10' : 
                          c.code < 500 ? 'shadow-amber-500/10' : 'shadow-rose-500/10';

      const card = `
        <div class="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm hover:border-blue-500/30 transition-all shadow-lg ${shadowClass} group">
          <div class="flex justify-between items-start mb-3">
             <span class="text-3xl font-bold font-mono ${colorClass}">${c.code}</span>
             <button class="copy-code text-gray-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" data-code="${c.code}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
             </button>
          </div>
          <h4 class="text-sm font-bold text-gray-100 mb-2 uppercase tracking-wide">${c.title}</h4>
          <p class="text-xs text-gray-500 leading-relaxed">${c.desc}</p>
        </div>
      `;
      $grid.append(card);
    });
  };

  $search.on('input', function() {
    render($(this).val(), $('.http-filter-btn.bg-blue-600').data('filter'));
  });

  $('.http-filter-btn').on('click', function() {
    $('.http-filter-btn').removeClass('bg-blue-600 text-white shadow-sm').addClass('text-gray-500 hover:text-gray-300');
    $(this).addClass('bg-blue-600 text-white shadow-sm').removeClass('text-gray-500 hover:text-gray-300');
    render($search.val(), $(this).data('filter'));
  });

  $grid.on('click', '.copy-code', function() {
    window.copyToClipboard($(this).data('code').toString(), $(this));
  });

  // Initial render
  render();
});
