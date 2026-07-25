/**
 * Sign Up page (P1) — validation and registration flow.
 */
function clearFieldErrors(form) {
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

function validateSignupForm(form) {
  clearFieldErrors(form);

  const fullName = form.fullName.value;
  const email = form.email.value;
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  let valid = true;

  if (fullName.trim().length < 3) {
    setFieldError(form.fullName, 'Full name must be at least 3 characters');
    valid = false;
  }

  if (!isValidEmailFormat(email)) {
    setFieldError(form.email, 'Please enter a valid email address');
    valid = false;
  } else if (findUserByEmail(email)) {
    setFieldError(form.email, 'An account with this email already exists');
    valid = false;
  }

  if (!isValidPassword(password)) {
    setFieldError(
      form.password,
      'Password must be at least 8 characters and contain a letter and a number'
    );
    valid = false;
  }

  if (confirmPassword !== password) {
    setFieldError(form.confirmPassword, 'Passwords do not match');
    valid = false;
  }

  return valid;
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (!guardPage({ redirectIfAuth: true })) return;

  const form = document.getElementById('signup-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateSignupForm(form)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      await registerUser({
        fullName: form.fullName.value,
        email: form.email.value,
        password: form.password.value,
        company: form.company.value,
      });
    } catch {
      showToast(
        'Could not create the account securely. Open this page over https:// or localhost.',
        'error'
      );
      submitBtn.disabled = false;
      return;
    }

    showToast('Account created successfully! Please log in.', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  });
});
