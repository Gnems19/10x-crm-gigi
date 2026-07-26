/**
 * Dashboard page (P3) — stats, pipeline, recent clients, live clock.
 */
function getFirstName(fullName) {
  return (fullName || '').trim().split(/\s+/)[0] || 'there';
}

function computeStats(clients) {
  const total = clients.length;
  const activeDeals = clients.filter(
    (c) => c.status !== 'Won' && c.status !== 'Lost'
  ).length;
  const wonRevenue = clients
    .filter((c) => c.status === 'Won')
    .reduce((sum, c) => sum + Number(c.dealValue || 0), 0);
  const newThisWeek = clients.filter((c) => {
    const days = (Date.now() - new Date(c.createdAt).getTime()) / 86400000;
    return days <= 7;
  }).length;

  return { total, activeDeals, wonRevenue, newThisWeek };
}

const PIPELINE_STAGES = ['Lead', 'Contacted', 'Won', 'Lost'];

function computePipeline(clients) {
  return {
    Lead: clients.filter((c) => c.status === 'Lead').length,
    Contacted: clients.filter((c) => c.status === 'Contacted').length,
    Won: clients.filter((c) => c.status === 'Won').length,
    Lost: clients.filter((c) => c.status === 'Lost').length,
  };
}

function renderPipeline(pipeline) {
  // Bars are scaled to the biggest stage, not to the total, so the shape
  // of the funnel still reads when every count is small.
  const max = Math.max(1, ...PIPELINE_STAGES.map((stage) => pipeline[stage]));

  PIPELINE_STAGES.forEach((stage) => {
    const key = stage.toLowerCase();
    document.getElementById(`pipe-${key}`).textContent = String(pipeline[stage]);
    document.getElementById(`pipe-${key}-bar`).style.width =
      `${(pipeline[stage] / max) * 100}%`;
  });
}

function renderDashboard(clients) {
  const stats = computeStats(clients);
  const pipeline = computePipeline(clients);

  document.getElementById('stat-total').textContent = String(stats.total);
  document.getElementById('stat-active').textContent = String(stats.activeDeals);
  document.getElementById('stat-revenue').textContent = formatDealValue(stats.wonRevenue);
  document.getElementById('stat-new').textContent = String(stats.newThisWeek);

  renderPipeline(pipeline);

  const recent = [...clients]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const list = document.getElementById('recent-clients');
  list.innerHTML = '';

  if (!recent.length) {
    list.innerHTML = '<li class="recent-empty">No clients yet.</li>';
    return;
  }

  recent.forEach((client) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="recent-avatar" aria-hidden="true">${escapeHtml(getInitials(client.name))}</span>
      <span class="recent-main">
        <span class="recent-name">${escapeHtml(client.name)}</span>
        <span class="recent-company">${escapeHtml(client.company || '—')}</span>
      </span>
      <span class="recent-side">
        <span class="badge ${statusBadgeClass(client.status)}">${client.status}</span>
        <span class="recent-date">${new Date(client.createdAt).toLocaleDateString()}</span>
      </span>
    `;
    list.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function updateClock() {
  const now = new Date();
  const el = document.getElementById('live-clock');
  if (!el) return;
  el.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  if (!guardPage({ requireAuth: true })) return;
  initNav('dashboard');

  const user = getCurrentUser();
  document.getElementById('welcome-name').textContent = getFirstName(
    user ? user.fullName : ''
  );

  updateClock();
  setInterval(updateClock, 1000);

  const result = await loadClients();
  if (!result.ok) {
    document.getElementById('dashboard-body').innerHTML = `
      <div class="error-state">
        <p>Could not load clients. Check your connection and try again.</p>
        <button type="button" class="btn btn-primary btn-inline" id="retry-dash">Retry</button>
      </div>
    `;
    document.getElementById('retry-dash').addEventListener('click', () => {
      clearClients();
      window.location.reload();
    });
    return;
  }

  renderDashboard(getClientsState());
});
