/**
 * Login page (P2) — index.html entry.
 */
function clearLoginErrors(form) {
  form.querySelectorAll('.field-error').forEach((el) => {
    el.textContent = '';
  });
  form.querySelectorAll('.input-error').forEach((el) => {
    el.classList.remove('input-error');
  });
  const globalError = document.getElementById('login-global-error');
  if (globalError) globalError.textContent = '';
}

function setFieldError(input, message) {
  input.classList.add('input-error');
  const errorEl = document.getElementById(`${input.id}-error`);
  if (errorEl) errorEl.textContent = message;
}

async function ensureDemoUser() {
  if (!findUserByEmail('demo@test.com')) {
    await registerUser({
      fullName: 'Demo User',
      email: 'demo@test.com',
      password: 'demo1234',
      company: '10X Sales',
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  if (!guardPage({ redirectIfAuth: true })) return;

  const globalError = document.getElementById('login-global-error');

  if (!isCryptoAvailable()) {
    if (globalError) {
      globalError.textContent =
        'Secure login needs HTTPS. Open this page over https:// or localhost.';
    }
    return;
  }

  await ensureDemoUser();

  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearLoginErrors(form);

    const email = form.email.value;
    const password = form.password.value;
    let hasFieldError = false;

    if (!email.trim()) {
      setFieldError(form.email, 'Email is required');
      hasFieldError = true;
    }

    if (!password) {
      setFieldError(form.password, 'Password is required');
      hasFieldError = true;
    }

    if (hasFieldError) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const result = await loginUser(email, password);
      if (!result.ok) {
        if (globalError) {
          globalError.textContent = 'Invalid email or password';
        }
        return;
      }
      window.location.href = 'dashboard.html';
    } finally {
      submitBtn.disabled = false;
    }
  });
});
