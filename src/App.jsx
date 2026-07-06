import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Browse from './pages/Browse'
import Books from './pages/Books'
import BookReader from './pages/BookReader'
import Games from './pages/Games'
import GameDetail from './pages/GameDetail'
import GamePlay from './pages/GamePlay'
import Anime from './pages/Anime'
import GenreBrowse from './pages/GenreBrowse'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import ActorHub from './pages/ActorHub'
import ActorProfile from './pages/ActorProfile'
import AdultPerformerDetail from './pages/AdultPerformerDetail'

// Protected Pages (require login)
import Admin from './pages/Admin'
import AddMedia from './pages/AddMedia'
import CreatorTools from './pages/CreatorTools'
import AdultVault from './pages/AdultVault'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/books" element={<Books />} />
        <Route path="/book/:id" element={<BookReader />} />
        <Route path="/games" element={<Games />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/play/:id" element={<GamePlay />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/genre/:type/:name" element={<GenreBrowse />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collection/:id" element={<CollectionDetail />} />
        <Route path="/actors" element={<ActorHub />} />
        <Route path="/actor/:id" element={<ActorProfile />} />
        <Route path="/performer/:id" element={<AdultPerformerDetail />} />

        {/* Protected Routes — only logged-in users can access */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/add-media" element={
          <ProtectedRoute>
            <AddMedia />
          </ProtectedRoute>
        } />
        <Route path="/creator-tools" element={
          <ProtectedRoute>
            <CreatorTools />
          </ProtectedRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute>
            <AdultVault />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App