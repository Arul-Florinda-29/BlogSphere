import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { PostCard, Spinner, Empty, ErrorBox, useTitle } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  useTitle('');
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const category = sp.get('category') || '', tag = sp.get('tag') || '', sort = sp.get('sort') || 'latest', page = +sp.get('page') || 1;
  const [text, setText] = useState(sp.get('q') || ''); const q = sp.get('q') || '';
  const [cats, setCats] = useState([]); const [data, setData] = useState(null); const [error, setError] = useState('');

  const update = (patch) => { const n = Object.fromEntries(sp); Object.assign(n, { page: 1 }, patch); Object.keys(n).forEach((k) => !n[k] && delete n[k]); setSp(n); };
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(() => text !== q && update({ q: text }), 400); return () => clearTimeout(t); }, [text]); // debounced search
  useEffect(() => {
    setData(null); setError('');
    api.get('/posts', { params: { q, category, tag, sort, page } }).then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  }, [q, category, tag, sort, page]);

  return (
    <>
      {!q && !category && !tag && (
        <section className="hero">
          <h1>Write. Share. <span className="grad">Connect.</span></h1>
          <p>BlogSphere is a modern space to publish articles, join conversations and discover ideas from writers around the world.</p>
          <div className="row"><Link className="btn" to={user ? '/create-post' : '/register'}>Start Writing</Link><a className="btn ghost" href="#articles">Explore Articles</a></div>
        </section>
      )}
      <div className="page" id="articles">
        <div className="toolbar">
          <input type="search" placeholder="Search title, content or tags..." aria-label="Search" value={text} onChange={(e) => setText(e.target.value)} />
          <select aria-label="Sort" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="latest">Latest</option><option value="popular">Most popular</option><option value="oldest">Oldest</option>
          </select>
        </div>
        <div className="chips">
          <button className={`chip ${!category ? 'on' : ''}`} onClick={() => update({ category: '' })}>All</button>
          {cats.map((c) => <button key={c._id} className={`chip ${category === c.slug ? 'on' : ''}`} onClick={() => update({ category: c.slug })}>{c.name}</button>)}
          {tag && <button className="chip on" onClick={() => update({ tag: '' })}>#{tag} ✕</button>}
        </div>
        {error ? <ErrorBox text={error} /> : !data ? <Spinner /> : data.posts.length === 0 ? (
          <Empty text="No posts found" action={(q || category || tag) && <button className="btn ghost" onClick={() => { setText(''); setSp({}); }}>Clear filters</button>} />
        ) : (<>
          <p className="muted">{data.total} article{data.total !== 1 && 's'}{q && ` for "${q}"`}</p>
          <div className="grid">{data.posts.map((p) => <PostCard key={p._id} post={p} />)}</div>
          <div className="pager">
            <button className="btn ghost" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>← Prev</button>
            <span>Page {data.page} of {data.pages}</span>
            <button className="btn ghost" disabled={page >= data.pages} onClick={() => update({ page: page + 1 })}>Next →</button>
          </div>
        </>)}
      </div>
    </>
  );
}
