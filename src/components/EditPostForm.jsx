import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://post-api-x8s1.onrender.com/api/facebook/posts';

const EditPostForm = ({ post, onUpdateSuccess, onCancelEdit }) => {
  if (!post || post.id == null) {
    // defensive: don't render form if post is missing
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

    if (!formData.content || !formData.content.trim()) {
      alert('Post content cannot be empty!');
      return;
    }

    setLoading(true);
    try {
      // If your API accepts partial updates, consider PATCH instead of PUT
      // Use parseInt if your backend expects a numeric id
      const id = Number(post.id);

      // Optional: include auth token if your API requires authorization
      const token = localStorage.getItem('token'); // adjust to your auth storage
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const payload = {
        content: formData.content,
        imageUrl: formData.imageUrl || null // send null if empty, depends on API
      };

      const response = await axios.put(`${API_URL}/${id}`, payload, { headers });

      // return updated object to parent
      onUpdateSuccess(response.data);
    } catch (err) {
      // Better error logging for debugging
      console.error('Error updating post (full error):', err);
      console.error('axios error.toJSON():', err.toJSON ? err.toJSON() : undefined);
      console.error('response status:', err.response?.status);
      console.error('response headers:', err.response?.headers);
      console.error('response data:', err.response?.data);

      // friendly message to UI, include server message if available
      const message =
        err.response?.data?.message ||
        err.response?.data ||
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
        ></textarea>

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
          <button type="button" className="cancel-btn" onClick={onCancelEdit} disabled={loading}>
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
