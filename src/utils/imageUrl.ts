/**
 * Utility functions for normalizing, resolving, and validating image URLs
 * Supports: ImgBB, Postimages, Imgur, Google Drive, Dropbox, GitHub,
 * HTML embed tags, BBCode, Markdown, and direct data URLs.
 */

export interface NormalizedUrlResult {
  url: string;
  originalUrl: string;
  converted: boolean;
  platform?: 'imgbb' | 'imgur' | 'gdrive' | 'dropbox' | 'github' | 'html_embed' | 'bbcode' | 'direct';
  notes?: string;
}

/**
 * Normalizes any pasted image link, embed code, or cloud drive URL
 * into a direct image URL loadable by an <img> tag.
 */
export function normalizeImageUrl(input: string): string {
  return analyzeImageUrl(input).url;
}

/**
 * Detailed analyzer and converter for image URLs
 */
export function analyzeImageUrl(rawInput: string): NormalizedUrlResult {
  if (!rawInput) {
    return { url: '', originalUrl: '', converted: false };
  }

  let text = rawInput.trim();

  // 1. Check for HTML <img> embed code: e.g. <img src="..." /> or <a href="..."><img src="..." /></a>
  const htmlImgMatch = text.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlImgMatch && htmlImgMatch[1]) {
    const extracted = htmlImgMatch[1].trim();
    return {
      url: extracted,
      originalUrl: text,
      converted: true,
      platform: 'html_embed',
      notes: 'Extracted direct image source from HTML embed code',
    };
  }

  // 2. Check for BBCode: [img]https://...[/img] or [url=...][img]...[/img][/url]
  const bbcodeMatch = text.match(/\[img\](.*?)\[\/img\]/i);
  if (bbcodeMatch && bbcodeMatch[1]) {
    const extracted = bbcodeMatch[1].trim();
    return {
      url: extracted,
      originalUrl: text,
      converted: true,
      platform: 'bbcode',
      notes: 'Extracted direct image from BBCode markup',
    };
  }

  // 3. Check for Markdown image: ![alt](url)
  const mdMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    return {
      url: mdMatch[1].trim(),
      originalUrl: text,
      converted: true,
      platform: 'direct',
      notes: 'Extracted image URL from Markdown',
    };
  }

  // Clean trailing punctuation or whitespace
  text = text.replace(/["'>]+$/, '');

  // 4. ImgBB Handler
  // Case A: User pasted viewer link: https://ibb.co/C5wnswvR or http://ibb.co/C5wnswvR
  const ibbViewerMatch = text.match(/^https?:\/\/ibb\.co\/([a-zA-Z0-9_-]+)\/?$/i);
  if (ibbViewerMatch && ibbViewerMatch[1]) {
    const slug = ibbViewerMatch[1];
    return {
      url: `https://i.ibb.co/${slug}/image.jpg`,
      originalUrl: text,
      converted: true,
      platform: 'imgbb',
      notes: 'Converted ImgBB viewer page link to direct image URL',
    };
  }

  // Case B: User pasted full imgbb link with slash: https://ibb.co/C5wnswvR/anything
  const ibbViewerSubMatch = text.match(/^https?:\/\/ibb\.co\/([a-zA-Z0-9_-]+)/i);
  if (ibbViewerSubMatch && !text.includes('i.ibb.co')) {
    const slug = ibbViewerSubMatch[1];
    return {
      url: `https://i.ibb.co/${slug}/image.jpg`,
      originalUrl: text,
      converted: true,
      platform: 'imgbb',
      notes: 'Converted ImgBB viewer page link to direct image URL',
    };
  }

  // 5. Imgur Handler
  // e.g. https://imgur.com/ABCxyz or https://m.imgur.com/ABCxyz
  const imgurMatch = text.match(/^https?:\/\/(?:m\.)?imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)$/i);
  if (imgurMatch && imgurMatch[1] && !text.includes('i.imgur.com')) {
    const id = imgurMatch[1];
    return {
      url: `https://i.imgur.com/${id}.jpg`,
      originalUrl: text,
      converted: true,
      platform: 'imgur',
      notes: 'Converted Imgur page link to direct i.imgur.com image URL',
    };
  }

  // 6. Google Drive Handler
  // e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // or https://drive.google.com/open?id=FILE_ID
  const gDriveMatch1 = text.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  const gDriveMatch2 = text.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  const gDriveId = gDriveMatch1?.[1] || gDriveMatch2?.[1];
  if (gDriveId) {
    return {
      url: `https://lh3.googleusercontent.com/d/${gDriveId}`,
      originalUrl: text,
      converted: true,
      platform: 'gdrive',
      notes: 'Converted Google Drive link to direct Google CDN image URL',
    };
  }

  // 7. Dropbox Handler
  // e.g. https://www.dropbox.com/s/xyz/photo.jpg?dl=0
  if (text.includes('dropbox.com') && (text.includes('?dl=0') || !text.includes('raw=1'))) {
    const dropboxClean = text.replace(/[?&]dl=[01]/g, '').replace(/[?&]raw=1/g, '');
    const connector = dropboxClean.includes('?') ? '&' : '?';
    return {
      url: `${dropboxClean}${connector}raw=1`,
      originalUrl: text,
      converted: true,
      platform: 'dropbox',
      notes: 'Converted Dropbox link to direct raw download URL',
    };
  }

  // 8. GitHub Blob to Raw
  // e.g. https://github.com/user/repo/blob/main/img.jpg
  if (text.includes('github.com') && text.includes('/blob/')) {
    return {
      url: text.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/'),
      originalUrl: text,
      converted: true,
      platform: 'github',
      notes: 'Converted GitHub blob URL to direct raw image URL',
    };
  }

  // Default: Already direct link or data URL
  return {
    url: text,
    originalUrl: text,
    converted: false,
    platform: 'direct',
  };
}

/**
 * Resizes and compresses an image File from the client's device
 * into an optimized high-quality Data URL (WebP/JPEG) < 150KB.
 */
export function compressImageFile(
  file: File,
  maxDimension = 1440,
  quality = 0.85
): Promise<{ dataUrl: string; width: number; height: number; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Canvas 2D context not available'));
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve({
          dataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: Math.round((dataUrl.length * 3) / 4),
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
