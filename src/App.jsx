import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ActorHub from './pages/ActorHub'
import ActorProfile from './pages/ActorProfile'
import AddMedia from './pages/AddMedia'
import Admin from './pages/Admin'
import AdultPerformerDetail from './pages/AdultPerformerDetail'
import AdultVault from './pages/AdultVault'
import Anime from './pages/Anime'
import BookReader from './pages/BookReader'
import Books from './pages/Books'
import Browse from './pages/Browse'
import CollectionDetail from './pages/CollectionDetail'
import Collections from './pages/Collections'
import CreatorTools from './pages/CreatorTools'
import GameDetail from './pages/GameDetail'
import GamePlay from './pages/GamePlay'
import Games from './pages/Games'
import GenreBrowse from './pages/GenreBrowse'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/actor-hub" element={<ActorHub />} />
        <Route path="/actor-profile" element={<ActorProfile />} />
        <Route path="/add-media" element={<AddMedia />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/adult-performer" element={<AdultPerformerDetail />} />
        <Route path="/adult-vault" element={<AdultVault />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/book-reader" element={<BookReader />} />
        <Route path="/books" element={<Books />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/collection/:id" element={<CollectionDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/creator-tools" element={<CreatorTools />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/play/:id" element={<GamePlay />} />
        <Route path="/games" element={<Games />} />
        <Route path="/genre/:name" element={<GenreBrowse />} />
      </Routes>
    </Router>
  )
}

export default App
