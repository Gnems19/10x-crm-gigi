/**
 * Auth helpers: register, login, logout, current user lookup.
 */

function isValidEmailFormat(email) {
  const value = email.trim().toLowerCase();
  const at = value.indexOf('@');
  if (at < 1) return false;
  return value.slice(at + 1).includes('.');
}

function isValidPassword(password) {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((user) => user.email === normalized) || null;
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find((user) => user.id === session.userId) || null;
}

function registerUser({ fullName, email, password, company }) {
  const users = getUsers();
  const user = {
    id: Date.now(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    company: (company || '').trim(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  setUsers(users);
  return user;
}

function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { ok: false };
  }
  const session = {
    userId: user.id,
    email: user.email,
    loginAt: new Date().toISOString(),
  };
  setSession(session);
  return { ok: true, user, session };
}

function logoutUser() {
  clearSession();
  window.location.href = 'index.html';
}

function updateUserProfile(userId, { fullName, company }) {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  user.fullName = fullName.trim();
  user.company = (company || '').trim();
  setUsers(users);
  return user;
}

function updateUserPassword(userId, newPassword) {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  user.password = newPassword;
  setUsers(users);
  return user;
}

function getInitials(fullName) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
