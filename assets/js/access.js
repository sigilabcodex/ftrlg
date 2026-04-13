(() => {
  const ACCESS_CODE = 'ftrlg-prelim-2026';
  const STORAGE_KEYS = {
    granted: 'ftrlg_access_granted',
    name: 'ftrlg_participant_name'
  };

  const form = document.getElementById('access-form');
  const nameInput = document.getElementById('participant-name');
  const codeInput = document.getElementById('access-code');
  const feedback = document.getElementById('access-feedback');

  const setFeedback = (message, state = 'neutral') => {
    feedback.textContent = message;
    feedback.dataset.state = state;
  };

  if (sessionStorage.getItem(STORAGE_KEYS.granted) === 'true') {
    window.location.replace('portal.html');
    return;
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const participantName = nameInput.value.trim();
    const accessCode = codeInput.value.trim();

    if (!participantName || !accessCode) {
      setFeedback('Node unavailable: missing credential fields.', 'error');
      return;
    }

    if (accessCode === ACCESS_CODE) {
      sessionStorage.setItem(STORAGE_KEYS.granted, 'true');
      sessionStorage.setItem(STORAGE_KEYS.name, participantName);
      setFeedback('Credential accepted. Routing to dossier…', 'ok');
      window.setTimeout(() => {
        window.location.assign('portal.html');
      }, 320);
      return;
    }

    setFeedback('Authorization mismatch. Access denied.', 'error');
    codeInput.value = '';
    codeInput.focus();
  });
})();
