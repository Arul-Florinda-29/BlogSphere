
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import {
  PostCard,
  Spinner,
  Empty,
  ErrorBox,
  toast,
  useTitle
} from '../components/ui';

export default function Bookmarks() {
  useTitle('Bookmarks');

  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const response = await api.get('/posts/bookmarks/all');
      setPosts(response.data);
      setError('');
    } catch (e) {
      setError(errMsg(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/posts/${id}/bookmark`);
      toast('Removed from bookmarks');
      load();
    } catch (e) {
      toast(errMsg(e), 'err');
    }
  };

  if (error) {
    return (
      <div className="page">
        <ErrorBox text={error} />
      </div>
    );
  }

  if (!posts) return <Spinner />;

  return (
    <div className="page">
      <div className="between row">
        <div>
          <h1>My bookmarks</h1>
          <p className="muted">
            Articles you've saved to read again.
          </p>
        </div>

        <Link className="btn ghost" to="/">
          Explore articles
        </Link>
      </div>

      {posts.length === 0 ? (
        <Empty
          text="You haven't saved any articles yet."
          action={
            <Link className="btn" to="/">
              Explore articles
            </Link>
          }
        />
      ) : (
        <div className="grid">
          {posts.map((post) => (
            <div key={post._id}>
              <PostCard post={post} />
              <div className="row">
                <button
                  className="link danger"
                  onClick={() => remove(post._id)}
                >
                  Remove bookmark
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}