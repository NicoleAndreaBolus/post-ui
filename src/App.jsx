import React, { useState, useEffect } from 'react';
import PostForm from './components/PostForm';
import EditPostForm from './components/EditPostForm';
import './App.css';
import axios from 'axios';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:8080/api/facebook/posts';

  // Inline SVG placeholder as last-resort fallback (no external host)
  const placeholderSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect fill="#ddd" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#666" font-size="20">Image failed</text></svg>'
  )}`;

  // Local public asset fallback (place a file public/placeholder.png in your Vite project)
  const localFallback = '/placeholder.png';

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      const initialPosts = response.data.map(post => ({ ...post, isEditing: false }));
      setPosts(initialPosts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [{ ...newPost, isEditing: false }, ...prev]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev =>
      prev.map(p => (p.id === updatedPost.id ? { ...updatedPost, isEditing: false } : p))
    );
  };

  const toggleEdit = (id) => {
    setPosts(prev =>
      prev.map(p => (p.id === id ? { ...p, isEditing: !p.isEditing } : { ...p, isEditing: false }))
    );
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
      alert(`Post ${id} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  if (loading) return <h1>Loading Posts...</h1>;

  return (
    <div className="App">
      <h1>Facebook-Style Feed</h1>

      <PostForm onPostCreated={handlePostCreated} />

      <h2>Recent Posts</h2>
      <div className="posts-container">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="post-card">
              {post.isEditing ? (
                <EditPostForm
                  post={post}
                  onUpdateSuccess={handlePostUpdated}
                  onCancelEdit={() => toggleEdit(post.id)}
                />
              ) : (
                <>
                  <h3>{post.content}</h3>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post visual"
                      onError={(e) => {
                        // first try local fallback, then inline SVG
                        try {
                          if (e.target.src !== localFallback) {
                            e.target.onerror = null;
                            e.target.src = localFallback;
                          } else {
                            e.target.onerror = null;
                            e.target.src = placeholderSvg;
                          }
                        } catch {
                          e.target.onerror = null;
                          e.target.src = placeholderSvg;
                        }
                      }}
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                    />
                  )}

                  <p>— Posted by: <strong>{post.author}</strong></p>

                  {/* Use a div here so we don't nest a block-level element inside a <p> */}
                  <div
                    className="timestamp"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>
                      Created:{' '}
                      {post.createdDateTime ? new Date(post.createdDateTime).toLocaleString() : '—'}
                      {post.createdDateTime && post.modifiedDateTime && post.createdDateTime !== post.modifiedDateTime && (
                        <span style={{ marginLeft: '10px' }}> (Edited)</span>
                      )}
                    </span>

                    <div className="actions">
                      <button className="edit-btn" onClick={() => toggleEdit(post.id)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDeletePost(post.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p>No posts found. Be the first to post!</p>
        )}
      </div>
    </div>
  );
}

export default App;