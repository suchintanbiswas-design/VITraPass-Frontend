/**
 * Admin dashboard logic.
 * Fetches and displays event statistics.
 */
(function () {
  'use strict';

  const eventSelect = document.getElementById('dashboard-event');
  const refreshBtn = document.getElementById('refresh-stats');
  const statsSection = document.getElementById('stats-section');
  const statsError = document.getElementById('stats-error');

  refreshBtn.addEventListener('click', loadStats);

  async function loadStats() {
    const eventId = eventSelect.value;

    if (!eventId) {
      alert('Please select an event.');
      return;
    }

    statsSection.classList.add('hidden');
    statsError.classList.add('hidden');

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/event/${eventId}/stats`);
      const data = await response.json();

      if (response.ok) {
        displayStats(eventId, data);
      } else {
        showError(data.error || 'Failed to load statistics.');
      }
    } catch (err) {
      console.error('Stats error:', err);
      showError('Network error. Please check your connection.');
    }
  }

  function displayStats(eventId, stats) {
    document.getElementById('stats-event-name').textContent = eventId.replace(/-/g, ' ');
    document.getElementById('stat-registered').textContent = stats.registered;
    document.getElementById('stat-checkedin').textContent = stats.checked_in;
    document.getElementById('stat-remaining').textContent = stats.remaining;
    document.getElementById('stat-rate').textContent = stats.checkin_rate + '%';

    // Update progress bar
    const progressFill = document.getElementById('progress-fill');
    const progressLabel = document.getElementById('progress-label');
    progressFill.style.width = stats.checkin_rate + '%';
    progressLabel.textContent = stats.checkin_rate + '% checked in';

    statsSection.classList.remove('hidden');
    statsError.classList.add('hidden');
  }

  function showError(message) {
    document.getElementById('stats-error-detail').textContent = message;
    statsError.classList.remove('hidden');
    statsSection.classList.add('hidden');
  }
})();
