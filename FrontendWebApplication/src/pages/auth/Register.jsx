import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOAuthUrl } from '../../services/authService';

// PUBLIC_INTERFACE
export default function Register() {
  /** Registration page with email/password and OAuth buttons (frontend-only to backend endpoints). */
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 chars';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    const res = await register(form);
    setMsg(res?.message || res?.error || 'Registered');
  };

  return (
    <section>
      <h1>Register</h1>
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
          {errors.name && <div role="alert">{errors.name}</div>}
        </div>
        <div>
          <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
          {errors.email && <div role="alert">{errors.email}</div>}
        </div>
        <div>
          <label>Password<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} /></label>
          {errors.password && <div role="alert">{errors.password}</div>}
        </div>
        <button className="btn btn-primary" type="submit">Create account</button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <p>Or sign up with</p>
        <a href={getOAuthUrl('google')} className="btn" aria-label="Sign up with Google">Google</a>
        {/* Future providers can be added here */}
      </div>

      {msg && <p role="status">{msg}</p>}
    </section>
  );
}
