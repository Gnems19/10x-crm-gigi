/**
 * Shared clients state + DummyJSON API load/save.
 * Golden cycle: mutate state → saveClients() → re-render.
 */
const CLIENTS_API = 'https://dummyjson.com/users';
const STATUSES = ['Lead', 'Contacted', 'Won', 'Lost'];
const CLIENTS_SEED_COUNT = 60; // ~15 per status, enough to scroll on every filter

let clientsState = [];

/**
 * Shape one API user into a client record. Anything the API actually returns
 * wins; the mock helpers only fill the gaps. Read each `||` as "real, or made
 * up" — see mock.js.
 */
function mapApiUserToClient(user) {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const name = `${firstName} ${lastName}`.trim() || user.name || 'Unknown';
  const company =
    (user.company && user.company.name) || user.companyName || user.company || '';

  return {
    id: user.id,
    name,
    email: user.email || '',
    phone: user.phone || '',
    company,
    image: user.image || mockAvatarUrl(name),
    status: user.status && STATUSES.includes(user.status) ? user.status : mockStatus(user.id),
    dealValue: typeof user.dealValue === 'number' ? user.dealValue : mockDealValue(),
    notes: Array.isArray(user.notes) ? user.notes : [],
    createdAt: user.createdAt || mockCreatedAt(),
  };
}

function formatDealValue(value) {
  return `$${Number(value || 0).toLocaleString('en-US')}`;
}

function statusBadgeClass(status) {
  const map = {
    Lead: 'badge-lead',
    Contacted: 'badge-contacted',
    Won: 'badge-won',
    Lost: 'badge-lost',
  };
  return map[status] || 'badge';
}

function saveClientsState() {
  setClients(clientsState);
}

function getClientsState() {
  return clientsState;
}

function setClientsState(clients) {
  clientsState = clients;
  saveClientsState();
}

/**
 * Load clients from localStorage or API.
 * @returns {Promise<{ ok: boolean, clients?: Array, error?: string }>}
 */
async function loadClients() {
  const cached = getClients();
  if (Array.isArray(cached)) {
    clientsState = cached;
    return { ok: true, clients: clientsState, fromCache: true };
  }

  try {
    const response = await fetch(`${CLIENTS_API}?limit=${CLIENTS_SEED_COUNT}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const users = data.users || [];
    clientsState = users.map(mapApiUserToClient);
    saveClientsState();
    return { ok: true, clients: clientsState, fromCache: false };
  } catch (error) {
    return {
      ok: false,
      error: 'Could not load clients. Check your connection and try again.',
      cause: error,
    };
  }
}

async function addClientViaApi(clientPayload) {
  const response = await fetch(`${CLIENTS_API}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: clientPayload.name.split(' ')[0] || clientPayload.name,
      lastName: clientPayload.name.split(' ').slice(1).join(' ') || '',
      email: clientPayload.email,
      phone: clientPayload.phone,
      company: { name: clientPayload.company },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const newClient = {
    // DummyJSON is simulated — /users/add echoes back id 209 every single time,
    // so trusting it would give every added client the same id, and deleting
    // one would delete them all. Ids are ours. Numeric, because the click
    // handlers read them back through Number(dataset.id).
    id: Date.now(),
    name: clientPayload.name,
    email: clientPayload.email,
    phone: clientPayload.phone || '',
    company: clientPayload.company || '',
    image: data.image || mockAvatarUrl(clientPayload.name),
    status: clientPayload.status || 'Lead',
    dealValue: clientPayload.dealValue,
    notes: [],
    createdAt: new Date().toISOString(), // real: this client was added just now
  };

  clientsState.unshift(newClient);
  saveClientsState();
  return newClient;
}

async function deleteClientViaApi(clientId) {
  try {
    const response = await fetch(`${CLIENTS_API}/${clientId}`, {
      method: 'DELETE',
    });
    // DummyJSON may return 404 for locally added ids — still remove from state
    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    // Network errors: still remove locally so UX matches PRD "delete from state"
    console.warn('Delete API warning:', error);
  }

  clientsState = clientsState.filter((client) => client.id !== clientId);
  saveClientsState();
}

function updateClientStatus(clientId, status) {
  const client = clientsState.find((c) => c.id === clientId);
  if (!client || !STATUSES.includes(status)) return null;
  client.status = status;
  saveClientsState();
  return client;
}

function addClientNote(clientId, text) {
  const client = clientsState.find((c) => c.id === clientId);
  if (!client) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  client.notes.push({
    text: trimmed,
    date: new Date().toLocaleString(),
  });
  saveClientsState();
  return client;
}

function findClientById(clientId) {
  return clientsState.find((c) => c.id === clientId) || null;
}

async function resetClientsFromApi() {
  clearClients();
  clientsState = [];
  return loadClients();
}
