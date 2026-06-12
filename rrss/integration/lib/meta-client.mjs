import { getMetaConfig, graphBaseUrl } from './config.mjs';

export class MetaApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'MetaApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function graphRequest(pathname, { method = 'GET', params = {}, body } = {}) {
  const config = getMetaConfig();
  const url = new URL(`${graphBaseUrl(config.graphVersion)}${pathname}`);
  url.searchParams.set('access_token', config.pageAccessToken);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    const message =
      payload?.error?.message ||
      `Meta API respondió ${response.status} en ${pathname}`;
    throw new MetaApiError(message, { status: response.status, payload });
  }

  return payload;
}

export async function getInstagramAccountInfo() {
  const config = getMetaConfig();
  return graphRequest(`/${config.igUserId}`, {
    params: {
      fields: 'id,username,name,profile_picture_url,followers_count,media_count',
    },
  });
}

export async function listConnectedPages() {
  return graphRequest('/me/accounts', {
    params: { fields: 'id,name,access_token,instagram_business_account' },
  });
}

export async function resolveInstagramUserIdFromPage(pageId = '') {
  const config = getMetaConfig();
  const targetPageId = pageId || config.pageId;
  if (!targetPageId) {
    throw new Error('Define META_PAGE_ID o pasa pageId para resolver el IG user id.');
  }

  const page = await graphRequest(`/${targetPageId}`, {
    params: { fields: 'instagram_business_account{id,username}' },
  });

  const ig = page.instagram_business_account;
  if (!ig?.id) {
    throw new Error(
      'La página no tiene Instagram Business/Creator vinculado. Conéctalo en Meta Business Suite.'
    );
  }

  return ig;
}

export async function createImageContainer({ imageUrl, caption, isCarouselItem = false }) {
  const config = getMetaConfig();
  return graphRequest(`/${config.igUserId}/media`, {
    method: 'POST',
    params: {
      image_url: imageUrl,
      caption: isCarouselItem ? undefined : caption,
      is_carousel_item: isCarouselItem ? 'true' : undefined,
    },
  });
}

export async function createCarouselContainer({ childIds, caption }) {
  const config = getMetaConfig();
  return graphRequest(`/${config.igUserId}/media`, {
    method: 'POST',
    params: {
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption,
    },
  });
}

export async function publishContainer(creationId) {
  const config = getMetaConfig();
  return graphRequest(`/${config.igUserId}/media_publish`, {
    method: 'POST',
    params: { creation_id: creationId },
  });
}

export async function getContainerStatus(creationId) {
  const config = getMetaConfig();
  return graphRequest(`/${creationId}`, {
    params: { fields: 'id,status,status_code' },
  });
}

async function waitForContainerReady(creationId, { timeoutMs = 120000, intervalMs = 3000 } = {}) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const status = await getContainerStatus(creationId);
    if (status.status_code === 'FINISHED') return status;
    if (status.status_code === 'ERROR') {
      throw new MetaApiError('Meta no pudo procesar el contenedor de medios.', {
        payload: status,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new MetaApiError('Tiempo de espera agotado esperando que Meta procese las imágenes.');
}

export async function publishInstagramPost({ caption, imageUrls }) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new Error('imageUrls debe incluir al menos una URL pública.');
  }

  if (imageUrls.length === 1) {
    const container = await createImageContainer({
      imageUrl: imageUrls[0],
      caption,
    });
    await waitForContainerReady(container.id);
    return publishContainer(container.id);
  }

  const childIds = [];
  for (const imageUrl of imageUrls) {
    const child = await createImageContainer({
      imageUrl,
      isCarouselItem: true,
    });
    await waitForContainerReady(child.id);
    childIds.push(child.id);
  }

  const carousel = await createCarouselContainer({
    childIds,
    caption,
  });
  await waitForContainerReady(carousel.id);
  return publishContainer(carousel.id);
}
