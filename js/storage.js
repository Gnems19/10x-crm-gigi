/**
 * localStorage helpers for the four CRM keys.
 * Keys are required by the PRD for evaluator inspection.
 *
 * Every getter below declares a concrete return type. Without them the type
 * flows out of JSON.parse as `any` and callers get no completion at all.
 */

/**
 * @typedef {'Lead' | 'Contacted' | 'Won' | 'Lost'} ClientStatus
 */

/**
 * @typedef {object} ClientNote
 * @property {string} text
 * @property {string} date Display string from toLocaleString(), not ISO.
 */

/**
 * @typedef {object} Client
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} company
 * @property {string} image Avatar URL.
 * @property {ClientStatus} status
 * @property {number} dealValue
 * @property {ClientNote[]} notes
 * @property {string} createdAt ISO timestamp.
 */

/**
 * @typedef {object} PasswordRecord PBKDF2 output; see password.js.
 * @property {string} algo
 * @property {number} iterations
 * @property {string} salt Hex-encoded.
 * @property {string} hash Hex-encoded.
 */

/**
 * @typedef {object} User
 * @property {number} id
 * @property {string} fullName
 * @property {string} email Lowercased.
 * @property {PasswordRecord} passwordHash
 * @property {string} company
 * @property {string} createdAt ISO timestamp.
 * @property {string} [password] Legacy plaintext on pre-hashing accounts only;
 *   auth.js rewrites it to passwordHash on the next successful login.
 */

/**
 * @typedef {object} Session
 * @property {number} userId
 * @property {string} email
 * @property {string} loginAt ISO timestamp.
 */

const STORAGE_KEYS = {
  users: 'crm_users',
  session: 'crm_session',
  clients: 'crm_clients',
  theme: 'crm_theme',
};

/**
 * Reads and parses a JSON value from localStorage.
 *
 * Returns `fallback` when the key is absent, and also when the stored text
 * fails to parse, so a corrupted entry degrades to the default instead of
 * throwing at every call site.
 *
 * @param {string} key
 * @param {*} [fallback=null] Returned when the key is missing or unparsable.
 * @returns {*} Whatever was stored — unvalidated, so callers narrow it.
 */
function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {*} value Must be JSON-serializable.
 * @returns {void}
 */
function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * @param {string} key
 * @returns {void}
 */
function removeKey(key) {
  localStorage.removeItem(key);
}

/**
 * @returns {User[]} Registered accounts; empty array when none exist yet.
 */
function getUsers() {
  const stored = getJSON(STORAGE_KEYS.users, []);
  return Array.isArray(stored) ? stored : [];
}

/**
 * @param {User[]} users
 * @returns {void}
 */
function setUsers(users) {
  setJSON(STORAGE_KEYS.users, users);
}

/**
 * @returns {Session | null} The logged-in session, or null when signed out.
 */
function getSession() {
  return getJSON(STORAGE_KEYS.session, null);
}

/**
 * @param {Session} session
 * @returns {void}
 */
function setSession(session) {
  setJSON(STORAGE_KEYS.session, session);
}

/** @returns {void} */
function clearSession() {
  removeKey(STORAGE_KEYS.session);
}

/**
 * Reads the cached client list.
 *
 * `null` and `[]` are not interchangeable here. `null` means the cache was
 * never written (or clearClients() wiped it), which is the signal loadClients()
 * uses to go fetch from the API. `[]` means "cached, and the user has zero
 * clients" — collapsing them would re-seed the list from the API every time
 * someone deletes their last client.
 *
 * @returns {Client[] | null} Cached clients, or null when nothing is cached.
 */
function getClients() {
  const stored = getJSON(STORAGE_KEYS.clients, null);
  // The key is only ever written by setClients, but the value is user-editable
  // via devtools — narrow so the declared type holds at runtime too.
  return Array.isArray(stored) ? stored : null;
}

/**
 * @param {Client[]} clients
 * @returns {void}
 */
function setClients(clients) {
  setJSON(STORAGE_KEYS.clients, clients);
}

/** @returns {void} */
function clearClients() {
  removeKey(STORAGE_KEYS.clients);
}

/**
 * @returns {string | null} 'dark' | 'light', or null before the first choice
 *   is persisted. Stored as a bare string, not JSON.
 */
function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme);
}

/**
 * @param {string} theme
 * @returns {void}
 */
function setTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}
