# FUTUROLOGÍA / ftrlg access node (v2)

Lightweight static portal site for FUTUROLOGÍA (ftrlg), designed for GitHub Pages deployment.

## What this site is

This repository contains a minimal two-page experiential interface:
- `index.html`: access node (participant designation + node code gate)
- `portal.html`: internal dossier view rendered after successful client-side decryption

The tone is intentionally restrained: internal network terminal + dossier aesthetics, with responsive layout and subtle visual texture.

## Runtime flow

1. On `index.html`, user enters participant designation and node code.
2. `assets/js/access.js` validates only that both fields are present.
3. Access script stores:
   - participant name (`sessionStorage`)
   - temporary entered code (`sessionStorage`, transient)
4. User is redirected to `portal.html`.
5. `assets/js/portal.js` derives a key from the temporary code using PBKDF2 and decrypts `assets/data/payload.js` via AES-GCM.
6. If decrypt succeeds:
   - payload renders
   - `granted=true` is stored
   - temporary code is immediately removed from `sessionStorage`
7. If decrypt fails:
   - temporary code is removed
   - access denied message is shown

## Shared config

Common configuration is centralized in:

- `assets/js/config.js`

Current keys include:
- route names (`index.html`, `portal.html`)
- sessionStorage keys (`granted`, `name`, `pendingCode`)
- access code value and redirect delay
- PBKDF2 iteration count

## Stored payload format

`assets/data/payload.js` now stores encrypted payload metadata only:

```js
window.FTRLG_PAYLOAD = {
  algorithm: 'aes-gcm-pbkdf2-v1',
  kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: 150000 },
  cipher: 'AES-GCM',
  salt: '<base64>',
  iv: '<base64>',
  ciphertext: '<base64>'
};
```

No plaintext document body is committed in the public repository.

## Regenerating encrypted payload

1. Create a local (git-ignored) plaintext source file:
   - `.local/payload-source.html`
2. Run:

```bash
node scripts/encrypt-payload.js
```

This script:
- reads source from stdin if provided, otherwise `.local/payload-source.html`
- reads access code from `assets/js/config.js` (or `--code`)
- encrypts with AES-256-GCM
- derives key with PBKDF2-SHA256 (`150000` iterations by default)
- writes updated `assets/data/payload.js`

Optional flags:

```bash
node scripts/encrypt-payload.js --source .local/payload-source.html --out assets/data/payload.js --iterations 150000
```

## Changing the access code

1. Update `access.code` in `assets/js/config.js`.
2. Re-run payload encryption so ciphertext matches the new code:

```bash
node scripts/encrypt-payload.js
```

If code and ciphertext do not match, portal decryption will fail.

## Security expectations and limitations

This is stronger than lightweight obfuscation, but still frontend-only security:
- all logic executes client-side
- access code is still shipped to browser if kept in config
- determined attackers can inspect runtime behavior

What this improves:
- plaintext payload is not readable in repo files
- wrong code fails cryptographic decryption
- access gate is tied to decryption success, not a simple string compare in the entry page

For high-assurance protection, use server-side authorization and key management.

## Local testing

Because this is static HTML/CSS/JS, test with:

```bash
python -m http.server 8080
```

Then open:
- `http://localhost:8080/index.html`

(Using a local server is preferred over direct `file://` URLs.)

## Deploy on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set:
   - Source: `Deploy from a branch`
   - Branch: `main` (or your chosen branch), folder `/ (root)`
4. Save and wait for Pages deployment.
5. Your site will be served from `https://<user>.github.io/<repo>/`.
