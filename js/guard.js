/**
 * Auth Guard (P0.1) — one shared function for all pages.
 * Protected pages: redirect to login if no session.
 * Public pages: redirect to dashboard if session exists.
 */
function guardPage(options = {}) {
  const { requireAuth = false, redirectIfAuth = false } = options;
  const session = getSession();

  if (requireAuth && !session) {
    window.location.href = 'index.html';
    return false;
  }

  if (redirectIfAuth && session) {
    window.location.href = 'dashboard.html';
    return false;
  }

  return true;
}
