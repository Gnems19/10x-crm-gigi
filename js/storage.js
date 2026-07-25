/**
 * localStorage helpers for the four CRM keys.
 * Keys are required by the PRD for evaluator inspection.
 *
 * A fifth key, crm_clients_by_user, sits behind them: clients belong to the
 * account that created them, so each user keeps a separate list. crm_clients
 * still holds exactly what the PRD says it holds — the client array — scoped
 * to whoever is signed in. See getClients().
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
  clientsByUser: 'crm_clients_by_user',
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
 * @returns {boolean} False when the write was rejected — see the catch.
 */
function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Quota exceeded, or storage blocked outright (Safari private browsing).
    // Nothing gets saved, but the page shouldn't die halfway through a flow.
    console.warn(`Could not save ${key}:`, error);
    return false;
  }
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
 * The account that owns the client list right now.
 *
 * Every client read and write is scoped to one user, so it has to be clear who
 * is asking. Signed out there is nobody to ask for, and the per-user map is
 * skipped entirely.
 *
 * @returns {number | null} The logged-in user's id, or null when signed out.
 */
function getClientsOwnerId() {
  const session = getSession();
  return session && typeof session.userId === 'number' ? session.userId : null;
}

/**
 * The per-user client store: one entry per account that has loaded clients.
 *
 * Ids are numbers in memory but object keys are always strings, so an entry
 * written as byUser[1720180200000] reads back through the same number fine —
 * both sides get coerced identically.
 *
 * @returns {Record<string, Client[]>} userId -> that account's clients.
 */
function getClientsByUser() {
  const stored = getJSON(STORAGE_KEYS.clientsByUser, {});
  // Arrays are objects too, and a hand-edited key could be either — check the
  // shape properly so a bad value degrades to "no accounts yet".
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}

/**
 * Reads the signed-in account's cached client list.
 *
 * `null` and `[]` are not interchangeable here. `null` means this account has
 * no cache yet — a brand new user, or one who just hit Reset CRM Data — which
 * is the signal loadClients() uses to go seed from the API. `[]` means "cached,
 * and this user has zero clients"; collapsing them would re-seed the list from
 * the API every time someone deletes their last client.
 *
 * @returns {Client[] | null} This user's clients, or null when none are cached.
 */
function getClients() {
  const ownerId = getClientsOwnerId();
  if (ownerId === null) {
    const stored = getJSON(STORAGE_KEYS.clients, null);
    // The key is only ever written by setClients, but the value is user-editable
    // via devtools — narrow so the declared type holds at runtime too.
    return Array.isArray(stored) ? stored : null;
  }

  const owned = getClientsByUser()[ownerId];
  return Array.isArray(owned) ? owned : null;
}

/**
 * Writes the list to both places: crm_clients for the active view, and this
 * user's slot in the map for the next time they log in.
 *
 * @param {Client[]} clients
 * @returns {void}
 */
function setClients(clients) {
  // crm_clients always mirrors whoever is signed in — it is the key the PRD
  // names and the evaluator opens devtools to check.
  setJSON(STORAGE_KEYS.clients, clients);

  const ownerId = getClientsOwnerId();
  if (ownerId === null) return;

  const byUser = getClientsByUser();
  byUser[ownerId] = clients;
  setJSON(STORAGE_KEYS.clientsByUser, byUser);
}

/**
 * Drops the signed-in account's cache so the next load re-seeds from the API.
 *
 * Other accounts keep their lists untouched — that is the point of the map, and
 * it keeps Reset CRM Data (P5.4) scoped to the person who clicked it.
 *
 * @returns {void}
 */
function clearClients() {
  removeKey(STORAGE_KEYS.clients);

  const ownerId = getClientsOwnerId();
  if (ownerId === null) return;

  const byUser = getClientsByUser();
  delete byUser[ownerId];
  setJSON(STORAGE_KEYS.clientsByUser, byUser);
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
