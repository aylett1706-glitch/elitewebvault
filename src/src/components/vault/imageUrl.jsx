export const toDisplayImageUrl = (url, width = 640, height = 360) => {
  const value = String(url || '').trim();
  if (!value || !value.startsWith('http')) return '';
  if (value.includes('images.weserv.nl')) return value;
  const clean = value.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}&w=${width}&h=${height}&fit=cover&output=webp&n=-1`;
};