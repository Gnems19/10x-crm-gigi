/**
 * Password hashing with PBKDF2-HMAC-SHA256 via the Web Crypto API.
 *
 * Passwords are never stored. Each account keeps a random salt and the derived
 * hash, so identical passwords produce different records and the stored value
 * cannot be turned back into a password.
 *
 * Web Crypto needs a secure context: https, localhost, or file:// all qualify,
 * plain http on a remote host does not.
 */

const PASSWORD_ALGO = 'PBKDF2-SHA256';
const PASSWORD_ITERATIONS = 210000; // OWASP guidance for PBKDF2-HMAC-SHA256
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_BITS = 256;

function isCryptoAvailable() {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  );
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function deriveHash(password, saltBytes, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    keyMaterial,
    PASSWORD_KEY_BITS
  );

  return bytesToHex(new Uint8Array(bits));
}

/**
 * Build the record stored on a user. The salt and iteration count travel with
 * the hash so the cost can be raised later without locking anyone out.
 */
async function createPasswordRecord(password) {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto is unavailable, refusing to store a password.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_SALT_BYTES));

  return {
    algo: PASSWORD_ALGO,
    iterations: PASSWORD_ITERATIONS,
    salt: bytesToHex(salt),
    hash: await deriveHash(password, salt, PASSWORD_ITERATIONS),
  };
}

/** Compares every character so a near-miss costs the same time as a wrong first byte. */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifyPassword(password, record) {
  if (!record || !record.salt || !record.hash) return false;
  if (!isCryptoAvailable()) return false;

  const candidate = await deriveHash(
    password,
    hexToBytes(record.salt),
    record.iterations || PASSWORD_ITERATIONS
  );

  return timingSafeEqual(candidate, record.hash);
}
