(() => {
  const config = window.FTRLG_CONFIG;
  const fallbackStorageKeys = {
    granted: 'ftrlg_access_granted',
    name: 'ftrlg_participant_name'
  };

  const storageKeys = config?.storageKeys ?? fallbackStorageKeys;
  const routes = config?.routes ?? { portal: 'portal.html' };
  const accessCode = config?.access?.code ?? '';
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

  if (sessionStorage.getItem(storageKeys.granted) === 'true') {
    window.location.replace(routes.portal);
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const participantName = nameInput.value.trim();
    const submittedCode = codeInput.value.trim();

    if (!participantName || !submittedCode) {
      setFeedback('Node unavailable: both credential fields are required.', 'error');
      return;
    }

    if (!accessCode) {
      setFeedback('Node configuration fault. Access channel unavailable.', 'error');
      return;
    }

    if (submittedCode === accessCode) {
      sessionStorage.setItem(storageKeys.granted, 'true');
      sessionStorage.setItem(storageKeys.name, participantName);
      setFeedback('Credential pair accepted. Routing to dossier…', 'ok');
      window.setTimeout(() => {
        window.location.assign(routes.portal);
      }, redirectDelayMs);
      return;
    }

    setFeedback('Authorization mismatch. Access denied.', 'error');
    codeInput.value = '';
    codeInput.focus();
  });
})();
