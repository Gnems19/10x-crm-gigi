/**
 * Dark / light theme. Default: dark. Persisted in crm_theme.
 */
function applyTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add(`theme-${next}`);
  document.body.dataset.theme = next;
  setTheme(next);

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.textContent = next === 'dark' ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} theme`);
  });
}

function initTheme() {
  const saved = getTheme();
  applyTheme(saved || 'dark');
}

function toggleTheme() {
  const current = document.body.dataset.theme || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}
