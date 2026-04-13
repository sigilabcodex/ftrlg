(() => {
  const config = window.FTRLG_CONFIG;
  const fallbackStorageKeys = {
    granted: 'ftrlg_access_granted',
    name: 'ftrlg_participant_name',
    pendingCode: 'ftrlg_pending_code'
  };

  const storageKeys = config?.storageKeys ?? fallbackStorageKeys;
  const routes = config?.routes ?? { portal: 'portal.html' };
  const redirectDelayMs = config?.access?.redirectDelayMs ?? 320;

  const form = document.getElementById('access-form');
  const nameInput = document.getElementById('participant-name');
  const codeInput = document.getElementById('access-code');
  const feedback = document.getElementById('access-feedback');

  if (!form || !nameInput || !codeInput || !feedback) {
    return;
  }

  const setFeedback = (message, state = 'neutral') => {
    feedback.textContent = message;
    feedback.dataset.state = state;
  };

  const storedName = sessionStorage.getItem(storageKeys.name);
  if (storedName) {
    nameInput.value = storedName;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const participantName = nameInput.value.trim();
    const submittedCode = codeInput.value.trim();

    if (!participantName || !submittedCode) {
      setFeedback('Node unavailable: both credential fields are required.', 'error');
      return;
    }

    window.dispatchEvent(new CustomEvent('ftrlg:access-submit'));

    sessionStorage.setItem(storageKeys.name, participantName);
    sessionStorage.setItem(storageKeys.pendingCode, submittedCode);
    sessionStorage.removeItem(storageKeys.granted);

    setFeedback('Credential pair accepted. Routing to dossier…', 'ok');
    window.setTimeout(() => {
      window.location.assign(routes.portal);
    }, redirectDelayMs);
  });
})();
