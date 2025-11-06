import React, { useState } from 'react';
import axios from 'axios';

// ✅ 1. Use the correct backend URL (no trailing /api if your backend mapping starts with /facebook/posts)
const API_URL = 'https://post-api-x8s1.onrender.com/facebook/posts';

const EditPostForm = ({ post, onUpdateSuccess, onCancelEdit }) => {
  if (!post || post.id == null) {
    return <div>Invalid post data</div>;
  }

  const [formData, setFormData] = useState({
    content: post.content ?? '',
    imageUrl: post.imageUrl ?? ''
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!formData.content.trim()) {
      alert('Post content cannot be empty!');
      return;
    }

    setLoading(true);
    try {
      const id = Number(post.id);

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const payload = {
        content: formData.content,
        imageUrl: formData.imageUrl || null
      };

      console.log(`➡️ Sending PUT to: ${API_URL}/${id}`, payload);

      const response = await axios.put(`${API_URL}/${id}`, payload, { headers });

      console.log('✅ Update success:', response.data);
      onUpdateSuccess(response.data);
    } catch (err) {
      console.error('❌ Error updating post:', err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Unknown error';

      setServerError(message);
      alert(`Failed to update post: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-form-container">
      <h4>Editing Post by {post.author}</h4>

      <form onSubmit={handleSubmit}>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows="4"
          required
          disabled={loading}
        />

        <input
          type="url"
          name="imageUrl"
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={handleChange}
          disabled={loading}
        />

        <div className="edit-actions">
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancelEdit}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>

      {serverError && (
        <div className="error" style={{ color: 'red', marginTop: 8 }}>
          Server error: {String(serverError)}
        </div>
      )}
    </div>
  );
};

export default EditPostForm;
