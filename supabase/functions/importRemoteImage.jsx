// Replaced Base44 SDK: use Supabase auth and optional Storage upload

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const SUPABASE_STORAGE_BUCKET = Deno.env.get('SUPABASE_STORAGE_BUCKET') || '';

    const getUserFromHeader = async (headers) => {
      try {
        const auth = headers.get('authorization') || '';
        if (!auth) return null;
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: auth, apikey: SUPABASE_SERVICE_ROLE_KEY } });
        if (!resp.ok) return null;
        return await resp.json();
      } catch (e) { return null }
    };

    const user = await getUserFromHeader(req.headers);
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
    // If a storage bucket is configured, upload to Supabase Storage; otherwise return original URL
    if (SUPABASE_STORAGE_BUCKET) {
      const path = `imports/imported-image-${Date.now()}.${extension}`;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${path}`;
      const uploadResp = await fetch(uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': contentType }, body: await blob.arrayBuffer() });
      if (!uploadResp.ok) return Response.json({ error: 'Upload failed' }, { status: 500 });
      const publicUrl = `${SUPABASE_URL.replace(/\.supabase\.co$/, '.supabase.co')}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${path}`;
      return Response.json({ file_url: publicUrl });
    }

    return Response.json({ file_url: imageUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
