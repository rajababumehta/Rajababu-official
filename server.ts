import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

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

interface CachedImageItem {
  imageBuffer?: Buffer;
  imageMime?: string;
  imageUrl?: string;
}

interface CachedPost {
  title: string;
  summary: string;
  fullContent?: string;
  imageBuffer?: Buffer;
  imageMime?: string;
  imageUrl?: string;
  imagesList?: CachedImageItem[];
  category?: string;
  fetchedAt: number;
}

interface LightweightFeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorPhoto: string;
  content: string;
  contentNe: string;
  images: string[];
  category: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
  isPublished: boolean;
}

// In-memory cache to keep response times under 10ms for crawlers & visitors
const postCache = new Map<string, CachedPost>();
let feedCache: { posts: LightweightFeedPost[]; fetchedAt: number } | null = null;
let feedFetchPromise: Promise<LightweightFeedPost[]> | null = null;

function buildCachedPostFromData(postId: string, data: any): CachedPost {
  const lines = (data.content || '').split('\n').filter((l: string) => l.trim().length > 0);
  const rawHeadline = lines[0] ? lines[0].replace(/^#+\s*/, '').trim() : '';
  const headline = rawHeadline.length > 0 ? rawHeadline.slice(0, 100) : 'Official Update by Rajababu Mehta';
  const summary = (data.content || '').replace(/\s+/g, ' ').trim().slice(0, 200) || headline;

  const imagesList: CachedImageItem[] = [];
  if (Array.isArray(data.images)) {
    for (const rawImg of data.images) {
      if (typeof rawImg !== 'string') continue;
      const match = rawImg.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        imagesList.push({
          imageMime: match[1],
          imageBuffer: Buffer.from(match[2], 'base64'),
        });
      } else if (rawImg.startsWith('http://') || rawImg.startsWith('https://')) {
        imagesList.push({ imageUrl: rawImg });
      }
    }
  }

  return {
    title: headline,
    summary,
    fullContent: data.content || '',
    imageBuffer: imagesList[0]?.imageBuffer,
    imageMime: imagesList[0]?.imageMime,
    imageUrl: imagesList[0]?.imageUrl,
    imagesList,
    category: data.category || 'News',
    fetchedAt: Date.now(),
  };
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

    const item = buildCachedPostFromData(postId, snap.data());
    postCache.set(postId, item);
    return item;
  } catch (err) {
    console.warn(`Error fetching post ${postId} on server:`, err);
    return null;
  }
}

async function getCachedFeedPosts(forceRefresh = false): Promise<LightweightFeedPost[]> {
  if (!firestoreDb) return [];

  if (!forceRefresh && feedCache && Date.now() - feedCache.fetchedAt < 30000) {
    return feedCache.posts;
  }

  if (feedFetchPromise && !forceRefresh) {
    return feedFetchPromise;
  }

  feedFetchPromise = (async () => {
    try {
      const q = query(collection(firestoreDb, 'posts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const lightweightPosts: LightweightFeedPost[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const postId = docSnap.id;

        // Warm individual post cache too
        const cachedItem = buildCachedPostFromData(postId, data);
        postCache.set(postId, cachedItem);

        // Replace heavy base64 strings with fast HTTP image URLs
        const lightImages: string[] = [];
        if (Array.isArray(data.images)) {
          data.images.forEach((rawImg: any, idx: number) => {
            if (typeof rawImg !== 'string') return;
            if (rawImg.startsWith('data:image/')) {
              lightImages.push(idx === 0 ? `/api/post-image/${postId}.jpg` : `/api/post-image/${postId}.jpg?idx=${idx}`);
            } else if (rawImg.startsWith('http://') || rawImg.startsWith('https://') || rawImg.startsWith('/')) {
              lightImages.push(rawImg);
            }
          });
        }

        let createdAtStr = new Date().toISOString();
        if (data.createdAt?.toDate) {
          createdAtStr = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAtStr = data.createdAt;
        }

        lightweightPosts.push({
          id: postId,
          authorId: data.authorId || '',
          authorName: data.authorName || 'Rajababu Mehta',
          authorEmail: data.authorEmail || '',
          authorPhoto: '/favicon-96x96.png',
          content: data.content || '',
          contentNe: data.contentNe || '',
          images: lightImages,
          category: data.category || 'Announcement',
          likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
          commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : 0,
          createdAt: createdAtStr,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          isPublished: data.isPublished ?? true,
        });
      });

      feedCache = { posts: lightweightPosts, fetchedAt: Date.now() };
      return lightweightPosts;
    } catch (err) {
      console.warn('Feed cache refresh note:', err);
      return feedCache?.posts || [];
    } finally {
      feedFetchPromise = null;
    }
  })();

  return feedFetchPromise;
}

function injectInitialPostsScript(html: string, posts: LightweightFeedPost[]): string {
  const safeJson = JSON.stringify(posts)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return html.replace(
    '</head>',
    `<script>window.__INITIAL_POSTS__=${safeJson};</script></head>`
  );
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
  const siteName = escapeHtml('Rajababu Mehta');

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
      "name": "Rajababu Mehta",
      "url": "https://www.facebook.com/share/1JMEFsQwNA/",
      "sameAs": [
        "https://www.facebook.com/share/1JMEFsQwNA/",
        "https://aiclipzone.vercel.app/"
      ]
    },
    "publisher": {
      "@type": "Person",
      "name": "Rajababu Mehta",
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

  // 8. Pre-render article body inside <noscript> inside <div id="root"> for 100% genuine Google search indexing
  const rawBodyText = escapeHtml(post.fullContent || post.summary);
  const ssrCrawlerSnippet = `<noscript><article style="padding:24px;max-width:800px;margin:auto;"><h1>${safeTitle}</h1><p><strong>Published by Rajababu Mehta</strong></p><div>${rawBodyText.replace(/\n/g, '<br/>')}</div></article></noscript>`;
  output = output.replace('<div id="root"></div>', `<div id="root">${ssrCrawlerSnippet}</div>`);

  return output;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // -------------------------------------------------------------
  // Dynamic XML Sitemap for Real Google Search Engine Indexing
  // -------------------------------------------------------------
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'rajababumehta.com.np';
      const baseUrl = `${protocol}://${host}`;

      let postEntries = '';
      if (firestoreDb) {
        try {
          const postsCollection = collection(firestoreDb, 'posts');
          const snap = await getDocs(postsCollection);
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            const dateStr = data.createdAt
              ? new Date(data.createdAt).toISOString()
              : new Date().toISOString();
            postEntries += `
  <url>
    <loc>${baseUrl}/posts/${docSnap.id}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
          });
        } catch (dbErr) {
          console.warn('Sitemap firestore query note:', dbErr);
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/posts</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>${postEntries}
</urlset>`;

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      return res.status(200).send(sitemapXml);
    } catch (err) {
      console.warn('Sitemap generation note:', err);
      res.status(500).send('Error generating sitemap');
    }
  });

  // -------------------------------------------------------------
  // 1. Direct Image & Instant Feed API Endpoints
  // -------------------------------------------------------------
  const handleImageRequest = async (req: express.Request, res: express.Response) => {
    const rawParam = req.params.postId;
    const rawId = Array.isArray(rawParam) ? rawParam[0] : (rawParam || '');
    const postId = String(rawId).replace(/\.(?:jpg|jpeg|png|webp)$/i, '');
    const idx = Math.max(0, parseInt(String(req.query.idx || '0'), 10) || 0);
    const post = await getPostData(postId);

    const imgEntry = post?.imagesList?.[idx] || (idx === 0 ? post : undefined);

    if (imgEntry?.imageBuffer && imgEntry.imageMime) {
      res.setHeader('Content-Type', imgEntry.imageMime);
      res.setHeader('Content-Length', imgEntry.imageBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      return res.send(imgEntry.imageBuffer);
    }

    if (imgEntry?.imageUrl) {
      return res.redirect(302, imgEntry.imageUrl);
    }

    // Fallback: serve crisp brand avatar
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

  app.get('/api/posts', async (_req, res) => {
    const posts = await getCachedFeedPosts();
    res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=60');
    return res.json({ posts });
  });

  app.post('/api/posts/invalidate', async (_req, res) => {
    feedCache = null;
    postCache.clear();
    await getCachedFeedPosts(true);
    return res.json({ ok: true });
  });

  // Warm feed cache immediately on boot so the very first visitor gets 0ms response
  getCachedFeedPosts().catch(() => {});

  // -------------------------------------------------------------
  // 2. Open Graph, Social Preview & Instant Posts Hydration Middleware
  // -------------------------------------------------------------
  let vite: any = null;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
  }

  // Intercept HTML page requests to inject Open Graph metadata & initial posts for 0ms load
  app.use(async (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/assets') ||
      req.path.startsWith('/src') ||
      req.path.startsWith('/@') ||
      req.path.startsWith('/node_modules') ||
      req.path.includes('.')
    ) {
      return next();
    }

    const accept = String(req.headers.accept || '');
    const isHtmlRequest = accept.includes('text/html') || accept === '*/*' || accept === '';
    if (!isHtmlRequest) return next();

    // Check for post ID in query params (?post=...) or URL path (/posts/...)
    let targetPostId: string | null = null;
    if (typeof req.query.post === 'string' && req.query.post.trim().length > 0) {
      targetPostId = req.query.post.trim();
    } else {
      const pathMatch = req.path.match(/^\/(?:posts|post|p|news)\/([a-zA-Z0-9_\-]+)/);
      if (pathMatch) {
        targetPostId = pathMatch[1];
      }
    }

    try {
      // Wait up to 1500ms if cache is still cold so first visitor never hangs
      const initialPostsPromise = feedCache
        ? Promise.resolve(feedCache.posts)
        : Promise.race([
            getCachedFeedPosts(),
            new Promise<LightweightFeedPost[]>((resolve) => setTimeout(() => resolve([]), 1500)),
          ]);

      const [initialPosts, singlePost] = await Promise.all([
        initialPostsPromise,
        targetPostId ? getPostData(targetPostId) : Promise.resolve(null),
      ]);

      const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const baseUrl = `${protocol}://${host}`;

      const templatePath = !isProduction && vite
        ? path.resolve(__dirname, 'index.html')
        : path.resolve(__dirname, 'dist', 'index.html');

      if (!fs.existsSync(templatePath)) return next();

      let html = fs.readFileSync(templatePath, 'utf-8');

      if (targetPostId && singlePost) {
        const postUrl = `${baseUrl}/posts/${targetPostId}`;
        const imageUrl = `${baseUrl}/api/post-image/${targetPostId}.jpg`;
        html = injectPostOpenGraph(html, singlePost, postUrl, imageUrl);
      }

      if (initialPosts.length > 0) {
        html = injectInitialPostsScript(html, initialPosts);
      }

      if (!isProduction && vite) {
        html = await vite.transformIndexHtml(req.originalUrl, html);
      }

      return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (err) {
      console.warn('HTML hydration note:', err);
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
