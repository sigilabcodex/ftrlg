# FUTUROLOGÍA / ftrlg access node (v1)

Lightweight static portal site for FUTUROLOGÍA (ftrlg), designed for GitHub Pages deployment.

## What this site is

This repository contains a minimal two-page experiential interface:
- `index.html`: access node (participant designation + node code gate)
- `portal.html`: internal dossier view rendered only after session access is granted

The tone is intentionally restrained: internal network terminal + dossier aesthetics, with responsive layout and subtle visual texture.

## How it works

### Access flow
1. User enters participant designation and node code on `index.html`.
2. `assets/js/access.js` validates both fields.
3. If code matches the configured value, it stores session state in `sessionStorage` and redirects to `portal.html`.
4. `assets/js/portal.js` checks the session gate. If missing, it redirects back to `index.html`.
5. Portal greets the participant by stored name and injects decoded document content.

### Shared config
Common configuration is centralized in:

- `assets/js/config.js`

Current keys include:
- route names (`index.html`, `portal.html`)
- `sessionStorage` keys
- access-code value and redirect delay

### Session storage keys
- `ftrlg_access_granted`
- `ftrlg_participant_name`

## How to change the access code

Edit the access code value in:

- `assets/js/config.js`

Current default:

```js
access: {
  code: 'ftrlg-prelim-2026'
}
```

## How to change the document payload

The invitation body is stored obfuscated in:

- `assets/data/payload.js`

`portal.js` decodes this payload client-side and injects it into `#payload-content`.

### Current obfuscation method

Algorithm: `xor-base64-v1`

- Start with document HTML string.
- XOR each character with a numeric shift (`shift` field in payload file).
- Base64-encode the transformed string.
- Save as `encoded` in `payload.js`.

Decode path in browser:
- Base64 decode with `atob`
- XOR again with same shift

## Obfuscation limitations (important)

This is intentionally lightweight obfuscation, not secure encryption:
- anyone with browser devtools can inspect and decode payload
- access code is client-side and discoverable
- session gate is only a ritual/access layer for casual visitors

For stronger protection in future versions, use server-side controls or Web Crypto with externally managed keys.

## Local testing

Because this is static HTML/CSS/JS, you can test quickly with:

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

## Map custom domain later (`ftrlg.cc`)

When ready:
1. In GitHub Pages settings, set custom domain to `ftrlg.cc`.
2. Add DNS records at your domain provider:
   - `A` records for apex domain pointing to GitHub Pages IPs
   - or `CNAME` for subdomain setup
3. Add a `CNAME` file at repository root containing exactly:

```text
ftrlg.cc
```

4. Enable HTTPS in Pages settings after DNS propagates.
