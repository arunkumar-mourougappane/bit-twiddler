  // --- Hash Generator Logic ---
  const $hashInput = $('#hash-input');
  const $hashMd5 = $('#hash-md5');
  const $hashSha1 = $('#hash-sha1');
  const $hashSha256 = $('#hash-sha256');
  const $hashSha512 = $('#hash-sha512');
  
  const $hashTabs = $('.hash-tab-btn');
  const $hashViews = $('.hash-view');
  const $hashFileInput = $('#hash-file-input');
  const $hashFileName = $('#hash-file-name');
  const $hashLiveIndicator = $('#hash-file-live-indicator');
  
  let currentHashMode = 'text';

  const clearHashes = () => {
       $hashMd5.val("d41d8cd98f00b204e9800998ecf8427e");
       $hashSha1.val("da39a3ee5e6b4b0d3255bfef95601890afd80709");
       $hashSha256.val("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
       $hashSha512.val("cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e");
  };

  const setHashes = (hashes) => {
      $hashMd5.val(hashes.md5);
      $hashSha1.val(hashes.sha1);
      $hashSha256.val(hashes.sha256);
      $hashSha512.val(hashes.sha512);
  };

  $hashTabs.on('click', function() {
      $hashTabs.removeClass('active text-blue-400 border-blue-500').addClass('text-gray-500 border-transparent hover:text-gray-300');
      $(this).addClass('active text-blue-400 border-blue-500').removeClass('text-gray-500 border-transparent hover:text-gray-300');
      
      $hashViews.addClass('hidden');
      const targetId = $(this).data('view');
      $('#' + targetId).removeClass('hidden');
      
      currentHashMode = targetId === 'hash-text-view' ? 'text' : 'file';
      
      if (currentHashMode === 'text') {
         window.api.stopFileWatch();
         $hashLiveIndicator.addClass('hidden');
         updateHashes();
      } else {
         if ($hashFileInput[0].files.length === 0) {
             clearHashes();
         } else {
             triggerFileHash(window.api.getPathForFile($hashFileInput[0].files[0]));
         }
      }
  });

  const updateHashes = async () => {
    if (currentHashMode !== 'text') return;
    const text = $hashInput.val();
    if (text === "") {
       clearHashes();
       return;
    }
    
    try {
      const hashes = await window.api.generateHashes(text);
      setHashes(hashes);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerFileHash = async (filePath) => {
     try {
       $hashLiveIndicator.removeClass('hidden text-green-400').addClass('text-blue-400');
       $hashLiveIndicator.html(`
           <svg class="animate-spin h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           <span class="uppercase tracking-widest text-[10px]">Calculating Secure Hashes...</span>
       `);

       const hashes = await window.api.hashFile(filePath);
       setHashes(hashes);
       
       $hashLiveIndicator.removeClass('text-blue-400').addClass('text-green-400');
       $hashLiveIndicator.html(`
               <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span class="uppercase tracking-widest text-[10px]">Calculation Complete! Live watch active</span>
       `);
     } catch (e) {
       console.error("File hash error", e);
       clearHashes();
       $hashLiveIndicator.addClass('hidden');
     }
  };

  $hashFileInput.on('change', function(e) {
      if (e.target.files.length > 0) {
         const file = e.target.files[0];
         $hashFileName.text(file.name);
         triggerFileHash(window.api.getPathForFile(file));
      } else {
         $hashFileName.text('');
         clearHashes();
         window.api.stopFileWatch();
         $hashLiveIndicator.addClass('hidden');
      }
  });

  window.api.onFileHashUpdate((newHashes) => {
      if (currentHashMode === 'file') {
         setHashes(newHashes);
         $hashLiveIndicator.removeClass('text-blue-400 hidden').addClass('text-green-400');
         $hashLiveIndicator.html(`
               <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span class="uppercase tracking-widest text-[10px]">File Modified! Updated Hashes Live</span>
         `);
      }
  });

  $hashInput.on('input', updateHashes);

  $('.copy-hash-btn').on('click', function() {
    const targetId = $(this).data('target');
    const $inputEl = $('#' + targetId);
    $inputEl.select();
    
    const hasSvgContext = $(this).find('svg').length > 0;
    copyToClipboard($inputEl.val(), hasSvgContext ? $(this) : $(this)); 
  });
