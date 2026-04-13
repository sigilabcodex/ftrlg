#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const args = process.argv.slice(2);
const argMap = new Map();
for (let i = 0; i < args.length; i += 1) {
  const key = args[i];
  const value = args[i + 1];
  if (key.startsWith('--') && value && !value.startsWith('--')) {
    argMap.set(key, value);
    i += 1;
  }
}

const sourcePath = argMap.get('--source') || path.join('.local', 'payload-source.html');
const outPath = argMap.get('--out') || path.join('assets', 'data', 'payload.js');
const iterations = Number(argMap.get('--iterations') || 150000);
const codeFromArg = argMap.get('--code');

const readCodeFromConfig = () => {
  const configPath = path.join('assets', 'js', 'config.js');
  const configJs = fs.readFileSync(configPath, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(configJs, context);
  return context.window?.FTRLG_CONFIG?.access?.code;
};

const readSource = () => {
  if (!process.stdin.isTTY) {
    const stdin = fs.readFileSync(0, 'utf8');
    if (stdin.trim().length > 0) {
      return stdin;
    }
  }
  return fs.readFileSync(sourcePath, 'utf8');
};

const code = codeFromArg || readCodeFromConfig();
if (!code) {
  throw new Error('Missing access code. Provide --code or set assets/js/config.js access.code.');
}

const plaintext = readSource();
if (!plaintext.trim()) {
  throw new Error('Payload source is empty.');
}

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(code, salt, iterations, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();
const ciphertext = Buffer.concat([encrypted, tag]);

const payloadObject = {
  algorithm: 'aes-gcm-pbkdf2-v1',
  kdf: {
    name: 'PBKDF2',
    hash: 'SHA-256',
    iterations
  },
  cipher: 'AES-GCM',
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  ciphertext: ciphertext.toString('base64')
};

const payloadJs = `window.FTRLG_PAYLOAD = ${JSON.stringify(payloadObject, null, 2)};\n`;
fs.writeFileSync(outPath, payloadJs);
console.log(`Encrypted payload written to ${outPath}`);
