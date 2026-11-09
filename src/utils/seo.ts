import { FeedPost } from '../types';

/**
 * Utility function that dynamically updates the document head with specific meta tags
 * based on the currently selected post data in PostsFeedView to ensure optimal social media
 * sharing (WhatsApp, Facebook, LinkedIn, X/Twitter) and search engine indexing (Google).
 */
export const updatePostSeo = (post: FeedPost | null) => {
  if (typeof document === 'undefined' || !post) return;

  // Extract a clean headline (first line or up to 90 characters)
  const lines = post.content.split('\n').filter((l) => l.trim().length > 0);
  const rawFirstLine = lines[0] ? lines[0].replace(/^#+\s*/, '').trim() : '';
  const headline = rawFirstLine.length > 5 ? rawFirstLine.slice(0, 100) : 'Official Update by Rajababu Mehta';

  // Extract clean summary (first 160 characters without newlines)
  const summary = post.content.slice(0, 160).replace(/\s+/g, ' ').trim();
  const postUrl = `${window.location.origin}/posts/${post.id}`;

  // Ensure absolute image URL for external social crawlers (Facebook, WhatsApp, Twitter)
  let postImage = `${window.location.origin}/brand-avatar.png`;
  if (post.images && post.images.length > 0 && post.images[0]) {
    const firstImg = post.images[0];
    if (firstImg.startsWith('http://') || firstImg.startsWith('https://')) {
      postImage = firstImg;
    } else if (firstImg.startsWith('/')) {
      postImage = `${window.location.origin}${firstImg}`;
    } else if (firstImg.startsWith('data:')) {
      // Point to our Express server's dedicated binary image endpoint
      postImage = `${window.location.origin}/api/post-image/${post.id}`;
    }
  }

  // 1. Dynamic Page Title
  document.title = `${headline} | Rajababu Mehta News`;

  // Helper function to safely update or append meta elements
  const setMetaTag = (
    attributeName: 'name' | 'property',
    attributeValue: string,
    contentValue: string
  ) => {
    let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attributeName, attributeValue);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', contentValue);
  };

  // Helper function to update or append link rel elements (e.g. canonical)
  const setLinkTag = (rel: string, href: string) => {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  };

  // 2. Standard Search Metadata
  setMetaTag('name', 'description', summary);
  setMetaTag('name', 'author', 'Rajababu Mehta');
  setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
  setLinkTag('canonical', postUrl);

  // 3. OpenGraph Tags (WhatsApp, Facebook, LinkedIn, iMessage)
  setMetaTag('property', 'og:site_name', 'Rajababu Mehta News');
  setMetaTag('property', 'og:type', 'article');
  setMetaTag('property', 'og:title', headline);
  setMetaTag('property', 'og:description', summary);
  setMetaTag('property', 'og:url', postUrl);
  setMetaTag('property', 'og:image', postImage);
  setMetaTag('property', 'og:image:secure_url', postImage);
  setMetaTag('property', 'og:image:type', 'image/jpeg');
  setMetaTag('property', 'og:image:width', '1200');
  setMetaTag('property', 'og:image:height', '630');
  setMetaTag('property', 'og:image:alt', headline);
  setMetaTag('property', 'article:published_time', post.createdAt || new Date().toISOString());
  if (post.updatedAt) {
    setMetaTag('property', 'article:modified_time', post.updatedAt);
  }
  setMetaTag('property', 'article:author', 'Rajababu Mehta');
  setMetaTag('property', 'article:section', post.category || 'Technology');

  // 4. Twitter / X Card Metadata
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', headline);
  setMetaTag('name', 'twitter:description', summary);
  setMetaTag('name', 'twitter:image', postImage);
  setMetaTag('name', 'twitter:image:alt', headline);
  setMetaTag('name', 'twitter:creator', '@mrrajababumehta');

  // 5. Schema.org NewsArticle & BlogPosting JSON-LD
  let scriptEl = document.getElementById('news-article-jsonld');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'news-article-jsonld';
    scriptEl.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptEl);
  }

  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    'headline': headline,
    'description': summary,
    'articleBody': post.content,
    'datePublished': post.createdAt || new Date().toISOString(),
    'dateModified': post.updatedAt || post.createdAt || new Date().toISOString(),
    'image': [postImage],
    'author': {
      '@type': 'Person',
      'name': 'Rajababu Mehta',
      'jobTitle': 'Founder & CEO of AI Clipzone',
      'url': 'https://rajababumehta.com.np',
      'sameAs': [
        'https://aiclipzone.vercel.app/',
        'https://www.linkedin.com/in/rajababumehta',
        'https://www.facebook.com/share/19PZ6HWQdk/',
      ],
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'AI Clipzone News & Articles',
      'url': 'https://aiclipzone.vercel.app/',
      'logo': {
        '@type': 'ImageObject',
        'url': `${window.location.origin}/brand-avatar.png`,
      },
    },
  };

  scriptEl.textContent = JSON.stringify(newsArticleSchema, null, 2);
};

/**
 * Resets document metadata and title back to default portfolio home state.
 */
export const resetPostSeo = () => {
  if (typeof document === 'undefined') return;

  document.title = 'Rajababu Mehta | Founder & CEO of AI Clipzone & AI Website Developer';

  const defaultDesc =
    'Rajababu Mehta is the Founder and CEO of AI Clipzone. He is an AI Website Developer and AI Explainer from Birgunj, Nepal creating modern websites and AI solutions.';

  const setMetaTag = (
    attributeName: 'name' | 'property',
    attributeValue: string,
    contentValue: string
  ) => {
    const el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (el) el.setAttribute('content', contentValue);
  };

  setMetaTag('name', 'description', defaultDesc);
  setMetaTag('property', 'og:type', 'profile');
  setMetaTag('property', 'og:title', 'Rajababu Mehta | Founder & CEO of AI Clipzone & AI Website Developer');
  setMetaTag('property', 'og:description', defaultDesc);
  setMetaTag('property', 'og:url', 'https://rajababumehta.com.np/');
  setMetaTag('property', 'og:image', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhi7Uh94xTz0y-F0J_tapw44abY8zaSaDjrnGVWMyV-Odly0GMfSYtxK8FVOnFsFi0Nw_IveBY14ECZbwVtn2ab2u2OvbFFjr65hVXXuQKDmFh-U3RzfY1nOfUUF5d11Rjx6cWLUBamvlr4FrpncgobVp_itVNzzeXUKiFeD1UppSfItN2dxNhMq9Tu_JUO/s1372/20602.jpg');

  // Remove post-specific JSON-LD
  const scriptEl = document.getElementById('news-article-jsonld');
  if (scriptEl && scriptEl.parentNode) {
    scriptEl.parentNode.removeChild(scriptEl);
  }
};
