import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firestore for Server-Side Open Graph & Meta Tag Generation
let firestoreDb: any = null;
try {
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const existingApps = getApps();
    const serverApp = existingApps.find((a) => a.name === 'server-og-app') ||
      initializeApp(firebaseConfig, 'server-og-app');
    firestoreDb = getFirestore(serverApp, firebaseConfig.firestoreDatabaseId);
  }
} catch (err) {
  console.warn('Server Firestore initialization note:', err);
}

interface CachedPost {
  title: string;
  summary: string;
  imageBuffer?: Buffer;
  imageMime?: string;
  imageUrl?: string;
  category?: string;
  fetchedAt: number;
}

// In-memory cache to keep response times under 10ms for crawlers
const postCache = new Map<string, CachedPost>();

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
    const headline = rawHeadline.length > 0 ? rawHeadline.slice(0, 100) : 'Official Update by Rajababu Mehta';
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
    console.warn(`Error fetching post ${postId} on server:`, err);
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
  // Use clean news headline without website promotional bio
  const safeTitle = escapeHtml(post.title);
  const safeDesc = escapeHtml(post.summary);
  const safeImg = escapeHtml(imageUrl);
  const safeUrl = escapeHtml(postUrl);
  const siteName = escapeHtml('Rajababu Mehta News');

  let output = html;

  // 1. Update <title>
  output = output.replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);

  // 2. CRITICAL: Update Canonical URL so Facebook scraper does NOT redirect to homepage!
  output = output.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${safeUrl}" />`
  );

  // 3. Update description
  output = output.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );

  // 4. Update Open Graph tags for Facebook / WhatsApp / LinkedIn
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
    /<meta\s+property="og:image:width"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image:width" content="1200" />`
  );
  output = output.replace(
    /<meta\s+property="og:image:height"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:image:height" content="630" />`
  );

  // 5. Update Twitter Card tags (summary_large_image like ronbpost.com)
  output = output.replace(
    /<meta\s+name="twitter:card"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:card" content="summary_large_image" />`
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

  // 6. Strip profile:* tags so Facebook never classifies the page as a user profile
  output = output.replace(/<meta\s+property="profile:[^"]+"\s+content="[^"]*"\s*\/?>\s*/gi, '');

  // 7. Replace Person Schema with NewsArticle Schema (like ronbpost.com)
  const origin = postUrl.replace(/\/(posts|post)\/.*$/, '');
  const newsArticleJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "image": [imageUrl],
    "datePublished": new Date(post.fetchedAt).toISOString(),
    "dateModified": new Date(post.fetchedAt).toISOString(),
    "author": {
      "@type": "Person",
      "name": "Rajababu Mehta"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Rajababu Mehta News",
      "logo": {
        "@type": "ImageObject",
        "url": `${origin}/brand-avatar.png`
      }
    },
    "description": post.summary
  });

  output = output.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">${newsArticleJsonLd}</script>`
  );

  return output;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // -------------------------------------------------------------
  // 1. Direct Image Endpoint for Facebook & WhatsApp Crawlers (.jpg)
  // -------------------------------------------------------------
  const handleImageRequest = async (req: express.Request, res: express.Response) => {
    const rawParam = req.params.postId;
    const rawId = Array.isArray(rawParam) ? rawParam[0] : (rawParam || '');
    const postId = String(rawId).replace(/\.(?:jpg|jpeg|png|webp)$/i, '');
    const post = await getPostData(postId);

    if (post?.imageBuffer && post.imageMime) {
      res.setHeader('Content-Type', post.imageMime);
      res.setHeader('Content-Length', post.imageBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      return res.send(post.imageBuffer);
    }

    if (post?.imageUrl) {
      return res.redirect(302, post.imageUrl);
    }

    // Fallback: serve high-res brand portrait
    const fallbackPath = path.resolve(__dirname, 'public', 'brand-avatar.png');
    if (fs.existsSync(fallbackPath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(fallbackPath);
    }

    res.status(404).send('Image not found');
  };

  app.get('/api/post-image/:postId', handleImageRequest);
  app.get('/posts/:postId/image.jpg', handleImageRequest);

  // -------------------------------------------------------------
  // 2. Open Graph & Social Preview HTML Middleware
  // -------------------------------------------------------------
  let vite: any = null;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
  }

  // Intercept requests containing ?post=ID or /posts/:id to render exact Open Graph metadata
  app.use(async (req, res, next) => {
    // Only inspect GET requests that ask for HTML
    if (req.method !== 'GET') return next();

    // Check for post ID in query params (?post=...) or URL path (/posts/...)
    let targetPostId: string | null = null;
    if (typeof req.query.post === 'string' && req.query.post.trim().length > 0) {
      targetPostId = req.query.post.trim();
    } else {
      const pathMatch = req.path.match(/^\/(?:posts|post|p)\/([a-zA-Z0-9_\-]+)/);
      if (pathMatch) {
        targetPostId = pathMatch[1];
      }
    }

    // If no post parameter or looking for static assets, pass to next middleware
    if (!targetPostId) return next();
    if (req.path.startsWith('/assets') || req.path.startsWith('/src') || req.path.startsWith('/@') || req.path.includes('.')) {
      return next();
    }

    try {
      const post = await getPostData(targetPostId);
      if (!post) return next();

      const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const baseUrl = `${protocol}://${host}`;
      const postUrl = `${baseUrl}/posts/${targetPostId}`;
      const imageUrl = `${baseUrl}/api/post-image/${targetPostId}.jpg`;

      if (!isProduction && vite) {
        const rawTemplate = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const enriched = injectPostOpenGraph(rawTemplate, post, postUrl, imageUrl);
        const transformed = await vite.transformIndexHtml(req.originalUrl, enriched);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(transformed);
      } else {
        const prodIndexPath = path.resolve(__dirname, 'dist', 'index.html');
        if (fs.existsSync(prodIndexPath)) {
          const rawTemplate = fs.readFileSync(prodIndexPath, 'utf-8');
          const enriched = injectPostOpenGraph(rawTemplate, post, postUrl, imageUrl);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(enriched);
        }
      }
    } catch (err) {
      console.warn('Post OpenGraph generation note:', err);
    }

    next();
  });

  // -------------------------------------------------------------
  // 3. Vite or Static Assets Routing
  // -------------------------------------------------------------
  if (!isProduction && vite) {
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
