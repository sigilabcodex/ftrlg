(() => {
  const visualConfig = window.FTRLG_CONFIG?.visual ?? {};
  const audioConfig = window.FTRLG_CONFIG?.audio ?? {};

  const useCrt = visualConfig.crt !== false;
  const useVignette = visualConfig.vignette !== false;
  const useFlicker = visualConfig.flicker !== false;
  const useLogo = visualConfig.logo !== false;
  const useBird = visualConfig.bird !== false;
  const useSound = audioConfig.enabled === true || visualConfig.sound === true;

  if (!useCrt) {
    document.body.classList.add('no-crt');
  }

  if (!useVignette) {
    document.body.classList.add('no-vignette');
  }

  if (useCrt && useFlicker) {
    document.body.dataset.flicker = 'on';
  }

  const logoHost = document.querySelector('.ftrlg-logo');
  if (logoHost) {
    if (!useLogo) {
      logoHost.classList.add('is-disabled');
    } else {
      const logoImg = new Image();
      const candidates = ['assets/img/ftrlg-logo.svg', 'assets/img/ftrlg.svg'];
      let index = 0;

      const tryNext = () => {
        if (index >= candidates.length) {
          logoHost.classList.add('is-missing');
          return;
        }
        logoImg.src = candidates[index];
        index += 1;
      };

      logoImg.alt = 'FTRLG';
      logoImg.loading = 'lazy';
      logoImg.decoding = 'async';
      logoImg.addEventListener('load', () => {
        logoHost.classList.remove('is-missing');
      });
      logoImg.addEventListener('error', tryNext);

      tryNext();
      logoHost.append(logoImg);
    }
  }

  if (useBird) {
    const bird = document.createElement('div');
    bird.className = 'pixel-bird';
    bird.setAttribute('aria-hidden', 'true');
    bird.innerHTML = `
      <svg viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <rect x="7" y="9" width="8" height="5" fill="currentColor" opacity="0.96" />
        <rect x="15" y="10" width="3" height="2" fill="currentColor" />
        <rect x="6" y="10" width="1" height="1" fill="currentColor" />
        <g class="wing wing-a">
          <rect x="9" y="6" width="3" height="2" fill="currentColor" />
          <rect x="11" y="7" width="2" height="2" fill="currentColor" />
        </g>
        <g class="wing wing-b">
          <rect x="9" y="7" width="3" height="2" fill="currentColor" />
          <rect x="11" y="8" width="2" height="2" fill="currentColor" />
        </g>
      </svg>`;
    document.body.append(bird);
  }

  if (!useSound) {
    return;
  }

  let audioContext;
  let userActivated = false;

  const unlockAudio = () => {
    userActivated = true;
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  };

  const activationEvents = ['pointerdown', 'keydown', 'touchstart'];
  activationEvents.forEach((eventName) => {
    window.addEventListener(eventName, unlockAudio, { once: true, passive: true });
  });

  const playTone = ({ frequency = 440, duration = 0.06, type = 'square', gain = 0.012 }) => {
    if (!userActivated) {
      return;
    }

    if (!audioContext) {
      unlockAudio();
    }

    if (!audioContext) {
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = gain;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  window.addEventListener('ftrlg:access-submit', () => {
    playTone({ frequency: 540, duration: 0.03, gain: 0.01 });
  });

  window.addEventListener('ftrlg:decrypt-success', () => {
    playTone({ frequency: 740, duration: 0.05, type: 'triangle', gain: 0.012 });
  });

  window.addEventListener('ftrlg:decrypt-fail', () => {
    playTone({ frequency: 190, duration: 0.08, type: 'sawtooth', gain: 0.013 });
  });
})();
