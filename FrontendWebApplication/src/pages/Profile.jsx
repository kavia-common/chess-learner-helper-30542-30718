import React, { useEffect, useState } from 'react';
import { useUser } from '../store/user';
import { useStore } from '../store';
import { AvatarUpload } from '../components/common/AvatarUpload';

/**
 * PUBLIC_INTERFACE
 * Profile page allows viewing/editing name, bio, and avatar.
 * Accessible form with live validation, works in no-backend mode.
 */
export function Profile() {
  const { state: rootState } = useStore();
  const { state, actions } = useUser();
  const [form, setForm] = useState({ name: '', bio: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    actions.fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.profile.data) {
      setForm({
        name: state.profile.data.name || '',
        bio: state.profile.data.bio || '',
      });
    }
  }, [state.profile.data]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    const res = await actions.updateProfile(form);
    if (res) {
      setStatus('Profile saved.');
      setTimeout(() => setStatus(''), 1200);
    }
  };

  return (
    <section aria-labelledby="profile-title" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 id="profile-title">Your Profile</h1>
      {state.profile.loading && <div role="status">Loading profile…</div>}
      {state.profile.error && <div role="alert" style={{ color: 'crimson' }}>{state.profile.error}</div>}

      {!state.profile.loading && (
        <>
          <div style={{ marginBottom: 16 }}>
            <AvatarUpload
              currentUrl={state.profile.data?.avatarUrl || ''}
              onUploaded={() => setStatus('Avatar updated.')}
            />
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={state.profile.data?.email || rootState.auth.user?.email || ''}
                readOnly
                aria-readonly="true"
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={form.bio}
                onChange={onChange}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-color)' }}
              />
            </div>

            <button type="submit" className="theme-toggle" style={{ position: 'static' }} disabled={state.profile.updating}>
              {state.profile.updating ? 'Saving…' : 'Save changes'}
            </button>
          </form>
          {status && <div role="status" style={{ marginTop: 8 }}>{status}</div>}
        </>
      )}
    </section>
  );
}
