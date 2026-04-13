(() => {
  const visualConfig = window.FTRLG_CONFIG?.visual ?? {};
  const useCrt = visualConfig.crt !== false;
  const useBird = visualConfig.bird !== false;
  const useSound = visualConfig.sound === true;

  if (!useCrt) {
    document.body.classList.add('no-crt');
  } else {
    document.body.dataset.flicker = 'on';
  }

  const logoHost = document.querySelector('.ftrlg-logo');
  if (logoHost) {
    const logoImg = new Image();
    logoImg.src = 'assets/img/ftrlg.svg';
    logoImg.alt = 'FTRLG';
    logoImg.loading = 'lazy';
    logoImg.decoding = 'async';
    logoImg.addEventListener('error', () => {
      logoHost.remove();
    });
    logoHost.append(logoImg);
  }

  if (useBird) {
    const bird = document.createElement('div');
    bird.className = 'pixel-bird';
    bird.setAttribute('aria-hidden', 'true');
    bird.innerHTML = `
      <svg viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg" focusable="false">
        <rect x="7" y="9" width="8" height="5" fill="#9cbdaf" opacity="0.95" />
        <rect x="15" y="10" width="3" height="2" fill="#9cbdaf" />
        <rect x="6" y="10" width="1" height="1" fill="#9cbdaf" />
        <g class="wing-a">
          <rect x="9" y="6" width="3" height="2" fill="#9cbdaf" />
          <rect x="11" y="7" width="2" height="2" fill="#9cbdaf" />
        </g>
        <g class="wing-b">
          <rect x="9" y="7" width="3" height="2" fill="#9cbdaf" />
          <rect x="11" y="8" width="2" height="2" fill="#9cbdaf" />
        </g>
      </svg>`;
    document.body.append(bird);
  }

  if (!useSound) {
    return;
  }

  let audioContext;
  const ensureAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  };

  const playTone = ({ frequency = 440, duration = 0.06, type = 'square', gain = 0.012 }) => {
    const ctx = ensureAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = gain;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
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
