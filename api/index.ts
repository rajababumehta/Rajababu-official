import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface CachedPost {
  title: string;
  summary: string;
  imageBuffer?: Buffer;
  imageMime?: string;
  imageUrl?: string;
  category?: string;
  fetchedAt: number;
}

const postCache = new Map<string, CachedPost>();

// Firebase configuration for serverless runtime
const firebaseConfig = {
  projectId: "gen-lang-client-0360487518",
  appId: "1:822954278678:web:b3d9ef02cafaae3dedda37",
  apiKey: "AIzaSyC4G4zxJlahwFZgds5T_7JTgWNhwbmyDEI",
  authDomain: "gen-lang-client-0360487518.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-rajababumehtadig-e31d8ee4-7431-4f52-a943-99ab02ac110a",
  storageBucket: "gen-lang-client-0360487518.firebasestorage.app",
};

let firestoreDb: any = null;
try {
  const existingApps = getApps();
  const serverApp = existingApps.find((a) => a.name === 'vercel-og-app') ||
    initializeApp(firebaseConfig, 'vercel-og-app');
  firestoreDb = getFirestore(serverApp, firebaseConfig.firestoreDatabaseId);
} catch (err) {
  console.warn('Vercel Firestore init note:', err);
}

async function getPostData(postId: string): Promise<CachedPost | null> {
  if (!postId || !firestoreDb) return null;

  const cached = postCache.get(postId);
  if (cached && Date.now() - cached.fetchedAt < 60000) {
    return cached;
  }

  try {
    const snap = await getDoc(doc(firestoreDb, 'posts', postId));
    if (!snap.exists()) return null;

    const data = snap.data();
    const lines = (data.content || '').split('\n').filter((l: string) => l.trim().length > 0);
    const rawHeadline = lines[0] ? lines[0].replace(/^#+\s*/, '').trim() : '';
    const headline = rawHeadline.length > 0 ? rawHeadline.slice(0, 100) : 'Official Update';
    const summary = (data.content || '').replace(/\s+/g, ' ').trim().slice(0, 200) || headline;

    let imageBuffer: Buffer | undefined;
    let imageMime: string | undefined;
    let imageUrl: string | undefined;

    if (data.images && data.images.length > 0 && typeof data.images[0] === 'string') {
      const first = data.images[0];
      const match = first.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        imageMime = match[1];
        imageBuffer = Buffer.from(match[2], 'base64');
      } else if (first.startsWith('http://') || first.startsWith('https://')) {
        imageUrl = first;
      }
    }

    const item: CachedPost = {
      title: headline,
      summary,
      imageBuffer,
      imageMime,
      imageUrl,
      category: data.category || 'News',
      fetchedAt: Date.now(),
    };
    postCache.set(postId, item);
    return item;
  } catch (err) {
    console.warn(`Error fetching post ${postId} in Vercel function:`, err);
    return null;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectPostOpenGraph(
  html: string,
  post: CachedPost,
  postUrl: string,
  imageUrl: string
): string {
  const safeTitle = escapeHtml(post.title);
  const safeDesc = escapeHtml(post.summary);
  const safeImg = escapeHtml(imageUrl);
  const safeUrl = escapeHtml(postUrl);
  const siteName = escapeHtml('Rajababu Mehta News');

  let output = html;

  output = output.replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);

  output = output.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${safeUrl}" />`
  );

  output = output.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );

  output = output.replace(
    /<meta\s+property="og:site_name"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:site_name" content="${siteName}" />`
  );
  output = output.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  output = output.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  output = output.replace(
    /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:type" content="article" />
    <meta property="article:author" content="Rajababu Mehta" />
    <meta property="article:section" content="${escapeHtml(post.category || 'News')}" />`
  );
  output = output.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${safeUrl}" />`
  );
  output = output.replace(
    /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image" content="${safeImg}" />`
  );
  output = output.replace(
    /<meta\s+property="og:image:secure_url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image:secure_url" content="${safeImg}" />`
  );
  output = output.replace(
    /<meta\s+property="og:image:alt"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image:alt" content="${safeTitle}" />`
  );
  output = output.replace(
    /<meta\s+property="og:image:type"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image:type" content="${post.imageMime || 'image/jpeg'}" />`
  );

  output = output.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image" content="${safeImg}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:image:alt"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:image:alt" content="${safeTitle}" />`
  );

  return output;
}

export default async function handler(req: any, res: any) {
  const reqUrl = req.url || '/';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'rajababumehta.com.np';
  const protocol = 'https';
  const baseUrl = `${protocol}://${host}`;

  // 1. Dedicated Image Endpoint
  const imgMatch = reqUrl.match(/^\/api\/post-image\/([a-zA-Z0-9_\-]+)/);
  if (imgMatch) {
    const postId = imgMatch[1];
    const post = await getPostData(postId);
    if (post?.imageBuffer && post.imageMime) {
      res.setHeader('Content-Type', post.imageMime);
      res.setHeader('Content-Length', post.imageBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      return res.end(post.imageBuffer);
    }
    if (post?.imageUrl) {
      res.writeHead(302, { Location: post.imageUrl });
      return res.end();
    }
    res.writeHead(404);
    return res.end('Image not found');
  }

  // 2. Post Identification: /posts/:id or ?post=:id
  let targetPostId: string | null = null;
  const parsed = new URL(reqUrl, baseUrl);
  const postParam = parsed.searchParams.get('post');
  if (postParam) {
    targetPostId = postParam;
  } else {
    const pathMatch = parsed.pathname.match(/^\/(?:posts|post|p|news)\/([a-zA-Z0-9_\-]+)/);
    if (pathMatch) {
      targetPostId = pathMatch[1];
    }
  }

  // Find index.html
  const possiblePaths = [
    path.resolve(process.cwd(), 'dist', 'index.html'),
    path.resolve(process.cwd(), 'index.html'),
    path.resolve(__dirname, '..', 'dist', 'index.html'),
    path.resolve(__dirname, '..', 'index.html'),
  ];
  let rawHtml = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      rawHtml = fs.readFileSync(p, 'utf8');
      break;
    }
  }

  if (!rawHtml) {
    res.writeHead(500);
    return res.end('HTML template not found');
  }

  if (targetPostId) {
    const post = await getPostData(targetPostId);
    if (post) {
      const postUrl = parsed.pathname.startsWith('/posts/')
        ? `${baseUrl}/posts/${targetPostId}`
        : `${baseUrl}/?post=${targetPostId}`;
      const imageUrl = `${baseUrl}/api/post-image/${targetPostId}`;
      const enriched = injectPostOpenGraph(rawHtml, post, postUrl, imageUrl);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(enriched);
    }
  }

  // Fallback default HTML
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.end(rawHtml);
}
