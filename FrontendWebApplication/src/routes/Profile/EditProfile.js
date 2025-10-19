import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../config/routes';
import { getMe, updateProfile } from '../../services/userService';
import { required } from '../../utils/validators';

// PUBLIC_INTERFACE
export default function EditProfile() {
  /**
   * Edit Profile page.
   * - Loads current profile
   * - Allows editing displayName, bio, phone, location (fields are examples; adjust per backend)
   * - Validates required fields and submits to userService.updateProfile
   */
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    phone: '',
    location: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const me = user || (await getMe());
        if (isMounted && me) {
          setForm({
            displayName: me.displayName || me.name || '',
            bio: me.bio || '',
            phone: me.phone || '',
            location: me.location || '',
          });
        }
      } catch {
        // ignore; keep form defaults
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errs = {};
    if (!required(form.displayName)) {
      errs.displayName = 'Please enter a display name.';
    }
    // Optional: basic phone validation pattern
    if (form.phone && !/^[0-9+()\\-\\s]{6,}$/.test(form.phone)) {
      errs.phone = 'Please enter a valid phone number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        displayName: form.displayName.trim(),
        bio: form.bio,
        phone: form.phone,
        location: form.location,
      };
      const updated = await updateProfile(payload);
      // Update auth context user
      const merged = { ...(user || {}), ...(updated || payload) };
      updateUser(merged);
      showToast('Profile updated successfully.', 'success', 2500);
      navigate(ROUTES.PROFILE);
    } catch {
      showToast('Unable to update your profile. Please try again.', 'error', 3500);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="page"><p>Loading…</p></div>;
  }

  return (
    <div className="page">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit} noValidate aria-labelledby="edit-profile-form">
        <h2 id="edit-profile-form" className="sr-only" style={{ position: 'absolute', left: -9999 }}>Edit Profile Form</h2>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={form.displayName}
            onChange={handleChange}
            aria-invalid={Boolean(errors.displayName)}
            aria-describedby={errors.displayName ? 'displayName-error' : undefined}
            required
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
          {errors.displayName && (
            <div id="displayName-error" role="alert" style={{ color: '#c62828' }}>
              {errors.displayName}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows="4"
            value={form.bio}
            onChange={handleChange}
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
          {errors.phone && (
            <div id="phone-error" role="alert" style={{ color: '#c62828' }}>
              {errors.phone}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" className="btn" onClick={() => navigate(ROUTES.PROFILE)} disabled={submitting} style={{ background: '#6c757d' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
