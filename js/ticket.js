/**
 * Ticket page logic.
 * Displays ticket details and QR code after registration.
 *
 * Data sources (in priority order):
 * 1. sessionStorage 'lastTicket' — set immediately after registration
 * 2. URL parameter ?id=TICKET_ID — fetches from GET /api/ticket/:id
 */
(function () {
  'use strict';

  const ticketLoading = document.getElementById('ticket-loading');
  const ticketContent = document.getElementById('ticket-content');
  const ticketError = document.getElementById('ticket-error');

  async function loadTicket() {
    // Try to load from sessionStorage first (just registered — has QR + token)
    const storedTicket = sessionStorage.getItem('lastTicket');

    if (storedTicket) {
      try {
        const ticket = JSON.parse(storedTicket);
        displayTicket(ticket);
        // Clear sessionStorage after displaying (one-time use)
        sessionStorage.removeItem('lastTicket');
        return;
      } catch (e) {
        console.error('Failed to parse stored ticket:', e);
      }
    }

    // Otherwise, fetch by ticket_id from URL
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get('id');

    if (!ticketId) {
      showError();
      return;
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/ticket/${ticketId}`);
      const data = await response.json();

      if (response.ok) {
        displayTicket(data);
      } else {
        showError();
      }
    } catch (err) {
      console.error('Error loading ticket:', err);
      showError();
    }
  }

  function displayTicket(ticket) {
    // Format event name for display (replace hyphens with spaces)
    const eventDisplay = (ticket.event_id || '').replace(/-/g, ' ');
    document.getElementById('ticket-event').textContent = eventDisplay;
    document.getElementById('ticket-name').textContent = ticket.name || '';
    document.getElementById('ticket-id').textContent = ticket.ticket_id || '';
    document.getElementById('ticket-date').textContent =
      ticket.created_at ? new Date(ticket.created_at).toLocaleString() : new Date().toLocaleString();

    // Display QR code
    const qrContainer = document.getElementById('qr-image-container');
    const qrImage = document.getElementById('qr-image');

    if (ticket.qr_code && ticket.qr_code.startsWith('data:image/png;base64,') &&
        ticket.qr_code.length > 100) {
      // Real QR code — display the image
      qrImage.src = ticket.qr_code;
      qrImage.alt = `QR Ticket: ${ticket.ticket_id}`;
      qrImage.style.display = 'block';
    } else {
      // No QR available (e.g., fetched via GET /ticket/:id which doesn't return QR)
      qrContainer.innerHTML =
        '<p class="qr-placeholder">QR code was sent to your email.<br>You can also screenshot it from the registration confirmation.</p>';
    }

    // Update status badge
    const statusBadge = document.getElementById('ticket-status');
    const status = (ticket.status || 'valid').toLowerCase();
    statusBadge.textContent = status.toUpperCase();
    statusBadge.className = `badge badge-${status === 'used' ? 'used' : 'valid'}`;

    ticketLoading.classList.add('hidden');
    ticketContent.classList.remove('hidden');
  }

  function showError() {
    ticketLoading.classList.add('hidden');
    ticketError.classList.remove('hidden');
  }

  // Load ticket on page ready
  loadTicket();
})();
