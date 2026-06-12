#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { publishInstagramPost, MetaApiError } from '../lib/meta-client.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function usage() {
  console.log(`Uso:
  node scripts/publish-instagram.mjs --payload <archivo.json>
  node scripts/publish-instagram.mjs --caption "Texto" --image <url1> [--image <url2> ...]

El JSON debe incluir:
  caption_ig (o caption)
  image_urls (array de URLs públicas HTTPS)
`);
}

function parseArgs(argv) {
  const args = { images: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--payload') args.payload = argv[++i];
    else if (arg === '--caption') args.caption = argv[++i];
    else if (arg === '--image') args.images.push(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
  }

  return args;
}

function loadPayload(filePath) {
  const resolved = path.resolve(filePath);
  const raw = fs.readFileSync(resolved, 'utf8');
  const payload = JSON.parse(raw);

  const caption = payload.caption_ig || payload.caption;
  const imageUrls = payload.image_urls || payload.imageUrls;

  if (!caption) {
    throw new Error('El payload necesita caption_ig o caption.');
  }
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new Error('El payload necesita image_urls con al menos una URL pública.');
  }

  return { caption, imageUrls, id: payload.id || null };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  let caption;
  let imageUrls;
  let postId = null;

  if (args.payload) {
    ({ caption, imageUrls, id: postId } = loadPayload(args.payload));
  } else if (args.caption && args.images.length > 0) {
    caption = args.caption;
    imageUrls = args.images;
  } else {
    usage();
    process.exitCode = 1;
    return;
  }

  try {
    console.log('Publicando en Instagram...');
    if (postId) console.log(`Post: ${postId}`);
    console.log(`Imágenes: ${imageUrls.length}`);

    const result = await publishInstagramPost({ caption, imageUrls });
    console.log('\nPublicado correctamente.');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    if (error instanceof MetaApiError) {
      console.error('\nError Meta API:', error.message);
      if (error.payload?.error) {
        console.error(JSON.stringify(error.payload.error, null, 2));
      }
    } else {
      console.error('\nError:', error.message);
    }
    process.exitCode = 1;
  }
}

main();
