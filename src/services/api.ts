import { Moment, Comment } from '../types';

/**
 * Client API for interacting with the backend full-stack endpoints.
 * This guarantees that every visitor globally sees all published posts,
 * likes, and comments, eliminating any local storage or device boundaries.
 */

export async function fetchPublicPosts(): Promise<Moment[]> {
  try {
    const res = await fetch('/api/posts', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.posts)) {
      return data.posts;
    }
    return [];
  } catch (err) {
    console.warn('[API] Could not fetch posts from server, falling back to local/cached state:', err);
    return [];
  }
}

export async function publishPublicPost(post: Moment): Promise<Moment> {
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data = await res.json();
    if (data.success && data.post) {
      return data.post;
    }
    return post;
  } catch (err) {
    console.error('[API] Failed to publish post to server:', err);
    return post;
  }
}

export async function deletePublicPost(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('[API] Failed to delete post on server:', err);
    return false;
  }
}

export async function likePublicPost(id: string, action: 'like' | 'unlike'): Promise<number | null> {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(id)}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const data = await res.json();
      return typeof data.likes === 'number' ? data.likes : null;
    }
    return null;
  } catch (err) {
    console.warn('[API] Failed to update like on server:', err);
    return null;
  }
}

export async function fetchPublicComments(): Promise<Record<string, Comment[]>> {
  try {
    const res = await fetch('/api/comments', { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    return data.comments || {};
  } catch (err) {
    console.warn('[API] Could not fetch comments from server:', err);
    return {};
  }
}

export async function addPublicComment(
  momentId: string,
  author: string,
  text: string
): Promise<Comment | null> {
  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ momentId, author, text }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.comment || null;
    }
    return null;
  } catch (err) {
    console.warn('[API] Failed to add comment on server:', err);
    return null;
  }
}
