/**
 * Registration page logic.
 * Handles form validation and submission for event registration.
 */
(function () {
  'use strict';

  const form = document.getElementById('registration-form');
  const submitBtn = document.getElementById('submit-btn');
  const loading = document.getElementById('loading');
  const successMsg = document.getElementById('success-message');
  const errorMsg = document.getElementById('error-message');
  const errorDetail = document.getElementById('error-detail');
  const viewTicketLink = document.getElementById('view-ticket-link');

  // Error display elements
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const eventError = document.getElementById('event-error');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const event_id = document.getElementById('event_id').value;

    // Client-side validation (server also validates)
    let hasError = false;

    if (!name) {
      nameError.textContent = 'Name is required';
      hasError = true;
    }

    if (!email) {
      emailError.textContent = 'Email is required';
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = 'Please enter a valid email';
      hasError = true;
    }

    if (!event_id) {
      eventError.textContent = 'Please select an event';
      hasError = true;
    }

    if (hasError) return;

    // Show loading state
    showLoading(true);

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, event_id })
      });

      const data = await response.json();

      if (response.ok) {
        // Store ticket data for the ticket page
        sessionStorage.setItem('lastTicket', JSON.stringify(data.ticket));
        viewTicketLink.href = `ticket.html?id=${data.ticket.ticket_id}`;

        showSuccess();
      } else {
        showError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      showError('Network error. Please check your connection and try again.');
    } finally {
      showLoading(false);
    }
  });

  function clearErrors() {
    nameError.textContent = '';
    emailError.textContent = '';
    eventError.textContent = '';
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');
  }

  function showLoading(show) {
    loading.classList.toggle('hidden', !show);
    submitBtn.disabled = show;
    submitBtn.textContent = show ? 'Processing...' : 'Register & Get Ticket';
  }

  function showSuccess() {
    successMsg.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    form.reset();
  }

  function showError(message) {
    errorDetail.textContent = message;
    errorMsg.classList.remove('hidden');
    successMsg.classList.add('hidden');
  }
})();
