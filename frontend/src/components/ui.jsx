import { Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const toast = (msg, type = 'ok') => {
  const d = document.createElement('div');
  d.className = `toast ${type}`; d.textContent = msg; d.setAttribute('role', 'status');
  document.body.appendChild(d); setTimeout(() => d.remove(), 2800);
};
export const useTitle = (t) => useEffect(() => { document.title = t ? `${t} | BlogSphere` : 'BlogSphere'; }, [t]);
export const Spinner = () => <div className="center"><div className="spinner" aria-label="Loading" /></div>;
export const Empty = ({ text, action }) => <div className="empty"><p>{text}</p>{action}</div>;
export const ErrorBox = ({ text }) => <div className="error-box">{text}</div>;
export const confirmDelete = (what) => window.confirm(`Delete this ${what}? This cannot be undone.`);
export const fmt = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
export const Avatar = ({ user, size = 32 }) => (
  <span className="avatar" style={{ width: size, height: size, fontSize: size / 2.2 }}>{(user?.name || '?')[0].toUpperCase()}</span>
);
export const Img = ({ src, alt }) => (
  <img loading="lazy" src={src || 'https://picsum.photos/seed/blogsphere/900/500'} alt={alt}
    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500"><rect width="100%" height="100%" fill="%23888"/></svg>'; }} />
);
export function Protected({ children, admin }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'ADMIN') return <div className="page"><h1>403</h1><p>You are not authorised to view this page.</p></div>;
  return children;
}
export const PostCard = ({ post }) => (
  <article className="card">
    <Link to={`/post/${post.slug}`}><Img src={post.featuredImage} alt={post.title} /></Link>
    <div className="card-body">
      <div className="meta">{post.category?.name && <Link className="chip" to={`/?category=${post.category.slug}`}>{post.category.name}</Link>}
        {post.status === 'draft' && <span className="chip draft">Draft</span>}</div>
      <h3><Link to={`/post/${post.slug}`}>{post.title}</Link></h3>
      <p>{post.excerpt}</p>
      <div className="meta small">By {post.author?.name} · {fmt(post.publishedAt || post.createdAt)} · {post.readingTime} min · ♥ {post.likeCount} · 👁 {post.views}</div>
    </div>
  </article>
);
