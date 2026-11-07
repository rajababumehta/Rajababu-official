import { FeedPost } from '../types';

/**
 * Update document metadata and Schema.org NewsArticle structured data for a post
 * so Google, search engine bots, and social media crawlers index the post information.
 */
export const updatePostSeo = (post: FeedPost) => {
  if (typeof document === 'undefined') return;

  // Extract a clean headline (either the first line of content or first 80 chars)
  const firstLine = post.content.split('\n')[0].replace(/^#+\s*/, '').trim();
  const headline = firstLine.length > 10 ? firstLine.slice(0, 100) : 'Rajababu Mehta Official Announcement';
  
  // Extract summary
  const summary = post.content.slice(0, 160).replace(/\n/g, ' ').trim();
  const postUrl = `${window.location.origin}/?post=${post.id}#post-${post.id}`;
  const postImage = post.images && post.images.length > 0 
    ? post.images[0] 
    : 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhi7Uh94xTz0y-F0J_tapw44abY8zaSaDjrnGVWMyV-Odly0GMfSYtxK8FVOnFsFi0Nw_IveBY14ECZbwVtn2ab2u2OvbFFjr65hVXXuQKDmFh-U3RzfY1nOfUUF5d11Rjx6cWLUBamvlr4FrpncgobVp_itVNzzeXUKiFeD1UppSfItN2dxNhMq9Tu_JUO/s1372/20602.jpg';

  // 1. Update Title Tag
  document.title = `${headline} | Rajababu Mehta - AI Clipzone News`;

  // Helper to set or create meta tag
  const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
    let el = document.querySelector(
      isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`
    );
    if (!el) {
      el = document.createElement('meta');
      if (isProperty) {
        el.setAttribute('property', nameOrProperty);
      } else {
        el.setAttribute('name', nameOrProperty);
      }
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  };

  // 2. Standard Search Meta
  setMeta('description', summary);
  setMeta('author', 'Rajababu Mehta');

  // 3. OpenGraph Tags (Facebook, WhatsApp, LinkedIn)
  setMeta('og:type', 'article', true);
  setMeta('og:title', headline, true);
  setMeta('og:description', summary, true);
  setMeta('og:url', postUrl, true);
  setMeta('og:image', postImage, true);
  setMeta('og:site_name', 'Rajababu Mehta - AI Clipzone News', true);

  // 4. Twitter / X Cards
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', headline);
  setMeta('twitter:description', summary);
  setMeta('twitter:image', postImage);

  // 5. Schema.org NewsArticle & BlogPosting JSON-LD
  let scriptEl = document.getElementById('news-article-jsonld');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'news-article-jsonld';
    scriptEl.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptEl);
  }

  const newsArticleJsonLd = {
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
    'image': post.images && post.images.length > 0 ? post.images : [postImage],
    'author': {
      '@type': 'Person',
      'name': 'Rajababu Mehta',
      'jobTitle': 'Founder & CEO of AI Clipzone',
      'url': 'https://rajababumehta.com.np',
      'sameAs': [
        'https://aiclipzone.vercel.app/',
        'https://www.linkedin.com/in/rajababumehta',
      ],
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'AI Clipzone News & Media',
      'url': 'https://aiclipzone.vercel.app/',
      'logo': {
        '@type': 'ImageObject',
        'url': `${window.location.origin}/assets/aistudio/logo_3c930995.png`,
      },
    },
  };

  scriptEl.textContent = JSON.stringify(newsArticleJsonLd, null, 2);
};

/**
 * Reset metadata back to the default portfolio home state
 */
export const resetPostSeo = () => {
  if (typeof document === 'undefined') return;

  document.title = 'Rajababu Mehta | Founder & CEO of AI Clipzone & AI Website Developer';

  const defaultDesc =
    'Rajababu Mehta is the Founder and CEO of AI Clipzone. He is an AI Website Developer and AI Explainer from Birgunj, Nepal creating modern websites and AI solutions.';

  const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
    const el = document.querySelector(
      isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`
    );
    if (el) el.setAttribute('content', value);
  };

  setMeta('description', defaultDesc);
  setMeta('og:type', 'profile', true);
  setMeta('og:title', 'Rajababu Mehta | Founder & CEO of AI Clipzone & AI Website Developer', true);
  setMeta('og:description', defaultDesc, true);
  setMeta('og:url', 'https://rajababumehta.com.np/', true);

  // Remove post-specific JSON-LD
  const scriptEl = document.getElementById('news-article-jsonld');
  if (scriptEl && scriptEl.parentNode) {
    scriptEl.parentNode.removeChild(scriptEl);
  }
};
