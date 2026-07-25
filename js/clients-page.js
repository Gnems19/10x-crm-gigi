/**
 * Clients page UI — list, CRUD, filters, detail modal (P4 CORE + FULL).
 */
let activeFilter = 'All';
let searchQuery = '';
let sortMode = 'newest';
let detailClientId = null;

function clearFormErrors(form) {
  form.querySelectorAll('.field-error').forEach((el) => {
    el.textContent = '';
  });
  form.querySelectorAll('.input-error').forEach((el) => {
    el.classList.remove('input-error');
  });
}

function setFieldError(input, message) {
  input.classList.add('input-error');
  const errorEl = document.getElementById(`${input.id}-error`);
  if (errorEl) errorEl.textContent = message;
}

function getVisibleClients() {
  let list = [...getClientsState()];

  if (activeFilter !== 'All') {
    list = list.filter((c) => c.status === activeFilter);
  }

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q)
    );
  }

  if (sortMode === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === 'deal') {
    list.sort((a, b) => b.dealValue - a.dealValue);
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return list;
}

function renderClients(list) {
  const container = document.getElementById('clients-list');
  container.innerHTML = '';

  if (!list.length) {
    container.innerHTML = '<div class="empty-state">No clients found.</div>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'client-grid';

  list.forEach((client) => {
    const card = document.createElement('article');
    card.className = 'client-card';
    card.dataset.id = String(client.id);

    const statusOptions = STATUSES.map(
      (s) =>
        `<option value="${s}" ${s === client.status ? 'selected' : ''}>${s}</option>`
    ).join('');

    card.innerHTML = `
      <div class="client-card-top">
        <img class="client-avatar" src="${escapeHtml(client.image)}" alt="" data-avatar />
        <div class="client-meta">
          <h3>${escapeHtml(client.name)}</h3>
          <p>${escapeHtml(client.company || '—')}</p>
          <p>${escapeHtml(client.email)}</p>
        </div>
      </div>
      <div>
        <span class="badge ${statusBadgeClass(client.status)}">${client.status}</span>
      </div>
      <div class="client-card-footer">
        <span class="deal-value">${formatDealValue(client.dealValue)}</span>
        <div class="client-card-actions">
          <select class="status-select" data-status-select data-id="${client.id}" aria-label="Change status">
            ${statusOptions}
          </select>
          <button type="button" class="btn btn-danger btn-sm" data-delete data-id="${client.id}">Delete</button>
        </div>
      </div>
    `;

    const img = card.querySelector('[data-avatar]');
    img.addEventListener('error', () => {
      img.replaceWith(createInitialsAvatar(client.name));
    });

    card.addEventListener('click', (event) => {
      if (
        event.target.closest('[data-delete]') ||
        event.target.closest('[data-status-select]')
      ) {
        return;
      }
      openDetailModal(client.id);
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function createInitialsAvatar(name) {
  const el = document.createElement('div');
  el.className = 'client-avatar client-avatar-fallback';
  el.textContent = getInitials(name);
  return el;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function refreshList() {
  renderClients(getVisibleClients());
}

function showLoading() {
  document.getElementById('clients-list').innerHTML =
    '<div class="loading-state">Loading clients...</div>';
}

function showLoadError() {
  document.getElementById('clients-list').innerHTML = `
    <div class="error-state">
      <p>Could not load clients. Check your connection and try again.</p>
      <button type="button" class="btn btn-primary btn-inline" id="retry-load">Retry</button>
    </div>
  `;
  document.getElementById('retry-load').addEventListener('click', () => {
    clearClients();
    bootstrapClients();
  });
}

async function bootstrapClients() {
  showLoading();
  const result = await loadClients();
  if (!result.ok) {
    showLoadError();
    return;
  }
  refreshList();
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/* ---- Phone -------------------------------------------------------
   Phone numbers are digits plus punctuation — never letters. Typing is
   filtered as it happens, and the shape is checked again on submit. */

/** Everything a phone number is allowed to be made of. */
const PHONE_ALLOWED = /[^\d+\-\s().]/g;

/**
 * Digit groups, optionally bracketed, joined by a single space, dash or dot,
 * after an optional leading +. Matches "+81 965-431-3024", "(555) 010-9999"
 * and "+995555123456"; rejects "555--0101" and anything with a letter.
 */
const PHONE_SHAPE = /^\+?(?:\(\d+\)|\d+)(?:[\s.-]?(?:\(\d+\)|\d+))*$/;

/** Strips anything that can't be in a phone number, as the user types. */
function attachPhoneFilter(input) {
  input.addEventListener('input', () => {
    const cleaned = input.value
      .replace(PHONE_ALLOWED, '')
      .replace(/(?!^)\+/g, ''); // a + only makes sense as a country prefix
    if (cleaned === input.value) return;
    // Keep the caret where the user left it instead of jumping to the end.
    const caret = Math.max(0, input.selectionStart - (input.value.length - cleaned.length));
    input.value = cleaned;
    input.setSelectionRange(caret, caret);
  });
}

/** @returns {string} Error message, or '' when the number is acceptable. */
function phoneError(phone) {
  const value = phone.trim();
  if (!value) return ''; // phone stays optional

  if (!PHONE_SHAPE.test(value)) {
    return 'Use digits only, with + - ( ) . or spaces';
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length < 7) return 'Phone number looks too short';
  if (digits.length > 15) return 'Phone number looks too long';
  return '';
}

function validateAddClientForm(form) {
  clearFormErrors(form);
  const name = form.name.value;
  const email = form.email.value;
  const phone = form.phone.value;
  const dealValueRaw = form.dealValue.value;
  let valid = true;

  if (name.trim().length < 3) {
    setFieldError(form.name, 'Name must be at least 3 characters');
    valid = false;
  }

  if (!isValidEmailFormat(email)) {
    setFieldError(form.email, 'Please enter a valid email address');
    valid = false;
  } else if (
    getClientsState().some((c) => c.email.toLowerCase() === email.trim().toLowerCase())
  ) {
    setFieldError(form.email, 'A client with this email already exists');
    valid = false;
  }

  const phoneMessage = phoneError(phone);
  if (phoneMessage) {
    setFieldError(form.phone, phoneMessage);
    valid = false;
  }

  const dealValue = Number(dealValueRaw);
  if (dealValueRaw.trim() === '' || Number.isNaN(dealValue) || dealValue <= 0) {
    setFieldError(form.dealValue, 'Deal value must be a positive number');
    valid = false;
  }

  return valid;
}

function openDetailModal(clientId) {
  const client = findClientById(clientId);
  if (!client) return;
  detailClientId = clientId;

  const body = document.getElementById('detail-modal-body');
  const notesHtml = (client.notes || [])
    .map(
      (note) =>
        `<li><div>${escapeHtml(note.text)}</div><span class="note-date">${escapeHtml(note.date)}</span></li>`
    )
    .join('');

  body.innerHTML = `
    <div class="client-card-top">
      <img class="client-avatar" src="${escapeHtml(client.image)}" alt="" id="detail-avatar" />
      <div class="client-meta">
        <h3>${escapeHtml(client.name)}</h3>
        <p>${escapeHtml(client.company || '—')}</p>
      </div>
    </div>
    <div class="detail-grid">
      <div><span>Email:</span> ${escapeHtml(client.email)}</div>
      <div><span>Phone:</span> ${escapeHtml(client.phone || '—')}</div>
      <div><span>Status:</span> <span class="badge ${statusBadgeClass(client.status)}">${client.status}</span></div>
      <div><span>Deal value:</span> ${formatDealValue(client.dealValue)}</div>
      <div><span>Client since</span> ${new Date(client.createdAt).toLocaleDateString()}</div>
    </div>
    <h3>Notes</h3>
    <ul class="notes-list" id="notes-list">${notesHtml || '<li class="note-date">No notes yet.</li>'}</ul>
    <div class="form-group">
      <label for="note-text">Add note</label>
      <textarea id="note-text" rows="2"></textarea>
    </div>
    <div class="detail-actions">
      <button type="button" class="btn btn-primary btn-inline" id="add-note-btn">Add note</button>
      <button type="button" class="btn btn-ghost" id="remind-btn">Remind me in 1 min</button>
    </div>
  `;

  const avatar = document.getElementById('detail-avatar');
  avatar.addEventListener('error', () => {
    avatar.replaceWith(createInitialsAvatar(client.name));
  });

  document.getElementById('add-note-btn').addEventListener('click', () => {
    const text = document.getElementById('note-text').value;
    const updated = addClientNote(clientId, text);
    if (!updated) return;
    openDetailModal(clientId);
    refreshList();
  });

  document.getElementById('remind-btn').addEventListener('click', () => {
    const name = client.name;
    showToast('Reminder set ✓', 'success');
    setTimeout(() => {
      showToast(`⏰ Follow up: ${name}`, 'success');
    }, 60000);
  });

  openModal('detail-modal');
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (!guardPage({ requireAuth: true })) return;
  initNav('clients');

  document.getElementById('open-add-modal').addEventListener('click', () => {
    const form = document.getElementById('add-client-form');
    form.reset();
    clearFormErrors(form);
    form.status.value = 'Lead';
    openModal('add-modal');
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.closeModal);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.modal-backdrop.open').forEach((backdrop) => {
      backdrop.classList.remove('open');
    });
  });

  attachPhoneFilter(document.getElementById('phone'));

  document.getElementById('add-client-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    if (!validateAddClientForm(form)) return;

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      phone: form.phone.value.trim(),
      company: form.company.value.trim(),
      dealValue: Number(form.dealValue.value),
      status: form.status.value,
    };

    try {
      await addClientViaApi(payload);
      closeModal('add-modal');
      refreshList();
      showToast('Client added ✓', 'success');
    } catch {
      showToast('Could not add client. Please try again.', 'error');
    }
  });

  document.getElementById('clients-list').addEventListener('click', async (event) => {
    const deleteBtn = event.target.closest('[data-delete]');
    if (!deleteBtn) return;
    event.stopPropagation();
    const id = Number(deleteBtn.dataset.id);
    const confirmed = confirm('Delete this client? This cannot be undone.');
    if (!confirmed) return;
    await deleteClientViaApi(id);
    refreshList();
    showToast('Client deleted', 'success');
  });

  document.getElementById('clients-list').addEventListener('change', (event) => {
    const select = event.target.closest('[data-status-select]');
    if (!select) return;
    event.stopPropagation();
    const id = Number(select.dataset.id);
    updateClientStatus(id, select.value);
    refreshList();
  });

  document.getElementById('search-input').addEventListener('input', (event) => {
    searchQuery = event.target.value;
    refreshList();
  });

  document.querySelectorAll('[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      refreshList();
    });
  });

  document.getElementById('sort-select').addEventListener('change', (event) => {
    sortMode = event.target.value;
    refreshList();
  });

  bootstrapClients();
});
