/**
 * AES-256-GCM encryption helper for sensitive data at rest (e.g. TOTP secrets).
 *
 * Uses Node.js built-in `crypto` — no extra dependencies.
 *
 * Environment variable required:
 *   ENCRYPTION_KEY — 64 hex characters (= 32 bytes).
 *   Generate once with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Stored format (colon-separated hex strings):
 *   <iv (12 bytes)>:<authTag (16 bytes)>:<ciphertext>
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGO       = 'aes-256-gcm';
const IV_BYTES   = 12;   // 96-bit IV — recommended for GCM
const TAG_BYTES  = 16;   // 128-bit authentication tag

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes). ' +
      'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypts plaintext string using AES-256-GCM.
 * Returns a colon-joined hex string: `iv:authTag:ciphertext`
 */
export function encrypt(plaintext: string): string {
  const key  = getKey();
  const iv   = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    tag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

/**
 * Decrypts a value produced by `encrypt()`.
 * Throws if the key is wrong or the ciphertext has been tampered with.
 */
export function decrypt(stored: string): string {
  const parts = stored.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format — expected iv:authTag:ciphertext');
  }
  const [ivHex, tagHex, ctHex] = parts;
  const key      = getKey();
  const iv       = Buffer.from(ivHex, 'hex');
  const tag      = Buffer.from(tagHex, 'hex');
  const ct       = Buffer.from(ctHex, 'hex');
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

/**
 * Returns true when the stored value looks like an AES-GCM blob (iv:tag:ct).
 * Used to detect legacy plaintext secrets so we can re-encrypt them on first use.
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 3 && parts[0].length === IV_BYTES * 2;
}
