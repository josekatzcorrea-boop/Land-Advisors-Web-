#!/usr/bin/env node
import {
  getInstagramAccountInfo,
  listConnectedPages,
  resolveInstagramUserIdFromPage,
  MetaApiError,
} from '../lib/meta-client.mjs';
import { getMetaConfig } from '../lib/config.mjs';

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  try {
    const config = getMetaConfig();

    printSection('Configuración cargada');
    console.log(`Graph API: ${config.graphVersion}`);
    console.log(`IG user id configurado: ${config.igUserId}`);
    console.log(`Page id configurado: ${config.pageId || '(no definido)'}`);

    printSection('Cuenta Instagram');
    const ig = await getInstagramAccountInfo();
    console.log(`@${ig.username} (${ig.name || 'sin nombre'})`);
    console.log(`Seguidores: ${ig.followers_count ?? 'n/d'} · Publicaciones: ${ig.media_count ?? 'n/d'}`);

    printSection('Páginas conectadas al token');
    const pages = await listConnectedPages();
    const data = pages.data || [];
    if (data.length === 0) {
      console.log('No se encontraron páginas. Revisa permisos del token.');
    } else {
      for (const page of data) {
        const igAccount = page.instagram_business_account;
        const igLabel = igAccount
          ? `IG vinculado: ${igAccount.id}${igAccount.username ? ` (@${igAccount.username})` : ''}`
          : 'Sin Instagram vinculado';
        console.log(`- ${page.name} [${page.id}] · ${igLabel}`);
      }
    }

    if (config.pageId) {
      printSection('Validación página → Instagram');
      const resolved = await resolveInstagramUserIdFromPage(config.pageId);
      const matches = resolved.id === config.igUserId;
      console.log(
        `Instagram resuelto: ${resolved.id}${resolved.username ? ` (@${resolved.username})` : ''}`
      );
      console.log(matches ? 'OK: META_IG_USER_ID coincide con la página.' : 'ATENCIÓN: META_IG_USER_ID no coincide.');
    }

    printSection('Resultado');
    console.log('Conexión lista para publicar vía Graph API.');
  } catch (error) {
    if (error instanceof MetaApiError) {
      console.error('\nError Meta API:', error.message);
      if (error.payload?.error) {
        console.error(JSON.stringify(error.payload.error, null, 2));
      }
      process.exitCode = 1;
      return;
    }

    console.error('\nError:', error.message);
    process.exitCode = 1;
  }
}

main();
