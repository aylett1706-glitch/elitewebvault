import BookImageReader from '@/components/books/BookImageReader';
import ComicBookReader from '@/components/books/ComicBookReader';
import EpubBookReader from '@/components/books/EpubBookReader';
import InAppBookText from '@/components/books/InAppBookText';
import PdfBookReader from '@/components/books/PdfBookReader';
import WebBookReader from '@/components/books/WebBookReader';

const getUrl = (book) => book?.file_url || book?.pdf_url || book?.epub_url || book?.preview_url || '';
const isPdf = (url) => /\.pdf(\.|\/|\?|$)/i.test(url);
const isEpub = (url) => /\.epub(\.|\/|\?|$)/i.test(url);
const isWebReadable = (url) => /\.(txt|html?)(\.|\/|\?|$)/i.test(url) || /gutenberg\.org|standardebooks\.org|wikisource\.org|openstax\.org/i.test(url);
const isArchive = (book) => /archive\.org\/(embed|details)\//i.test(`${book?.preview_url || ''} ${book?.info_url || ''}`);

export default function SmartBookReader({ book, zoom, currentPage, setCurrentPage, onBookmark, isBookmarked }) {
  const url = getUrl(book);
  const comicPages = book?.comic_pages || book?.image_pages || [];

  if (comicPages.length || ['comic', 'manga', 'magazine'].includes(book?.content_type)) {
    return comicPages.length ? (
      <ComicBookReader pages={comicPages} zoom={zoom} currentPage={currentPage} setCurrentPage={setCurrentPage} onBookmark={onBookmark} isBookmarked={isBookmarked} rtl={book?.content_type === 'manga'} />
    ) : <InAppBookText book={book} zoom={zoom} currentPage={currentPage} setCurrentPage={setCurrentPage} onBookmark={onBookmark} isBookmarked={isBookmarked} />;
  }

  if (isPdf(url)) {
    return <PdfBookReader url={url} zoom={zoom} currentPage={currentPage} setCurrentPage={setCurrentPage} onBookmark={onBookmark} isBookmarked={isBookmarked} />;
  }

  if (isEpub(url)) {
    return <EpubBookReader url={url} zoom={zoom} onBookmark={onBookmark} isBookmarked={isBookmarked} />;
  }

  if (isWebReadable(url)) {
    return <WebBookReader url={url} title={book?.title} zoom={zoom} onBookmark={onBookmark} isBookmarked={isBookmarked} />;
  }

  if (isArchive(book)) {
    return <BookImageReader book={book} zoom={zoom} onZoomIn={() => {}} onZoomOut={() => {}} onBookmark={onBookmark} isBookmarked={isBookmarked} />;
  }

  return <InAppBookText book={book} zoom={zoom} currentPage={currentPage} setCurrentPage={setCurrentPage} onBookmark={onBookmark} isBookmarked={isBookmarked} />;
}