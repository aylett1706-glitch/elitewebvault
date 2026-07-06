// Replaced Base44 SDK with Supabase auth + Ollama LLM shim

const cleanText = (value = '') => String(value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const isFullReadableUrl = (url = '') => {
  const text = String(url).toLowerCase();
  return /\.(pdf|epub|txt|html?)(\.|\/|\?|$)/i.test(text) || /gutenberg\.org|standardebooks\.org|wikisource\.org|openstax\.org|librivox\.org/i.test(text);
};

const inferContentType = (book = {}, query = '') => {
  const queryText = String(query).toLowerCase();
  if (/audio|audiobook|narration/.test(queryText)) return 'audiobook';
  const text = [query, book.title, ...(book.subject || []), ...(book.author_name || [])].join(' ').toLowerCase();
  if (/audio|audiobook|narration/.test(text)) return 'audiobook';
  if (/light novel/.test(text)) return 'light_novel';
  if (/manga/.test(text)) return 'manga';
  if (/comic|graphic novel/.test(text)) return 'comic';
  if (/magazine|journal/.test(text)) return 'magazine';
  if (/manual|guide|handbook/.test(text)) return 'manual';
  if (/textbook|education|course|study|certification|learning/.test(text)) return 'educational';
  return 'ebook';
};

const inferFormats = (contentType = 'ebook') => {
  const formats = new Set(['EPUB', 'PDF', 'TXT']);
  if (contentType === 'comic' || contentType === 'manga') formats.add('CBZ/CBR');
  if (contentType === 'manual' || contentType === 'educational') formats.add('DOCX');
  if (contentType === 'ebook') formats.add('MOBI');
  return Array.from(formats);
};

const inferGenres = (book = {}, contentType = 'ebook') => {
  const text = [book.title, ...(book.subject || [])].join(' ').toLowerCase();
  const genreMap = [
    ['Fantasy', /fantasy|magic|dragon|witch|wizard|myth/],
    ['Science Fiction', /science fiction|sci-fi|space|future|dystopia|cyberpunk/],
    ['Mystery', /mystery|detective|crime|thriller|suspense/],
    ['Romance', /romance|love|regency/],
    ['Horror', /horror|ghost|vampire|monster|supernatural/],
    ['Adventure', /adventure|quest|journey|exploration/],
    ['Historical', /historical|history|war|victorian|medieval/],
    ['Learning', /education|textbook|study|learning|science|mathematics/]
  ];
  const matches = genreMap.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
  if (contentType === 'manga') matches.push('Manga');
  if (contentType === 'comic') matches.push('Graphic Fiction');
  return [...new Set(matches.length ? matches : ['General'])].slice(0, 4);
};

const inferCharacterTags = (book = {}) => {
  const text = [book.title, ...(book.subject || [])].join(' ').toLowerCase();
  const tags = [
    ['Hero', /hero|champion|warrior|knight|protagonist/],
    ['Detective', /detective|investigator|sleuth|private investigator/],
    ['Villain', /villain|enemy|criminal|killer|monster/],
    ['Royalty', /king|queen|prince|princess|empire|dynasty/],
    ['Explorer', /explorer|traveller|journey|adventure|quest/],
    ['Rebel', /rebel|resistance|revolution|dystopia/],
    ['Scholar', /student|teacher|professor|scientist|study/],
    ['Creature', /dragon|vampire|ghost|alien|creature/]
  ].filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
  return [...new Set(tags.length ? tags : ['Character-led'])].slice(0, 4);
};

const mapBook = (item, query) => {
  const contentType = inferContentType(item, query);
  const olid = item.edition_key?.[0] || item.key?.replace('/works/', '') || '';
  const archiveId = item.identifier || item.ia?.[0] || '';
  const cover = item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : (archiveId ? `https://archive.org/services/img/${archiveId}` : '');
  const subjects = item.subject?.slice(0, 8) || [];
  const description = [
    item.first_sentence?.[0],
    subjects.length ? `Topics: ${subjects.join(', ')}` : '',
    item.publisher?.[0] ? `Publisher: ${item.publisher[0]}` : ''
  ].filter(Boolean).join('\n\n');

  return {
    title: cleanText(item.title || 'Untitled book'),
    subtitle: cleanText(item.subtitle || ''),
    authors: item.author_name || [],
    description: cleanText(description || `Discover ${item.title || 'this title'} in the Books & Audiobook Hub.`),
    cover_url: cover,
    preview_url: archiveId ? `https://archive.org/embed/${archiveId}` : (olid ? `https://openlibrary.org/books/${olid}` : ''),
    info_url: archiveId ? `https://archive.org/details/${archiveId}` : (item.key ? `https://openlibrary.org${item.key}` : ''),
    source_id: item.key || archiveId || olid || item.title,
    publisher: item.publisher?.[0] || '',
    published_date: item.first_publish_year ? String(item.first_publish_year) : '',
    page_count: Number(item.number_of_pages_median || 0),
    language: item.language?.[0] || 'en',
    categories: subjects,
    genres: inferGenres(item, contentType),
    character_tags: inferCharacterTags(item),
    formats: inferFormats(contentType),
    content_type: contentType,
    has_audiobook: contentType === 'audiobook' || /audiobook|audio/i.test(query),
    status: 'approved',
    progress_percent: 0,
    xp_value: contentType === 'audiobook' ? 15 : 10
  };
};

const mapGutenbergBook = (item) => {
  const formats = item.formats || {};
  const epub = formats['application/epub+zip'] || '';
  const pdf = Object.entries(formats).find(([type]) => type.includes('pdf'))?.[1] || '';
  const html = formats['text/html'] || Object.entries(formats).find(([type]) => type.includes('html'))?.[1] || '';
  const text = Object.entries(formats).find(([type]) => type.includes('text/plain'))?.[1] || '';
  const cover = formats['image/jpeg'] || '';
  const authors = (item.authors || []).map(author => cleanText(author.name)).filter(Boolean);
  const subjects = (item.subjects || []).slice(0, 8);

  return {
    title: cleanText(item.title || 'Untitled public-domain book'),
    authors,
    description: cleanText(item.summaries?.[0] || `A full public-domain edition from Project Gutenberg.`),
    cover_url: cover,
    preview_url: html || epub || pdf || text || `https://www.gutenberg.org/ebooks/${item.id}`, 
    info_url: `https://www.gutenberg.org/ebooks/${item.id}`,
    source_id: `gutenberg-${item.id}`,
    publisher: 'Project Gutenberg',
    published_date: '',
    page_count: 0,
    language: item.languages?.[0] || 'en',
    categories: subjects,
    genres: inferGenres({ title: item.title, subject: subjects }, 'ebook'),
    character_tags: inferCharacterTags({ title: item.title, subject: subjects }),
    formats: ['EPUB', 'HTML', 'TXT', ...(pdf ? ['PDF'] : [])],
    content_type: 'ebook',
    status: 'approved',
    progress_percent: 0,
    xp_value: 10
  };
};

const mapLibrivoxBook = (item) => {
  const authors = (item.authors || []).map(author => cleanText(`${author.first_name || ''} ${author.last_name || ''}`)).filter(Boolean);
  const genres = (item.genres || []).map(genre => cleanText(genre.name)).filter(Boolean).slice(0, 4);

  return {
    title: cleanText(item.title || 'Untitled audiobook'),
    authors,
    description: cleanText(item.description || 'A free public-domain audiobook from LibriVox.'),
    cover_url: '',
    preview_url: item.url_librivox || item.url_project_gutenberg || '',
    info_url: item.url_librivox || '',
    source_id: `librivox-${item.id}`,
    publisher: 'LibriVox',
    published_date: item.copyright_year || '',
    page_count: 0,
    language: item.language || 'en',
    categories: genres,
    genres: genres.length ? genres : ['Audiobook'],
    character_tags: ['Narrated'],
    formats: ['MP3', 'Audiobook'],
    content_type: 'audiobook',
    has_audiobook: true,
    audiobook_url: item.url_zip_file || item.url_librivox || '',
    status: 'approved',
    progress_percent: 0,
    xp_value: 15
  };
};

const mapWebSourceBook = (item = {}, query = '') => {
  const typeText = `${item.format || ''} ${item.source || ''} ${item.url || ''}`.toLowerCase();
  const isAudio = /audio|mp3|librivox|audiobook/.test(typeText);
  return {
    title: cleanText(item.title || query || 'Free book source'),
    authors: item.author ? [cleanText(item.author)] : [],
    description: cleanText(item.description || `AI-discovered legal full-access source for ${query}.`),
    cover_url: '',
    preview_url: item.url || '',
    info_url: item.url || '',
    source_id: `web-${item.url || item.title || query}`,
    publisher: cleanText(item.source || 'Web source'),
    published_date: '',
    page_count: 0,
    language: 'en',
    categories: ['AI source discovery'],
    genres: ['General'],
    character_tags: ['Full-access source'],
    formats: isAudio ? ['Audiobook', 'MP3'] : ['EPUB', 'PDF', 'HTML', 'TXT'],
    content_type: isAudio ? 'audiobook' : 'ebook',
    has_audiobook: isAudio,
    audiobook_url: isAudio ? item.url || '' : '',
    status: 'approved',
    progress_percent: 0,
    xp_value: isAudio ? 15 : 10
  };
};

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const OLLAMA_URL = Deno.env.get('OLLAMA_URL') || '';

    const getUserFromHeader = async (headers) => {
      try {
        const auth = headers.get('authorization') || '';
        if (!auth) return null;
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: auth, apikey: SUPABASE_SERVICE_ROLE_KEY } });
        if (!resp.ok) return null;
        return await resp.json();
      } catch (e) { return null }
    };

    const invokeLLM = async (opts = {}) => {
      if (!OLLAMA_URL) throw new Error('OLLAMA_URL not configured');
      const body = { model: opts.model || 'llama2', messages: [{ role: 'user', content: opts.prompt }], max_tokens: opts.max_tokens || 2000 };
      const res = await fetch(`${OLLAMA_URL}/v1/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      return res.json();
    };

    const user = await getUserFromHeader(req.headers);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const payload = body?.payload || body?.data || body || {};
    const { query = '', deep = true, limit = 24, useAi = deep, sourceOptions = ['public_domain', 'textbooks', 'audiobooks', 'open_web'] } = payload;
    const search = String(query).trim();
    if (!search) return Response.json({ results: [] });

    const coreSearch = search
      .replace(/\b(full access|public source|no preview|readable|legal|free|open access)\b/gi, ' ')
      .replace(/\b(audiobooks?|ebooks?|books?|comics?|manga|pdfs?|manuals?|textbooks?|magazines?)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim() || search;
    const terms = deep
      ? [coreSearch, `${coreSearch} full text`, `${coreSearch} public domain`, `${coreSearch} open access`, `${coreSearch} free ebook`, `${coreSearch} audiobook`, `${coreSearch} textbook`]
      : [coreSearch];

    const fullAccessResults = [];
    for (const term of terms) {
      if (sourceOptions.includes('public_domain')) {
        const gutenbergUrl = new URL('https://gutendex.com/books');
        gutenbergUrl.searchParams.set('search', term);
        const gutenbergResponse = await fetch(gutenbergUrl.toString());
        const gutenbergData = await gutenbergResponse.json();
        fullAccessResults.push(...(gutenbergData.results || []).slice(0, 12).map(mapGutenbergBook));
      }

      if (sourceOptions.includes('audiobooks')) {
        const librivoxUrl = new URL('https://librivox.org/api/feed/audiobooks');
        librivoxUrl.searchParams.set('format', 'json');
        librivoxUrl.searchParams.set('title', term);
        librivoxUrl.searchParams.set('limit', '12');
        const librivoxResponse = await fetch(librivoxUrl.toString());
        const librivoxData = await librivoxResponse.json();
        fullAccessResults.push(...(librivoxData.books || []).map(mapLibrivoxBook));
      }
    }

    let webResults = [];
    if (useAi && sourceOptions.includes('open_web')) {
      const sourceFocus = [
        sourceOptions.includes('public_domain') ? 'Project Gutenberg, Standard Ebooks, Wikisource, public-domain libraries' : '',
        sourceOptions.includes('textbooks') ? 'OpenStax, university open textbooks, open educational repositories' : '',
        sourceOptions.includes('audiobooks') ? 'LibriVox and other legal full audiobooks' : ''
      ].filter(Boolean).join('; ');

      const aiRaw = await invokeLLM({ prompt: `Search the whole web for legal, free, full-access readable sources for this query: "${search}". Focus on: ${sourceFocus || 'all legal public full-access sources'}. Only return JSON with a top-level "sources" array of objects with {title, author, source, url, format, description}. Exclude borrow-only or limited-preview pages.`, model: 'ollama', max_tokens: 2000 });
      let aiDiscovery = {};
      try {
        if (aiRaw?.choices && aiRaw.choices[0]?.message?.content) aiDiscovery = JSON.parse(aiRaw.choices[0].message.content);
        else aiDiscovery = aiRaw;
      } catch (e) { aiDiscovery = {} }

      webResults = (aiDiscovery?.sources || [])
        .filter(item => item.url && /^https?:\/\//i.test(item.url) && isFullReadableUrl(item.url))
        .map(item => mapWebSourceBook(item, search));
    }

    const seen = new Set();
    const results = [...webResults, ...fullAccessResults]
      .filter(item => item.title && isFullReadableUrl(item.preview_url || item.info_url || item.audiobook_url))
      .filter(item => {
        const key = String(item.source_id || item.title).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, Math.min(50, Math.max(6, Number(limit) || 24)));

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
