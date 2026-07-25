/**
 * Mock data — everything in this app that is invented rather than fetched.
 *
 * DummyJSON returns real-looking people, but nothing a CRM actually needs:
 * no pipeline status, no deal value, no signup date. Those fields are made up
 * here. Rule of thumb: if a value looks like business data and you can't point
 * to it in the API response, it was born in this file.
 *
 * Load after clients-data.js.
 */

/** Deal size between $500 and $10,000. */
function mockDealValue() {
  return Math.floor(Math.random() * (10000 - 500 + 1)) + 500;
}

/** Placeholder avatar, drawn from the client's first name. */
function mockAvatarUrl(name) {
  const firstName = String(name || '').trim().split(/\s+/)[0] || 'user';
  return `https://dummyjson.com/icon/${encodeURIComponent(firstName)}/128`;
}

/** The API has no signup date, so seeded clients are dated at first load. */
function mockCreatedAt() {
  return new Date().toISOString();
}

/** Ready-made account so the app can be reviewed without signing up first. */
const DEMO_ACCOUNT = {
  fullName: 'Demo User',
  email: 'demo@test.com',
  password: 'demo1234',
  company: '10X Sales',
};

async function ensureDemoUser() {
  if (findUserByEmail(DEMO_ACCOUNT.email)) return;
  await registerUser(DEMO_ACCOUNT);
}
