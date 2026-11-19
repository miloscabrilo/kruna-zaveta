export const environment = {
  // Base URL of the kruna-zaveta-backend API. Relative by default, so the backend can be served
  // behind the same domain (reverse proxy `/api` → backend). Use an absolute URL if it runs elsewhere.
  apiUrl: '/api',
  // Cloudflare Turnstile site key (public). PLACEHOLDER: this is Cloudflare's test key that always passes –
  // replace it with the real key for krunazaveta.com (the secret key goes into the backend's TURNSTILE_SECRET_KEY).
  turnstileSiteKey: '1x00000000000000000000AA',
};
