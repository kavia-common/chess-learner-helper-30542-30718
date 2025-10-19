import React, { useEffect, useState } from 'react';
import { useUser } from '../store/user';
import { useStore, authActions } from '../store';

/**
 * PUBLIC_INTERFACE
 * Settings page handles Privacy, Notifications, Consents, and Account Deletion workflow.
 */
export function Settings() {
  const { state, actions } = useUser();
  const { dispatch } = useStore();
  const doLogout = authActions.logout(dispatch);

  const [privacy, setPrivacy] = useState({
    showProfilePublic: false,
    shareStatsLeaderboard: true,
    allowFriendRequests: true,
  });
  const [notifications, setNotifications] = useState({
    emailLessons: true,
    emailChallenges: true,
    pushGameReminders: false,
  });
  const [consent, setConsent] = useState({
    acceptedTerms: true,
    acceptedPrivacy: true,
    marketingEmails: false,
  });

  const [status, setStatus] = useState('');

  useEffect(() => {
    actions.fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.settings.data) {
      setPrivacy({ ...privacy, ...(state.settings.data.privacy || {}) });
      setNotifications({ ...notifications, ...(state.settings.data.notifications || {}) });
      setConsent({ ...consent, ...(state.settings.data.consent || {}) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.settings.data]);

  const onToggle = (setter) => (e) => {
    const { name, checked } = e.target;
    setter((s) => ({ ...s, [name]: checked }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setStatus('');
    const payload = { privacy, notifications, consent };
    const res = await actions.updateSettings(payload);
    if (res) {
      setStatus('Settings saved.');
      setTimeout(() => setStatus(''), 1200);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('This will permanently delete your account and associated data. Continue?')) return;
    const res = await actions.deleteAccount();
    if (res) {
      alert('Account deleted. You will be logged out.');
      await doLogout();
      window.location.href = '/';
    }
  };

  return (
    <section aria-labelledby="settings-title" style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1 id="settings-title">Settings</h1>
      {state.settings.loading && <div role="status">Loading settings…</div>}
      {state.settings.error && <div role="alert" style={{ color: 'crimson' }}>{state.settings.error}</div>}

      <form onSubmit={onSave}>
        <fieldset style={fsStyle}>
          <legend>Privacy</legend>
          <div style={rowStyle}>
            <input id="showProfilePublic" name="showProfilePublic" type="checkbox" checked={privacy.showProfilePublic} onChange={onToggle(setPrivacy)} />
            <label htmlFor="showProfilePublic" style={lblStyle}>Show my profile publicly</label>
          </div>
          <div style={rowStyle}>
            <input id="shareStatsLeaderboard" name="shareStatsLeaderboard" type="checkbox" checked={privacy.shareStatsLeaderboard} onChange={onToggle(setPrivacy)} />
            <label htmlFor="shareStatsLeaderboard" style={lblStyle}>Share my stats on leaderboards</label>
          </div>
          <div style={rowStyle}>
            <input id="allowFriendRequests" name="allowFriendRequests" type="checkbox" checked={privacy.allowFriendRequests} onChange={onToggle(setPrivacy)} />
            <label htmlFor="allowFriendRequests" style={lblStyle}>Allow friend requests</label>
          </div>
        </fieldset>

        <fieldset style={fsStyle}>
          <legend>Notifications</legend>
          <div style={rowStyle}>
            <input id="emailLessons" name="emailLessons" type="checkbox" checked={notifications.emailLessons} onChange={onToggle(setNotifications)} />
            <label htmlFor="emailLessons" style={lblStyle}>Email me about new lessons</label>
          </div>
          <div style={rowStyle}>
            <input id="emailChallenges" name="emailChallenges" type="checkbox" checked={notifications.emailChallenges} onChange={onToggle(setNotifications)} />
            <label htmlFor="emailChallenges" style={lblStyle}>Email me about new challenges</label>
          </div>
          <div style={rowStyle}>
            <input id="pushGameReminders" name="pushGameReminders" type="checkbox" checked={notifications.pushGameReminders} onChange={onToggle(setNotifications)} />
            <label htmlFor="pushGameReminders" style={lblStyle}>Send game reminders (push)</label>
          </div>
        </fieldset>

        <fieldset style={fsStyle}>
          <legend>Consents</legend>
          <div style={rowStyle}>
            <input id="acceptedTerms" name="acceptedTerms" type="checkbox" checked={consent.acceptedTerms} onChange={onToggle(setConsent)} />
            <label htmlFor="acceptedTerms" style={lblStyle}>I agree to the Terms of Service</label>
          </div>
          <div style={rowStyle}>
            <input id="acceptedPrivacy" name="acceptedPrivacy" type="checkbox" checked={consent.acceptedPrivacy} onChange={onToggle(setConsent)} />
            <label htmlFor="acceptedPrivacy" style={lblStyle}>I agree to the Privacy Policy</label>
          </div>
          <div style={rowStyle}>
            <input id="marketingEmails" name="marketingEmails" type="checkbox" checked={consent.marketingEmails} onChange={onToggle(setConsent)} />
            <label htmlFor="marketingEmails" style={lblStyle}>Receive occasional marketing emails</label>
          </div>
        </fieldset>

        <button type="submit" className="theme-toggle" style={{ position: 'static' }} disabled={state.settings.updating}>
          {state.settings.updating ? 'Saving…' : 'Save settings'}
        </button>
        {status && <div role="status" style={{ marginTop: 8 }}>{status}</div>}
      </form>

      <section aria-labelledby="account-danger" style={{ marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
        <h2 id="account-danger">Account</h2>
        <p style={{ color: 'crimson' }}>Delete your account and associated data. This action cannot be undone.</p>
        <button type="button" className="theme-toggle" style={{ position: 'static', background: '#b00020' }} onClick={onDelete} disabled={state.accountDeletion.deleting}>
          {state.accountDeletion.deleting ? 'Deleting…' : 'Delete account'}
        </button>
        {state.accountDeletion.error && <div role="alert" style={{ color: 'crimson', marginTop: 6 }}>{state.accountDeletion.error}</div>}
      </section>
    </section>
  );
}

const fsStyle = { border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, marginBottom: 12, background: 'var(--bg-secondary)' };
const rowStyle = { display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' };
const lblStyle = { cursor: 'pointer' };
