/**
 * Profile page (P5) — edit profile, change password, reset CRM data.
 */
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

function renderProfileInfo(user) {
  document.getElementById('profile-initials').textContent = getInitials(user.fullName);
  document.getElementById('profile-name').textContent = user.fullName;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-company').textContent = user.company || '—';
  document.getElementById('profile-member-since').textContent =
    `Member since ${new Date(user.createdAt).toLocaleDateString()}`;

  document.getElementById('edit-fullName').value = user.fullName;
  document.getElementById('edit-company').value = user.company || '';
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (!guardPage({ requireAuth: true })) return;
  initNav('profile');

  const user = getCurrentUser();
  if (!user) {
    logoutUser();
    return;
  }

  renderProfileInfo(user);

  document.getElementById('profile-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    clearFormErrors(form);

    const fullName = form.fullName.value;
    if (fullName.trim().length < 3) {
      setFieldError(form.fullName, 'Full name must be at least 3 characters');
      return;
    }

    const updated = updateUserProfile(user.id, {
      fullName,
      company: form.company.value,
    });
    if (!updated) return;

    renderProfileInfo(updated);
    showToast('Profile updated ✓', 'success');
  });

  document.getElementById('password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    clearFormErrors(form);

    const currentUser = getCurrentUser();
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;
    let valid = true;

    // The stored hash cannot be read back, so the old password is checked by
    // re-deriving it rather than by comparing strings.
    const currentMatches = await verifyStoredPassword(currentUser, currentPassword);
    if (!currentMatches) {
      setFieldError(form.currentPassword, 'Current password is incorrect');
      valid = false;
    }

    if (!isValidPassword(newPassword)) {
      setFieldError(
        form.newPassword,
        'Password must be at least 8 characters and contain a letter and a number'
      );
      valid = false;
    } else if (currentMatches && newPassword === currentPassword) {
      setFieldError(
        form.newPassword,
        'New password must be different from the current one'
      );
      valid = false;
    }

    if (confirmPassword !== newPassword) {
      setFieldError(form.confirmPassword, 'Passwords do not match');
      valid = false;
    }

    if (!valid) return;

    await updateUserPassword(currentUser.id, newPassword);
    form.reset();
    showToast('Password changed ✓', 'success');
  });

  document.getElementById('reset-data').addEventListener('click', async () => {
    const confirmed = confirm(
      'Reset CRM data? This will reload the default clients from the API. Your account will not be deleted.'
    );
    if (!confirmed) return;

    const result = await resetClientsFromApi();
    if (!result.ok) {
      showToast('Could not reset data. Check your connection.', 'error');
      return;
    }
    showToast('CRM data reset. Clients reloaded from API.', 'success');
  });
});
