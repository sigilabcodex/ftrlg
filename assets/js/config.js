window.FTRLG_CONFIG = {
  routes: {
    access: 'index.html',
    portal: 'portal.html'
  },
  storageKeys: {
    granted: 'ftrlg_access_granted',
    name: 'ftrlg_participant_name',
    pendingCode: 'ftrlg_pending_code'
  },
  access: {
    code: 'ftrlg-prelim-2026',
    redirectDelayMs: 320
  },
  crypto: {
    pbkdf2Iterations: 150000
  },
  visual: {
    crt: true,
    vignette: true,
    flicker: true,
    logo: true,
    bird: true
  },
  audio: {
    enabled: false
  }
};
