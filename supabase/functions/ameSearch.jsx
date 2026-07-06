const ARCHIVE_SEARCH_URL = 'https://archive.org/advancedsearch.php';

const SELECTED_ROM_SOURCES = {
  emubrowser: { label: 'EmuBrowser', url: 'https://emubrowser.com' },
  retroarch: { label: 'RetroArch Web Player', url: 'https://web.libretro.com' },
  nesOnline: { label: 'NES Emulator Online', url: 'https://joeheyming.github.io/nes' },
  classicjoy: { label: 'ClassicJoy', url: 'https://classicjoy.games' },
  moregames: { label: 'More Games', url: 'https://www.moregames.app/en' },
  webmulator: { label: 'Webmulator', url: 'https://www.webmulator.com/games' },
  classicemu: { label: 'ClassicEmu', url: 'https://classicemu.com/category/all.html' },
  retrorvault: { label: 'RetroVault', url: 'https://retrorvault.gg/collections/play-rom-games-online-free' },
  playerretro: { label: 'Player Retro', url: 'https://playerretrogames.online' }
};

const ROM_EXTENSIONS = ['nes', 'sfc', 'smc', 'gba', 'gb', 'gbc', 'n64', 'z64', 'v64', 'md', 'gen', 'sms', 'gg', 'zip'];

function cleanText(value = '') {
  return String(value).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function guessCoreFromUrl(url = '', platform = '') {
  const lower = `${url} ${platform}`.toLowerCase();
  if (/\.nes(\?|$)|\bnes\b|nintendo entertainment/.test(lower)) return 'nes';
  if (/\.sfc(\?|$)|\.smc(\?|$)|\bsnes\b|super nintendo/.test(lower)) return 'snes';
  if (/\.gba(\?|$)|game boy advance/.test(lower)) return 'gba';
  if (/\.gbc(\?|$)|game boy color/.test(lower)) return 'gbc';
  if (/\.gb(\?|$)|game boy/.test(lower)) return 'gb';
  if (/\.n64(\?|$)|\.z64(\?|$)|\.v64(\?|$)|nintendo 64/.test(lower)) return 'n64';
  if (/\.md(\?|$)|\.gen(\?|$)|genesis|mega drive/.test(lower)) return 'segaMD';
  return 'nes';
}

function absoluteUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return '';
  }
}

function extractRomCandidates(html, source, query) {
  const linkRegex = /href=["']([^"']+)["'][^>]*>([^<]*)/gi;
  const scriptRomRegex = /["']([^"']+\.(${ROM_EXTENSIONS.join('|')})(?:\?[^"']*)?)["']/gi;
  const lowerQuery = query.toLowerCase();
  const candidates = [];
  let match;

  while ((match = linkRegex.exec(html))) {
    const href = match[1];
    const label = cleanText(match[2] || '');
    if (!ROM_EXTENSIONS.some(ext => new RegExp(`\\.${ext}(\\?|$)`, 'i').test(href))) continue;
    const combined = `${href} ${label}`.toLowerCase();
    if (lowerQuery && !combined.includes(lowerQuery.split(/\s+/)[0])) continue;
    const romUrl = absoluteUrl(href, source.url);
    if (!romUrl) continue;
    candidates.push({ label, romUrl });
  }

  while ((match = scriptRomRegex.exec(html))) {
    const romUrl = absoluteUrl(match[1], source.url);
    if (!romUrl) continue;
    const combined = romUrl.toLowerCase();
    if (lowerQuery && !combined.includes(lowerQuery.split(/\s+/)[0])) continue;
    candidates.push({ label: '', romUrl });
  }

  return candidates;
}

async function searchSelectedRomSources(query, selectedSources = []) {
  const sourceKeys = selectedSources.length ? selectedSources : [];
  const sources = sourceKeys.map(key => SELECTED_ROM_SOURCES[key]).filter(Boolean);
  if (sources.length === 0) return [];

  const pages = await Promise.allSettled(sources.map(async (source) => {
    const searchUrl = `${source.url}${source.url.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0 EliteVault Game Search' } });
    const html = await response.text();
    return extractRomCandidates(html, source, query).slice(0, 6).map(candidate => ({ source, candidate }));
  }));

  return pages
    .flatMap(result => result.status === 'fulfilled' ? result.value : [])
    .map(({ source, candidate }) => ({
      title: candidate.label || `${query} ROM`,
      description: `Detected a direct playable ROM link from ${source.label}. Import only content you have the right to use.`,
      cover_url: '',
      banner_url: '',
      genres: ['Retro', 'Emulator'],
      platforms: ['Browser Emulator'],
      source_type: 'emulator',
      play_url: '',
      store_url: source.url,
      emulator_core: guessCoreFromUrl(candidate.romUrl),
      rom_url: candidate.romUrl,
      rom_required: true,
      legal_notes: `ROM link detected from ${source.label}. Only import ROMs you own or are legally allowed to play.`,
      age_rating: 'All Ages',
      rating: 0,
      tags: ['rom-detected', source.label, 'selected-source']
    }));
}

function buildArchiveQuery(query, deep = false, filters = {}) {
  const safeQuery = query.replace(/[^a-zA-Z0-9\s'-]/g, ' ').trim();
  const baseCollections = '(collection:softwarelibrary_flash_games OR collection:softwarelibrary_msdos_games OR collection:softwarelibrary_consolelivingroom)';
  const deepCollections = '(collection:softwarelibrary OR collection:softwarelibrary_msdos_games OR collection:softwarelibrary_flash_games OR collection:softwarelibrary_consolelivingroom OR collection:classicpcgames OR collection:open_source_software)';
  const collectionByPlatform = {
    dos: 'collection:softwarelibrary_msdos_games',
    flash: 'collection:softwarelibrary_flash_games',
    console: 'collection:softwarelibrary_consolelivingroom',
    pc: '(collection:classicpcgames OR collection:softwarelibrary)'
  };
  const subjectParts = ['subject:game', 'subject:games'];
  if (deep) subjectParts.push('subject:arcade', 'subject:dos', 'subject:emulator', 'subject:homebrew', 'subject:shareware', 'subject:flash', 'subject:classic');
  if (filters.genre && filters.genre !== 'all') subjectParts.push(`subject:${filters.genre.replace(/[^a-zA-Z0-9-]/g, ' ')}`);
  const platformFilter = collectionByPlatform[filters.platform] || (filters.emulator && filters.emulator !== 'all' ? collectionByPlatform[filters.emulator] : null);
  const yearFilter = filters.year ? ` AND (year:${String(filters.year).replace(/[^0-9]/g, '')} OR date:${String(filters.year).replace(/[^0-9]/g, '')})` : '';
  const titleFilter = filters.title ? ` AND title:(${filters.title.replace(/[^a-zA-Z0-9\s'-]/g, ' ')})` : '';
  return `(${safeQuery}) AND mediatype:software AND (${subjectParts.join(' OR ')}) AND ${platformFilter || (deep ? deepCollections : baseCollections)}${yearFilter}${titleFilter}`;
}

function mapArchiveGame(item) {
  const identifier = item.identifier;
  const title = cleanText(firstValue(item.title) || identifier);
  const subjects = Array.isArray(item.subject) ? item.subject : item.subject ? [item.subject] : [];
  const collections = Array.isArray(item.collection) ? item.collection : item.collection ? [item.collection] : [];
  const creators = Array.isArray(item.creator) ? item.creator : item.creator ? [item.creator] : [];
  const year = firstValue(item.year) || firstValue(item.date) || '';
  const downloads = Number(item.downloads || 0);
  const metadata = [
    year && `Year: ${year}`,
    creators.length && `Creator: ${creators.slice(0, 2).join(', ')}`,
    downloads && `Archive plays/downloads: ${downloads.toLocaleString?.() || downloads}`,
    collections.length && `Collection: ${collections.slice(0, 3).join(', ')}`
  ].filter(Boolean).join(' • ');

  return {
    title,
    description: [cleanText(firstValue(item.description) || `Playable archived game${year ? ` from ${year}` : ''}.`), metadata].filter(Boolean).join('\n\n'),
    cover_url: `https://archive.org/services/img/${identifier}`,
    banner_url: `https://archive.org/services/img/${identifier}`,
    genres: [...new Set(subjects.filter(Boolean).slice(0, 8))],
    platforms: collections.some(c => String(c).includes('msdos')) ? ['MS-DOS', 'Browser Emulator'] : ['Browser Emulator'],
    source_type: 'emulator',
    play_url: `https://archive.org/embed/${identifier}`,
    store_url: `https://archive.org/details/${identifier}`,
    emulator_core: collections.filter(value => !String(value).startsWith('fav-')).slice(0, 8).join(', '),
    rom_required: false,
    legal_notes: 'Playable via Internet Archive’s browser emulator. Only archived/legal public source links are used.',
    age_rating: 'All Ages',
    rating: downloads,
    tags: [...new Set([...subjects, ...collections.filter(value => !String(value).startsWith('fav-')), ...creators, year, 'deep-search'].filter(Boolean).slice(0, 14))]
  };
}

Deno.serve(async (req) => {
  try {
    const { query, limit = 24, deep = false, instantOnly = false, filters = {}, selectedSources = [] } = await req.json();
    if (!query?.trim()) return Response.json({ results: [] });

    const rowLimit = Math.min(Math.max(Number(limit) || 24, 6), deep ? 75 : 50);
    const searchTerms = deep
      ? [query, `${query} game`, `${query} playable`, `${query} emulator`, `${query} shareware`, `${query} arcade`]
      : [query];
    const allDocs = [];

    const searches = searchTerms.map(async (term) => {
      const params = new URLSearchParams({
        q: buildArchiveQuery(term, deep, filters),
        fl: 'identifier,title,description,subject,collection,creator,year,date,downloads',
        rows: String(rowLimit),
        page: '1',
        output: 'json',
        sort: 'downloads desc'
      });
      const response = await fetch(`${ARCHIVE_SEARCH_URL}?${params.toString()}`);
      const data = await response.json();
      return data?.response?.docs || [];
    });

    const [docsBySearch, selectedRomResults] = await Promise.all([
      Promise.all(searches),
      searchSelectedRomSources(query, selectedSources)
    ]);
    allDocs.push(...docsBySearch.flat());

    const seen = new Set();
    const archiveResults = allDocs
      .filter(item => item.identifier)
      .filter(item => {
        if (seen.has(item.identifier)) return false;
        seen.add(item.identifier);
        return true;
      })
      .sort((a, b) => Number(b.downloads || 0) - Number(a.downloads || 0))
      .slice(0, rowLimit)
      .map(mapArchiveGame)
      .filter(game => !instantOnly || game.play_url || game.rom_url);

    const results = [...selectedRomResults, ...archiveResults]
      .filter((game, index, array) => array.findIndex(item => (item.rom_url || item.play_url || item.title) === (game.rom_url || game.play_url || game.title)) === index)
      .slice(0, rowLimit);

    return Response.json({ results, deep, count: results.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
