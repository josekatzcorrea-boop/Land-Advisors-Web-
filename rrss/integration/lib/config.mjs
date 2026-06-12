import { loadEnv } from './load-env.mjs';

const env = { ...process.env, ...loadEnv() };

function required(name) {
  const value = env[name];
  if (!value) {
    throw new Error(
      `Falta ${name}. Copia .env.example a .env en rrss/integration/ y completa los valores.`
    );
  }
  return value;
}

export function getMetaConfig({ strict = true } = {}) {
  const read = (name, fallback = '') => (strict ? required(name) : env[name] || fallback);

  return {
    appId: read('META_APP_ID', ''),
    appSecret: read('META_APP_SECRET', ''),
    pageAccessToken: read('META_PAGE_ACCESS_TOKEN', ''),
    igUserId: read('META_IG_USER_ID', ''),
    pageId: env.META_PAGE_ID || '',
    graphVersion: env.META_GRAPH_VERSION || 'v22.0',
  };
}

export function graphBaseUrl(version) {
  return `https://graph.facebook.com/${version}`;
}
