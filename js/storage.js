/**
 * localStorage helpers for the four CRM keys.
 * Keys are required by the PRD for evaluator inspection.
 */
const STORAGE_KEYS = {
  users: 'crm_users',
  session: 'crm_session',
  clients: 'crm_clients',
  theme: 'crm_theme',
};

function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeKey(key) {
  localStorage.removeItem(key);
}

function getUsers() {
  return getJSON(STORAGE_KEYS.users, []);
}

function setUsers(users) {
  setJSON(STORAGE_KEYS.users, users);
}

function getSession() {
  return getJSON(STORAGE_KEYS.session, null);
}

function setSession(session) {
  setJSON(STORAGE_KEYS.session, session);
}

function clearSession() {
  removeKey(STORAGE_KEYS.session);
}

function getClients() {
  return getJSON(STORAGE_KEYS.clients, null);
}

function setClients(clients) {
  setJSON(STORAGE_KEYS.clients, clients);
}

function clearClients() {
  removeKey(STORAGE_KEYS.clients);
}

function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.theme);
}

function setTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}
