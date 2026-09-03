/**
 * Scanner page logic.
 * Uses html5-qrcode library for camera-based QR scanning.
 * Also supports manual JWT token input for testing.
 */
(function () {
  'use strict';

  const startBtn = document.getElementById('start-scan');
  const stopBtn = document.getElementById('stop-scan');
  const scanAgainBtn = document.getElementById('scan-again');
  const resultDiv = document.getElementById('scan-result');
  const manualToken = document.getElementById('manual-token');
  const manualValidateBtn = document.getElementById('manual-validate');

  let html5QrCode = null;

  // Start camera scanner
  startBtn.addEventListener('click', function () {
    if (typeof Html5Qrcode === 'undefined') {
      showResult('error', 'QR scanner library not loaded. Check your internet connection.');
      return;
    }

    html5QrCode = new Html5Qrcode('qr-reader');

    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onScanSuccess,
      onScanFailure
    ).then(() => {
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
    }).catch(err => {
      console.error('Scanner start error:', err);
      showResult('error', 'Unable to access camera. Please allow camera permissions.');
    });
  });

  // Stop scanner
  stopBtn.addEventListener('click', stopScanner);

  // Scan again
  scanAgainBtn.addEventListener('click', function () {
    resultDiv.classList.add('hidden');
    scanAgainBtn.classList.add('hidden');
    startBtn.classList.remove('hidden');
    startBtn.click();
  });

  // Manual validation
  manualValidateBtn.addEventListener('click', function () {
    const token = manualToken.value.trim();
    if (!token) {
      showResult('error', 'Please enter a JWT token.');
      return;
    }
    validateTicket(token);
  });

  async function onScanSuccess(decodedText) {
    // Stop scanning after successful read
    await stopScanner();
    validateTicket(decodedText);
  }

  function onScanFailure(error) {
    // Ignore scan failures (happens continuously until QR is found)
  }

  async function stopScanner() {
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
      } catch (e) {
        // Ignore stop errors
      }
      stopBtn.classList.add('hidden');
    }
  }

  async function validateTicket(qrData) {
    showResult('loading', 'Validating ticket...');

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData })
      });

      const data = await response.json();

      if (data.valid) {
        showResult('success',
          `<h3>✓ VALID TICKET</h3>
           <p><strong>Student:</strong><br>${escapeHtml(data.name || '')}</p>
           <p><strong>Event:</strong><br>${escapeHtml(data.event_id || '')}</p>
           <div style="margin-top: 15px; font-weight: bold; color: #388e3c;">CHECK-IN SUCCESSFUL</div>`);
      } else {
        const isAlreadyUsed = data.message.includes('already been used');
        let html = `<h3>✕ ${isAlreadyUsed ? 'TICKET ALREADY USED' : 'INVALID TICKET'}</h3>
                    <p>${escapeHtml(data.message)}</p>`;
        
        if (data.name && isAlreadyUsed) {
            html += `<p style="margin-top: 10px;"><strong>Registered to:</strong> ${escapeHtml(data.name)}</p>`;
        }
        showResult('error', html);
      }
    } catch (err) {
      console.error('Validation error:', err);
      showResult('error', '<h3>✕ VALIDATION ERROR</h3><p>Network error. Please try again.</p>');
    }

    scanAgainBtn.classList.remove('hidden');
  }

  function showResult(type, content) {
    resultDiv.className = `scan-result scan-result-${type}`;
    resultDiv.innerHTML = content;
    resultDiv.classList.remove('hidden');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
