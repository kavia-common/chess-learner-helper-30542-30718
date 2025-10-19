import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../config/routes';
import { getMe, uploadAvatar, deleteAccount } from '../../services/userService';
import { required } from '../../utils/validators';

// PUBLIC_INTERFACE
export default function Profile() {
  /**
   * Profile overview page.
   * - Loads current user data (from AuthContext or via getMe fallback)
   * - Displays avatar, basic info
   * - Supports avatar upload with preview (multipart/form-data)
   * - Provides account actions (navigate to Edit Profile, Delete account)
   */
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(user || null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!user) {
        setLoading(true);
        try {
          const me = await getMe();
          if (isMounted) {
            setProfile(me);
            updateUser(me);
          }
        } catch {
          // Show gentle message, but not blocking
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setProfile(user);
      }
    }
    load();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const displayName = useMemo(() => (profile?.displayName || profile?.name || profile?.email || 'Your account'), [profile]);

  function handleChooseFile() {
    const input = document.getElementById('avatar-input');
    if (input) input.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show client preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleUpload(e) {
    e.preventDefault();
    const input = document.getElementById('avatar-input');
    const file = input?.files?.[0];
    if (!file) {
      showToast('Please select an image file first.', 'error', 3000);
      return;
    }
    if (!/^image\//.test(file.type)) {
      showToast('Only image files are allowed.', 'error', 3500);
      return;
    }
    setUploading(true);
    try {
      const res = await uploadAvatar(file);
      // Expect backend to return updated user or avatar url
      const next = { ...(profile || {}), ...(res?.user || {}), avatarUrl: res?.avatarUrl || res?.url || res?.avatar || (profile?.avatarUrl) };
      setProfile(next);
      updateUser(next);
      showToast('Avatar updated successfully.', 'success', 2500);
      // Clear file input
      if (input) input.value = '';
      setAvatarPreview(null);
    } catch {
      showToast('Failed to upload avatar. Please try again.', 'error', 3500);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleting) return;
    // Double confirm UX minimal
    // eslint-disable-next-line no-alert
    const confirm1 = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirm1) return;
    setDeleting(true);
    try {
      await deleteAccount();
      showToast('Your account has been deleted. Goodbye!', 'info', 4000);
      logout();
    } catch {
      showToast('Unable to delete account at this time.', 'error', 3500);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="page"><p>Loading profile…</p></div>;
  }

  if (!profile) {
    return (
      <div className="page">
        <h1>Your Profile</h1>
        <p>We could not load your profile right now.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Profile</h1>
      <section style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            {/* Avatar image or initials */}
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Your avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                {String(displayName).slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <input id="avatar-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button type="button" className="btn small" onClick={handleChooseFile}>Choose</button>
            <button type="button" className="btn small" onClick={handleUpload} disabled={uploading} aria-busy={uploading}>
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>

        <div>
          <h2 style={{ marginTop: 0 }}>{displayName}</h2>
          <div style={{ marginBottom: 6 }}>
            <strong>Email:</strong> {profile?.email || '—'}
          </div>
          {required(profile?.bio) && (
            <div style={{ marginBottom: 6 }}>
              <strong>Bio:</strong> {profile.bio}
            </div>
          )}
          {required(profile?.phone) && (
            <div style={{ marginBottom: 6 }}>
              <strong>Phone:</strong> {profile.phone}
            </div>
          )}
          {required(profile?.location) && (
            <div style={{ marginBottom: 6 }}>
              <strong>Location:</strong> {profile.location}
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to={`${ROUTES.PROFILE}/edit`} className="btn">Edit Profile</Link>
            <button type="button" className="btn" onClick={handleDeleteAccount} disabled={deleting} aria-busy={deleting} style={{ background: '#c62828' }}>
              {deleting ? 'Deleting…' : 'Delete Account'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
