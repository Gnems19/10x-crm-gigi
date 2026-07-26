/**
 * Shared shell for protected pages: active link, theme toggle, logout.
 */
function initNav(activePage) {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === activePage) {
      link.classList.add('active');
      // On phones these links are a tab bar, where the current tab is a
      // landmark rather than just a styled link.
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });

  document.querySelectorAll('[data-logout]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      logoutUser();
    });
  });
}
