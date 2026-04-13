(() => {
  const STORAGE_KEYS = {
    granted: 'ftrlg_access_granted',
    name: 'ftrlg_participant_name'
  };

  const isGranted = sessionStorage.getItem(STORAGE_KEYS.granted) === 'true';
  if (!isGranted) {
    window.location.replace('index.html');
    return;
  }

  const greeting = document.getElementById('visitor-greeting');
  const payloadSlot = document.getElementById('payload-content');
  const exitButton = document.getElementById('exit-node');

  const participantName = sessionStorage.getItem(STORAGE_KEYS.name) || 'participant';
  greeting.textContent = `Welcome, ${participantName}. Your circulation status is verified.`;

  const decodePayload = (encoded, shift) => {
    const transformed = atob(encoded)
      .split('')
      .map((char) => String.fromCharCode(char.charCodeAt(0) ^ shift))
      .join('');

    return transformed;
  };

  try {
    const payload = window.FTRLG_PAYLOAD;
    if (!payload?.encoded || typeof payload?.shift !== 'number') {
      throw new Error('payload missing');
    }

    payloadSlot.innerHTML = decodePayload(payload.encoded, payload.shift);
  } catch (error) {
    payloadSlot.innerHTML = '<p>Node integrity fault. Dossier payload unavailable.</p>';
  }

  exitButton?.addEventListener('click', () => {
    sessionStorage.removeItem(STORAGE_KEYS.granted);
    sessionStorage.removeItem(STORAGE_KEYS.name);
    window.location.assign('index.html');
  });
})();
