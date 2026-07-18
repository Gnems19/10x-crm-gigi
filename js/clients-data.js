/**
 * Shared clients state + DummyJSON API load/save.
 * Golden cycle: mutate state → saveClients() → re-render.
 */
const CLIENTS_API = 'https://dummyjson.com/users';
const STATUSES = ['Lead', 'Contacted', 'Won', 'Lost'];

let clientsState = [];

function randomDealValue() {
  return Math.floor(Math.random() * (10000 - 500 + 1)) + 500;
}

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
    image: user.image || `https://dummyjson.com/icon/${encodeURIComponent(firstName || 'user')}/128`,
    status: user.status && STATUSES.includes(user.status) ? user.status : 'Lead',
    dealValue: typeof user.dealValue === 'number' ? user.dealValue : randomDealValue(),
    notes: Array.isArray(user.notes) ? user.notes : [],
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

function formatDealValue(value) {
  return `$${Number(value).toLocaleString('en-US')}`;
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
    const response = await fetch(`${CLIENTS_API}?limit=30`);
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
    id: data.id != null ? data.id : Date.now(),
    name: clientPayload.name,
    email: clientPayload.email,
    phone: clientPayload.phone || '',
    company: clientPayload.company || '',
    image:
      data.image ||
      `https://dummyjson.com/icon/${encodeURIComponent(clientPayload.name.split(' ')[0] || 'user')}/128`,
    status: clientPayload.status || 'Lead',
    dealValue: clientPayload.dealValue,
    notes: [],
    createdAt: new Date().toISOString(),
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
