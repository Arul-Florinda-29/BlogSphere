import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Protected } from './components/ui';
import Home from './pages/Home';
import PostView from './pages/PostView';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import Bookmarks from './pages/Bookmarks';
import Admin from './pages/Admin';
import { Login, Register } from './pages/Auth';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';

const NotFound = () => (
  <div className="page center-text">
    <h1>404</h1>
    <p>Page not found.</p>
    <Link className="btn" to="/">
      Go home
    </Link>
  </div>
);

export default function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Home />} />
          <Route path="/search" element={<Home />} />

          <Route path="/post/:slug" element={<PostView />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/create-post"
            element={
              <Protected>
                <Editor />
              </Protected>
            }
          />

          <Route
            path="/edit-post/:id"
            element={
              <Protected>
                <Editor />
              </Protected>
            }
          />

          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />

          <Route
            path="/bookmarks"
            element={
              <Protected>
                <Bookmarks />
              </Protected>
            }
          />

          <Route
            path="/analytics"
            element={
              <Protected>
                <Analytics />
              </Protected>
            }
          />

          <Route
            path="/notifications"
            element={
              <Protected>
                <Notifications />
              </Protected>
            }
          />

          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />

          <Route
            path="/profile/:username"
            element={<Profile />}
          />

          <Route
            path="/admin"
            element={
              <Protected admin>
                <Admin />
              </Protected>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} BlogSphere — Write. Share. Connect.
      </footer>
    </>
  );
}