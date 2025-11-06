import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://post-api-x8s1.onrender.com/api/facebook/posts';

const EditPostForm = ({ post, onUpdateSuccess, onCancelEdit }) => {
  const [data, setData] = useState({
    content: post.content || '',
    imageUrl: post.imageUrl || ''
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [message, setMessage] = useState('');

  // Automatically clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus(null);
    setMessage('');

    if (!data.content.trim()) {
      setStatus('error');
      setMessage('Post content cannot be empty.');
      return;
    }

    const payload = { ...post, content: data.content, imageUrl: data.imageUrl };

    setSaving(true);
    setMessage('Saving changes...');
    try {
      const res = await axios.put(`${BASE_URL}/${post.id}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      setStatus('success');
      setMessage('✅ Post updated successfully!');
      onUpdateSuccess(res.data);
    } catch (err) {
      console.error('❌ Update failed:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Unknown server error.';
      setStatus('error');
      setMessage(`❌ Failed to update: ${msg}`);
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
            {saving ? (
              <span className="spinner" />
            ) : (
              'Save'
            )}
          </button>
          <button type="button" onClick={onCancelEdit} disabled={saving}>
            Cancel
          </button>
        </div>
      </form>

      {/* Inline feedback message */}
      {message && (
        <div
          className={`status ${status === 'success' ? 'success' : status === 'error' ? 'error' : ''}`}
        >
          {message}
        </div>
      )}

      {/* Inline CSS styles */}
      <style jsx>{`
        .edit-form {
          margin-top: 10px;
        }
        .actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }
        button {
          padding: 8px 14px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }
        button[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #fff;
          border-top: 2px solid #2563eb;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .status {
          margin-top: 12px;
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 0.9rem;
          text-align: center;
        }
        .status.success {
          background: #dcfce7;
          color: #166534;
        }
        .status.error {
          background: #fee2e2;
          color: #b91c1c;
        }
      `}</style>
    </div>
  );
};

export default EditPostForm;
