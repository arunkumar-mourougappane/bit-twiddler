  // --- JWT Decoder Logic ---
  const $jwtInput = $('#jwt-input');
  const $jwtStatus = $('#jwt-status');
  const $jwtOutHeader = $('#jwt-output-header');
  const $jwtOutPayload = $('#jwt-output-payload');
  const $jwtOutSignature = $('#jwt-output-signature');
  const $jwtSearch = $('#jwt-search');
  const $jwtClearBtn = $('#jwt-clear-btn');

  $jwtClearBtn.on('click', function() {
      $jwtInput.val('').trigger('input');
      $jwtSearch.val('');
  });

  $jwtSearch.on('input', function() {
    const q = $(this).val();
    if(q) {
        $('#jwt-tree-view details').prop('open', true);
    }
  });

  $jwtSearch.on('keydown', function(e) {
    if(e.key === 'Enter') {
       e.preventDefault();
       const q = $(this).val();
       if(q) {
          window.find(q, false, false, true, false, true, false);
       }
    }
  });

  const decodeJWT = (token) => {
    const parts = token.split('.');
    if(parts.length !== 3) throw new Error("Invalid JWT Format: Must have 3 parts.");
    
    // Safely parse Base64Url string bounds
    const b64DecodeUnicode = str => {
       const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
       const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
       return decodeURIComponent(
         atob(padded).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
       );
    };

    return {
       header: JSON.parse(b64DecodeUnicode(parts[0])),
       payload: JSON.parse(b64DecodeUnicode(parts[1])),
       signature: parts[2]
    };
  };

  const updateJWTUI = () => {
    const raw = $jwtInput.val().trim();
    if (!raw) {
      $jwtStatus.text("Ready").removeClass('bg-red-500/20 text-red-400 bg-green-500/20 text-green-400').addClass('bg-gray-800 text-gray-500');
      $jwtOutHeader.html('');
      $jwtOutPayload.html('');
      $jwtOutSignature.text('');
      return;
    }

    try {
      const decoded = decodeJWT(raw);
      
      $jwtStatus.text("Valid Token").removeClass('bg-gray-800 text-gray-500 bg-red-500/20 text-red-400').addClass('bg-green-500/20 text-green-400');
      
      // Hook into our robust JSON formatting structures (null key wraps the root map)
      $jwtOutHeader.html(createTreeNode(null, decoded.header, true));
      $jwtOutPayload.html(createTreeNode(null, decoded.payload, true));
      $jwtOutSignature.text(decoded.signature);

    } catch (e) {
      $jwtStatus.text("Invalid Token").removeClass('bg-gray-800 text-gray-500 bg-green-500/20 text-green-400').addClass('bg-red-500/20 text-red-400');
      $jwtOutHeader.html('');
      $jwtOutPayload.html('');
      $jwtOutSignature.text('');
    }
  };

  $jwtInput.on('input', updateJWTUI);
