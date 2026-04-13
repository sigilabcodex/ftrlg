(() => {
  const config = window.FTRLG_CONFIG;
  const fallbackStorageKeys = {
    granted: 'ftrlg_access_granted',
    name: 'ftrlg_participant_name',
    pendingCode: 'ftrlg_pending_code'
  };

  const storageKeys = config?.storageKeys ?? fallbackStorageKeys;
  const routes = config?.routes ?? { access: 'index.html' };
  const iterations = config?.crypto?.pbkdf2Iterations ?? 150000;

  const greeting = document.getElementById('visitor-greeting');
  const payloadSlot = document.getElementById('payload-content');
  const exitButton = document.getElementById('exit-node');

  if (!greeting || !payloadSlot || !exitButton) {
    return;
  }

  const participantName = sessionStorage.getItem(storageKeys.name);
  const pendingCode = sessionStorage.getItem(storageKeys.pendingCode);

  if (!participantName || !pendingCode) {
    sessionStorage.removeItem(storageKeys.granted);
    window.location.replace(routes.access);
    return;
  }

  greeting.textContent = `Welcome, ${participantName}. Your circulation status is verified.`;
  payloadSlot.innerHTML = '<p>Decrypting memorandum…</p>';
  payloadSlot.setAttribute('aria-busy', 'true');

  const decodeBase64 = (value) => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  const deriveKey = async (code, saltBytes) => {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey('raw', encoder.encode(code), { name: 'PBKDF2' }, false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations,
        hash: 'SHA-256'
      },
      baseKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['decrypt']
    );
  };

  const decryptPayload = async () => {
    const payload = window.FTRLG_PAYLOAD;
    if (!payload?.salt || !payload?.iv || !payload?.ciphertext) {
      throw new Error('payload missing');
    }

    const saltBytes = decodeBase64(payload.salt);
    const ivBytes = decodeBase64(payload.iv);
    const cipherBytes = decodeBase64(payload.ciphertext);

    const key = await deriveKey(pendingCode, saltBytes);
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      key,
      cipherBytes
    );

    return new TextDecoder().decode(plainBuffer);
  };

  decryptPayload()
    .then((contentHtml) => {
      sessionStorage.setItem(storageKeys.granted, 'true');
      sessionStorage.removeItem(storageKeys.pendingCode);
      payloadSlot.innerHTML = contentHtml;
      payloadSlot.setAttribute('aria-busy', 'false');
      window.dispatchEvent(new CustomEvent('ftrlg:decrypt-success'));
    })
    .catch(() => {
      sessionStorage.removeItem(storageKeys.pendingCode);
      sessionStorage.removeItem(storageKeys.granted);
      payloadSlot.innerHTML = '<p>Access key invalid. Dossier unavailable.</p>';
      payloadSlot.setAttribute('aria-busy', 'false');
      window.dispatchEvent(new CustomEvent('ftrlg:decrypt-fail'));
    });

  exitButton.addEventListener('click', () => {
    sessionStorage.removeItem(storageKeys.granted);
    sessionStorage.removeItem(storageKeys.name);
    sessionStorage.removeItem(storageKeys.pendingCode);
    window.location.assign(routes.access);
  });
})();
