import React, { useState } from 'react';
import axios from 'axios';

// Base URL for your Render backend
const BASE_URL = 'https://post-api-x8s1.onrender.com/api/facebook/posts';

const EditPostForm = ({ post, onUpdateSuccess, onCancelEdit }) => {
  // initialize local state with post data
  const [data, setData] = useState({
    content: post.content || '',
    imageUrl: post.imageUrl || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // handle text & URL input changes
  const handleInput = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // handle submit (PUT request)
  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    if (!data.content.trim()) {
      alert('Post content cannot be empty.');
      return;
    }

    const payload = {
      ...post,
      content: data.content,
      imageUrl: data.imageUrl
    };

    setSaving(true);
    try {
      console.log(`Updating post #${post.id}`, payload);

      const res = await axios.put(`${BASE_URL}/${post.id}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('✅ Post updated:', res.data);
      onUpdateSuccess(res.data);
    } catch (err) {
      console.error('❌ Update failed:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Unknown server error.';
      setError(msg);
      alert(`Failed to update post: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-form">
      <h4>Edit Post by {post.author}</h4>

      <form onSubmit={handleSave}>
        <textarea
          name="content"
          value={data.content}
          onChange={handleInput}
          rows="4"
          disabled={saving}
          required
        />
        <input
          type="url"
          name="imageUrl"
          placeholder="Image URL"
          value={data.imageUrl}
          onChange={handleInput}
          disabled={saving}
        />

        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onCancelEdit} disabled={saving}>
            Cancel
          </button>
        </div>
      </form>

      {error && (
        <p className="error" style={{ color: 'red', marginTop: 8 }}>
          Server error: {String(error)}
        </p>
      )}
    </div>
  );
};

export default EditPostForm;
