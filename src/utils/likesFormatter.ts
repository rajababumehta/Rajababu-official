/**
 * Converts numbers into clean readable strings (e.g. 245, 850, 1.2k, 15.4k)
 */
export function formatLikes(count: number): string {
  if (count === undefined || count === null || isNaN(count)) return '0';
  if (count < 1000) {
    return count.toString();
  }
  if (count < 1000000) {
    const k = count / 1000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  const m = count / 1000000;
  return `${m.toFixed(1).replace(/\.0$/, '')}M`;
}

/**
 * Generates realistic engagement like counts based on admin presets
 */
export function generateLikesFromPreset(
  preset: '200' | '300' | '1k' | 'random' | 'custom',
  customValue?: number
): number {
  switch (preset) {
    case '200':
      // 200 - 249
      return Math.floor(Math.random() * 50) + 200;
    case '300':
      // 300 - 365
      return Math.floor(Math.random() * 66) + 300;
    case '1k':
      // 1000 - 1280
      return Math.floor(Math.random() * 281) + 1000;
    case 'random':
      // 200 - 1200
      return Math.floor(Math.random() * 1001) + 200;
    case 'custom':
      return Math.max(0, customValue ?? 250);
    default:
      return 250;
  }
}
