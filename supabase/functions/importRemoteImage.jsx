import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const extractImageUrl = (input) => {
  const value = String(input || '').trim().replace(/["'\\]/g, '');
  if (!value) return '';

  const encodedMatch = value.match(/[?&](?:mediaurl|imgurl|r|url)=([^&]+)/i);
  if (encodedMatch?.[1]) return decodeURIComponent(encodedMatch[1]);

  const directMatch = value.match(/https?:\/\/[^\s&]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s]*)?/i);
  if (directMatch?.[0]) return directMatch[0];

  return value;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json();
    const imageUrl = extractImageUrl(url);
    if (!imageUrl || !imageUrl.startsWith('https://')) {
      return Response.json({ error: 'Please paste a valid HTTPS image URL.' }, { status: 400 });
    }

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': new URL(imageUrl).origin + '/'
      }
    });

    if (!response.ok) {
      return Response.json({ error: 'That website blocked the image. Please use Upload instead.' }, { status: 400 });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return Response.json({ error: 'The URL is not a direct image.' }, { status: 400 });
    }

    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const blob = await response.blob();
    const file = new File([blob], `imported-image-${Date.now()}.${extension}`, { type: contentType });
    const uploaded = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    return Response.json({ file_url: uploaded.file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
