(() => {
  const config = window.FTRLG_CONFIG;
  const fallbackStorageKeys = {
    granted: 'ftrlg_access_granted',
    name: 'ftrlg_participant_name'
  };

  const storageKeys = config?.storageKeys ?? fallbackStorageKeys;
  const routes = config?.routes ?? { access: 'index.html' };

  const greeting = document.getElementById('visitor-greeting');
  const payloadSlot = document.getElementById('payload-content');
  const exitButton = document.getElementById('exit-node');

  const isGranted = sessionStorage.getItem(storageKeys.granted) === 'true';
  if (!isGranted) {
    window.location.replace(routes.access);
    return;
  }

  if (!greeting || !payloadSlot || !exitButton) {
    return;
  }

  const participantName = sessionStorage.getItem(storageKeys.name) || 'participant';
  greeting.textContent = `Welcome, ${participantName}. Your circulation status is verified.`;

  const decodePayload = (encoded, shift) =>
    atob(encoded)
      .split('')
      .map((char) => String.fromCharCode(char.charCodeAt(0) ^ shift))
      .join('');

  try {
    const payload = window.FTRLG_PAYLOAD;
    if (!payload?.encoded || typeof payload?.shift !== 'number') {
      throw new Error('payload missing');
    }

    payloadSlot.innerHTML = decodePayload(payload.encoded, payload.shift);
    payloadSlot.setAttribute('aria-busy', 'false');
  } catch (error) {
    payloadSlot.innerHTML = '<p>Node integrity fault. Dossier payload unavailable.</p>';
    payloadSlot.setAttribute('aria-busy', 'false');
  }

  exitButton.addEventListener('click', () => {
    sessionStorage.removeItem(storageKeys.granted);
    sessionStorage.removeItem(storageKeys.name);
    window.location.assign(routes.access);
  });
})();
