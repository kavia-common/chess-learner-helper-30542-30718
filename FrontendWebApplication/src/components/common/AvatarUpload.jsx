import React, { useRef, useState } from 'react';
import { useUser } from '../../store/user';

/**
 * PUBLIC_INTERFACE
 * AvatarUpload renders an accessible file picker with image preview and calls upload action.
 */
export function AvatarUpload({ currentUrl = '', onUploaded }) {
  const { state, actions } = useUser();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || '');

  const onPick = () => inputRef.current?.click();

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic client-side validation
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > maxSize) {
      alert('Please select an image smaller than 2MB.');
      return;
    }
    // Set local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    const res = await actions.uploadAvatar(file);
    if (res?.url && onUploaded) onUploaded(res.url);
  };

  const btnStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          aria-label="Current avatar"
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--border-color)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
        >
          {preview ? <img src={preview} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
        </div>
        <div>
          <button type="button" onClick={onPick} style={btnStyle} aria-label="Upload new avatar" disabled={state.avatar.uploading}>
            {state.avatar.uploading ? 'Uploading…' : 'Change avatar'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onChange}
            hidden
            aria-hidden="true"
            tabIndex={-1}
          />
          {state.avatar.error && <div role="alert" style={{ color: 'crimson', marginTop: 6 }}>{state.avatar.error}</div>}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 6 }}>
        Supported formats: JPG, PNG. Max size: 2MB.
      </div>
    </div>
  );
}
