/**
 * Global toast / snack messages. No alert() for notifications.
 * Auto-dismisses after 3 seconds; X button also closes.
 */
const TOAST_VISIBLE_MS = 3000;
const TOAST_FADE_MS = 200; // must match the .toast-hiding transition in CSS

function ensureToastContainer() {
  let el = document.getElementById('toast-container');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-container';
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
}

function showToast(message, type = 'success') {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');

  const text = document.createElement('span');
  text.className = 'toast-message';
  text.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'toast-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';

  let autoDismiss;
  const remove = () => {
    clearTimeout(autoDismiss); // closing by hand cancels the pending auto-dismiss
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), TOAST_FADE_MS);
  };

  closeBtn.addEventListener('click', remove);
  toast.appendChild(text);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  autoDismiss = setTimeout(remove, TOAST_VISIBLE_MS);
}
