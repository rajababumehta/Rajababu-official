import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

const DATA_DIR = path.join(__dirname, 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial fallback moments
const INITIAL_FALLBACK_POSTS = [
  {
    id: 'post-rajababu-official-launch',
    titleEn: 'Official News & Editorial Channel Launched by Rajababu Mehta',
    titleNe: 'राजाबाबु मेहताद्वारा आधिकारिक न्युज तथा प्राविधिक लेख च्यानलको शुभारम्भ',
    descEn: 'Welcome to my official news and tech editorial channel! Here, I will regularly share technical insights on AI tools, website design trends, modern web performance, and digital solutions for Nepal and beyond. Stay tuned for tutorials, project breakdowns, and tech updates.',
    descNe: 'मेरो आधिकारिक न्युज तथा प्राविधिक लेख च्यानलमा यहाँहरूलाई हार्दिक स्वागत छ! यस च्यानलमा म नियमित रूपमा एआई उपकरणहरू, आधुनिक वेबसाइट डिजाइन, वेब कार्यसम्पादन र नेपालमा डिजिटल रूपान्तरण सम्बन्धी विचार र सूचनाहरू प्रस्तुत गर्नेछु। नयाँ प्रविधि र अनुसन्धानका अपडेटहरूका लागि जोडिनुहोस्।',
    imgUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhi7Uh94xTz0y-F0J_tapw44abY8zaSaDjrnGVWMyV-Odly0GMfSYtxK8FVOnFsFi0Nw_IveBY14ECZbwVtn2ab2u2OvbFFjr65hVXXuQKDmFh-U3RzfY1nOfUUF5d11Rjx6cWLUBamvlr4FrpncgobVp_itVNzzeXUKiFeD1UppSfItN2dxNhMq9Tu_JUO/s1372/20602.jpg',
    likes: 28,
    category: 'Notice',
    date: 'Oct 5, 2026',
    isUserUploaded: false,
  },
  {
    id: 'post-ai-technology-nepal',
    titleEn: 'How Artificial Intelligence is Shaping the Future of Web Development',
    titleNe: 'आर्टिफिसियल इन्टेलिजेन्स (AI) ले कसरी वेबसाइट विकासको भविष्य परिवर्तन गर्दैछ?',
    descEn: 'From intelligent user interfaces to automated code optimization, AI tools have transformed how modern web applications are engineered. For students, entrepreneurs, and developers in Birgunj and throughout Nepal, mastering AI-assisted design and high-speed web standards opens unprecedented opportunities.',
    descNe: 'इन्टेलिजेन्ट युजर इन्टरफेसदेखि स्वचालित कोड अप्टिमाइजेसनसम्म, एआईले आधुनिक वेब एप्लिकेसन निर्माणको तरिका बदलिदिएको छ। वीरगञ्ज र समग्र नेपालका विद्यार्थी, उद्यमी तथा डेभलपरहरूका लागि एआई-सहायक डिजाइन र उच्च-गतिका वेब प्रविधि सिक्नु ठूलो अवसर हो।',
    imgUrl: '',
    likes: 42,
    category: 'AI & Technology',
    date: 'Oct 4, 2026',
    isUserUploaded: false,
  },
  {
    id: 'post-birgunj-digital-business',
    titleEn: 'Digital Transformation: Why Every Local Business Needs a High-Performance Website',
    titleNe: 'डिजिटल रूपान्तरण: स्थानीय व्यवसाय तथा स्टार्टअपहरूका लागि आधुनिक वेबसाइट किन अनिवार्य छ?',
    descEn: 'In today\'s fast-moving digital economy, a verified and responsive online presence creates trust, attracts new clients, and expands reach beyond local borders. A lightweight, mobile-optimized website is the foundation of digital credibility.',
    descNe: 'आजको डिजिटल युगमा मोबाइल-अनुकूल र द्रुत गतिको वेबसाइटले व्यवसायको विश्वसनीयता बढाउनुका साथै ग्राहकलाई २४ सै घण्टा सेवाको जानकारी दिन मद्दत गर्दछ। आफ्नो ब्रान्डलाई स्थापित गर्न वेबसाइट पहिलो र भरपर्दो खुड्किलो हो।',
    imgUrl: '',
    likes: 35,
    category: 'Web Development',
    date: 'Oct 3, 2026',
    isUserUploaded: false,
  },
];

// Helper to read posts safely
function readPosts(): any[] {
  try {
    if (!fs.existsSync(POSTS_FILE)) {
      fs.writeFileSync(POSTS_FILE, JSON.stringify(INITIAL_FALLBACK_POSTS, null, 2), 'utf-8');
      return INITIAL_FALLBACK_POSTS;
    }
    const raw = fs.readFileSync(POSTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_FALLBACK_POSTS;
  } catch (err) {
    console.error('Error reading posts file:', err);
    return INITIAL_FALLBACK_POSTS;
  }
}

// Helper to write posts safely
function writePosts(posts: any[]) {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing posts file:', err);
  }
}

// Helper to read comments safely
function readComments(): Record<string, any[]> {
  try {
    if (!fs.existsSync(COMMENTS_FILE)) {
      fs.writeFileSync(COMMENTS_FILE, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const raw = fs.readFileSync(COMMENTS_FILE, 'utf-8');
    return JSON.parse(raw) || {};
  } catch (err) {
    console.error('Error reading comments file:', err);
    return {};
  }
}

// Helper to write comments safely
function writeComments(comments: Record<string, any[]>) {
  try {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing comments file:', err);
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // =========================================================================
  // PUBLIC POSTS API ENDPOINTS (ACCESSIBLE TO ALL USERS & ADMIN GLOBALLY)
  // =========================================================================

  // GET /api/posts - Public endpoint returning all published posts
  app.get('/api/posts', (_req: Request, res: Response) => {
    const posts = readPosts();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({ success: true, posts });
  });

  // POST /api/posts - Admin publishes news article / post visible to everyone
  app.post('/api/posts', (req: Request, res: Response) => {
    try {
      const {
        id,
        titleEn,
        titleNe,
        descEn,
        descNe,
        imgUrl,
        likes,
        category,
        date,
        isUserUploaded,
      } = req.body;

      if (!titleEn && !titleNe) {
        return res.status(400).json({ success: false, message: 'Title is required.' });
      }

      const posts = readPosts();
      const newPostId = id || `post-${Date.now()}`;

      const newPost = {
        id: newPostId,
        titleEn: titleEn || titleNe || 'Untitled Article',
        titleNe: titleNe || titleEn || 'शीर्षकविहीन समाचार',
        descEn: descEn || descNe || '',
        descNe: descNe || descEn || '',
        imgUrl: imgUrl || '',
        likes: typeof likes === 'number' ? likes : 0,
        category: category || 'AI & Technology',
        date:
          date ||
          new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        isUserUploaded: isUserUploaded ?? true,
        publishedAt: new Date().toISOString(),
      };

      // Filter out duplicate if it already exists and prepend new post
      const updated = [newPost, ...posts.filter((p: any) => p.id !== newPostId)];
      writePosts(updated);

      console.log(`[API] New public post published: "${newPost.titleEn}" (ID: ${newPost.id})`);
      return res.status(201).json({ success: true, post: newPost, posts: updated });
    } catch (err: any) {
      console.error('Error creating post:', err);
      return res.status(500).json({ success: false, message: err?.message || 'Failed to save post.' });
    }
  });

  // DELETE /api/posts/:id - Remove post
  app.delete('/api/posts/:id', (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      const posts = readPosts();
      const updated = posts.filter((p: any) => p.id !== postId);
      writePosts(updated);
      return res.json({ success: true, message: 'Post deleted successfully.' });
    } catch (err: any) {
      console.error('Error deleting post:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete post.' });
    }
  });

  // POST /api/posts/:id/like - Like or unlike post persistently for all visitors
  app.post('/api/posts/:id/like', (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      const { action } = req.body; // 'like' | 'unlike'
      const posts = readPosts();
      let newLikes = 0;
      let found = false;

      const updated = posts.map((p: any) => {
        if (p.id === postId) {
          found = true;
          const current = typeof p.likes === 'number' ? p.likes : 0;
          newLikes = action === 'unlike' ? Math.max(0, current - 1) : current + 1;
          return { ...p, likes: newLikes };
        }
        return p;
      });

      if (found) {
        writePosts(updated);
      }
      return res.json({ success: true, likes: newLikes });
    } catch (err: any) {
      console.error('Error updating likes:', err);
      return res.status(500).json({ success: false, message: 'Failed to update like.' });
    }
  });

  // GET /api/comments - Get all public visitor comments
  app.get('/api/comments', (_req: Request, res: Response) => {
    const comments = readComments();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({ success: true, comments });
  });

  // POST /api/comments - Add visitor comment
  app.post('/api/comments', (req: Request, res: Response) => {
    try {
      const { momentId, author, text } = req.body;
      if (!momentId || !text) {
        return res.status(400).json({ success: false, message: 'Missing momentId or text.' });
      }

      const commentsMap = readComments();
      const currentList = commentsMap[momentId] || [];
      const newComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        momentId,
        author: author?.trim() || 'Anonymous Reader',
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };

      commentsMap[momentId] = [newComment, ...currentList];
      writeComments(commentsMap);

      return res.status(201).json({ success: true, comment: newComment });
    } catch (err: any) {
      console.error('Error saving comment:', err);
      return res.status(500).json({ success: false, message: 'Failed to save comment.' });
    }
  });

  // =========================================================================
  // FRONTEND INTEGRATION: VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD)
  // =========================================================================
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-Stack Server] Rajababu Mehta Portfolio running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
