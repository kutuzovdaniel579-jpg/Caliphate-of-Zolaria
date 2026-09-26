import { Account, Client, OAuthProvider } from 'https://cdn.jsdelivr.net/npm/appwrite@latest/+esm';

const PROJECT_ID = '6ab7a3020022ff1b32aa';
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const ROUTE_BASE = '/discord/rtc';
const AUTH_PATH = `${ROUTE_BASE}/auth`;
const SUCCESS_PATH = `${AUTH_PATH}/success`;
const FAILURE_PATH = `${AUTH_PATH}/failure`;
const DASHBOARD_PATH = `${ROUTE_BASE}/dashboard`;
const app = document.getElementById('app');

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);
const account = new Account(client);

const discordIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4C14.82 4.33 14.61 4.77 14.46 5.11C12.88 4.87 11.31 4.87 9.76 5.11C9.61 4.77 9.39 4.33 9.21 4C7.71 4.26 6.26 4.71 4.94 5.34C2.24 9.42 1.52 13.39 1.88 17.31C3.65 18.61 5.37 19.43 7.06 19.97C7.49 19.39 7.88 18.77 8.21 18.11C7.59 17.88 6.99 17.59 6.43 17.25C6.58 17.14 6.73 17.02 6.87 16.9C10.19 18.43 13.84 18.43 17.12 16.9C17.27 17.02 17.41 17.14 17.56 17.25C17 17.59 16.4 17.88 15.78 18.11C16.11 18.77 16.5 19.39 16.93 19.97C18.62 19.43 20.34 18.61 22.11 17.31C22.54 12.75 21.34 8.81 19.27 5.33ZM8.52 14.88C7.49 14.88 6.63 13.91 6.63 12.72C6.63 11.53 7.47 10.56 8.52 10.56C9.57 10.56 10.43 11.53 10.41 12.72C10.41 13.91 9.56 14.88 8.52 14.88ZM15.49 14.88C14.46 14.88 13.6 13.91 13.6 12.72C13.6 11.53 14.44 10.56 15.49 10.56C16.54 10.56 17.4 11.53 17.38 12.72C17.38 13.91 16.54 14.88 15.49 14.88Z" fill="#C4C6D7"/>
</svg>`;

function showMessage(title, description, actionLabel, actionPath, error = '') {
  app.innerHTML = `
    <section class="panel">
      <div class="brand-mark" aria-hidden="true">Z</div>
      <p class="eyebrow">Zolarian account</p>
      <h1>${title}</h1>
      <p class="description">${description}</p>
      <a class="secondary-button" href="${actionPath}">${actionLabel}</a>
      ${error ? `<p class="error-message" role="alert"></p>` : ''}
    </section>`;
  if (error) app.querySelector('.error-message').textContent = error;
}

function renderAuth(error = '') {
  app.innerHTML = `
    <section class="panel">
      <div class="brand-mark" aria-hidden="true">Z</div>
      <p class="eyebrow">Welcome back</p>
      <h1>Sign in to continue</h1>
      <p class="description">Connect your Discord account to securely access your Zolarian dashboard.</p>
      <button class="discord-button" id="discordSignIn" type="button">${discordIcon}<span>Sign in with Discord</span></button>
      ${error ? '<p class="error-message" id="authError" role="alert"></p>' : ''}
      <p class="footnote">Your sign-in is handled securely by Discord and Appwrite.</p>
    </section>`;

  if (error) app.querySelector('#authError').textContent = error;
  app.querySelector('#discordSignIn').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.querySelector('span').textContent = 'Connecting…';
    try {
      const success = `${window.location.origin}${SUCCESS_PATH}`;
      const failure = `${window.location.origin}${FAILURE_PATH}`;
      await account.createOAuth2Token({
        provider: OAuthProvider.Discord,
        success,
        failure,
      });
    } catch (cause) {
      renderAuth(cause?.message || 'Unable to start Discord sign-in. Please try again.');
    }
  });
}

async function renderDashboard() {
  let user;
  try {
    user = await account.get();
  } catch {
    window.location.replace(AUTH_PATH);
    return;
  }

  const displayName = user.name || user.email || 'Discord user';
  const initial = [...displayName.trim()][0]?.toUpperCase() || 'U';
  app.innerHTML = `
    <section class="panel">
      <div class="user-avatar" aria-hidden="true">${initial.replace(/[&<>"']/g, '')}</div>
      <p class="eyebrow">Signed in successfully</p>
      <h1>Your dashboard</h1>
      <p class="user-name"></p>
      ${user.email ? '<p class="user-email"></p>' : ''}
      <button class="secondary-button" id="signOut" type="button">Sign out</button>
      <p class="error-message" id="dashboardError" role="alert" hidden></p>
    </section>`;
  app.querySelector('.user-name').textContent = displayName;
  if (user.email) app.querySelector('.user-email').textContent = user.email;

  app.querySelector('#signOut').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Signing out…';
    try {
      await account.deleteSession({ sessionId: 'current' });
      window.location.assign(AUTH_PATH);
    } catch (error) {
      const errorNode = app.querySelector('#dashboardError');
      errorNode.hidden = false;
      errorNode.textContent = error?.message || 'Could not sign out. Please try again.';
      button.disabled = false;
      button.textContent = 'Sign out';
    }
  });
}

async function handleOAuthSuccess() {
  const url = new URL(window.location.href);
  const secret = url.searchParams.get('secret');
  const userId = url.searchParams.get('userId');
  if (!secret || !userId) {
    showMessage('Sign-in could not be completed', 'The callback did not include the credentials needed to create your session.', 'Back to sign in', AUTH_PATH, 'Missing OAuth credentials.');
    return;
  }

  try {
    await account.createSession({ userId, secret });
    window.location.replace(DASHBOARD_PATH);
  } catch (error) {
    showMessage('Sign-in could not be completed', 'We could not create your account session. Please return to sign in and try again.', 'Back to sign in', AUTH_PATH, error?.message || 'Session creation failed.');
  }
}

async function route() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === SUCCESS_PATH) {
    await handleOAuthSuccess();
    return;
  }

  if (path === FAILURE_PATH) {
    const params = new URLSearchParams(window.location.search);
    const providerError = params.get('error_description') || params.get('error');
    showMessage('Discord sign-in failed', 'Your account was not connected. You can return and try again.', 'Back to sign in', AUTH_PATH, providerError || 'Authentication was cancelled or could not be completed.');
    return;
  }

  if (path === DASHBOARD_PATH) {
    await renderDashboard();
    return;
  }

  if (path === AUTH_PATH || path === '/') {
    try {
      await account.get();
      window.location.replace(DASHBOARD_PATH);
    } catch {
      renderAuth();
    }
    return;
  }

  window.location.replace(AUTH_PATH);
}

route();
