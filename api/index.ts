// Vercel Serverless Function for Dynamic Open Graph & Post Images
// Powered by Firestore REST API (Fast, 0-dependency, bulletproof on Vercel)

interface PostData {
  title: string;
  summary: string;
  content: string;
  imageBuffer?: Buffer;
  imageMime?: string;
  imageUrl?: string;
  category?: string;
  createdAt?: string;
}

const memoryCache = new Map<string, { data: PostData; time: number }>();

async function fetchPostFromFirestore(postId: string): Promise<PostData | null> {
  const cached = memoryCache.get(postId);
  if (cached && Date.now() - cached.time < 60000) {
    return cached.data;
  }

  const cleanId = postId.replace(/\.(?:jpg|jpeg|png|webp)$/i, '');
  const url = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0360487518/databases/ai-studio-rajababumehtadig-e31d8ee4-7431-4f52-a943-99ab02ac110a/documents/posts/${cleanId}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json: any = await res.json();
    const fields = json.fields || {};

    const content = fields.content?.stringValue || '';
    const lines = content.split('\n').filter((l: string) => l.trim().length > 0);
    const rawHeadline = lines[0] ? lines[0].replace(/^#+\s*/, '').trim() : '';
    const title = rawHeadline.length > 0 ? rawHeadline.slice(0, 120) : 'Official Update';
    const summary = content.replace(/\s+/g, ' ').trim().slice(0, 200) || title;
    const category = fields.category?.stringValue || 'News';
    const createdAt = fields.createdAt?.timestampValue || new Date().toISOString();

    let imageBuffer: Buffer | undefined;
    let imageMime: string | undefined;
    let imageUrl: string | undefined;

    const imgArr = fields.images?.arrayValue?.values;
    if (imgArr && imgArr.length > 0 && imgArr[0].stringValue) {
      const firstImg = imgArr[0].stringValue;
      const match = firstImg.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        imageMime = match[1];
        imageBuffer = Buffer.from(match[2], 'base64');
      } else if (firstImg.startsWith('http://') || firstImg.startsWith('https://')) {
        imageUrl = firstImg;
      }
    }

    const post: PostData = {
      title,
      summary,
      content,
      imageBuffer,
      imageMime,
      imageUrl,
      category,
      createdAt,
    };

    memoryCache.set(postId, { data: post, time: Date.now() });
    return post;
  } catch (err) {
    console.error(`Error fetching post ${cleanId}:`, err);
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

export default async function handler(req: any, res: any) {
  const reqUrl = req.url || '/';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'rajababumehta.com.np';
  const protocol = 'https';
  const baseUrl = `${protocol}://${host}`;

  // 1. Direct Image Endpoint for WhatsApp and Facebook (.jpg)
  const imgMatch = reqUrl.match(/(?:\/api\/post-image\/|\/posts\/)([a-zA-Z0-9_\-]+)(?:\.jpg|\/image\.jpg|$)/);
  if (reqUrl.includes('/api/post-image/') || reqUrl.includes('/image.jpg')) {
    const rawId = imgMatch ? imgMatch[1] : '';
    const postId = rawId.replace(/\.(?:jpg|jpeg|png|webp)$/i, '');
    const post = await fetchPostFromFirestore(postId);

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

    // Default fallback brand avatar
    res.writeHead(302, { Location: `${baseUrl}/brand-avatar.png` });
    return res.end();
  }

  // 2. Extract Post ID from /posts/:id, /news/:id, or ?post=:id
  let targetPostId: string | null = null;
  try {
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
  } catch {}

  const post = targetPostId ? await fetchPostFromFirestore(targetPostId) : null;

  if (targetPostId && post) {
    const safeTitle = escapeHtml(post.title);
    const safeDesc = escapeHtml(post.summary);
    const postUrl = `${baseUrl}/posts/${targetPostId}`;
    const imageUrl = `${baseUrl}/api/post-image/${targetPostId}.jpg`;
    const safeImg = escapeHtml(imageUrl);

    const newsJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": post.title,
      "image": [imageUrl],
      "datePublished": post.createdAt,
      "dateModified": post.createdAt,
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
        "@type": "NewsMediaOrganization",
        "name": "Rajababu Mehta News",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/brand-avatar.png`
        }
      },
      "description": post.summary
    });

    const html = `<!doctype html>
<html lang="ne" class="scroll-smooth dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle} | Rajababu Mehta News</title>
    <link rel="canonical" href="${postUrl}" />
    <link rel="icon" type="image/png" href="/brand-avatar.png" />
    <meta name="description" content="${safeDesc}" />
    <meta name="author" content="Rajababu Mehta" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />

    <!-- Open Graph (Facebook, WhatsApp, LinkedIn) Exactly like ronbpost.com -->
    <meta property="og:locale" content="ne_NP" />
    <meta property="og:site_name" content="Rajababu Mehta News" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="og:image" content="${safeImg}" />
    <meta property="og:image:secure_url" content="${safeImg}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta property="article:published_time" content="${post.createdAt}" />
    <meta property="article:author" content="https://www.facebook.com/share/1JMEFsQwNA/" />
    <meta property="article:publisher" content="https://www.facebook.com/share/1JMEFsQwNA/" />
    <meta property="article:section" content="${escapeHtml(post.category || 'News')}" />

    <!-- Twitter Card (summary_large_image) -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImg}" />
    <meta name="twitter:image:alt" content="${safeTitle}" />

    <script type="application/ld+json">${newsJsonLd}</script>
  </head>
  <body class="bg-[#0a0b0e] text-[#f6f3f2]">
    <div id="root"></div>
    <script>
      // Automatically redirect to SPA view while keeping path
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/posts/')) {
        sessionStorage.setItem('open_post_id', '${targetPostId}');
      }
    </script>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.end(html);
  }

  // Fallback redirect to homepage
  res.writeHead(302, { Location: '/' });
  return res.end();
}
