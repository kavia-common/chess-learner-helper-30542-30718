import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { getOAuthUrl } from '../../services/authService';

// PUBLIC_INTERFACE
export default function Login() {
  /** Login page with email/password and OAuth. */
  const { login } = useAuth();
  const location = useLocation();
  const from = location?.state?.from?.pathname;
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Listen for OAuth popup posting token
    function onMessage(ev) {
      if (ev?.data?.type === 'oauth_success' && ev?.data?.token) {
        localStorage.setItem('jwt', ev.data.token);
        window.location.href = '/dashboard';
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.password) e.password = 'Password required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    const res = await login(form.email, form.password);
    if (res?.error) setMsg(res.error);
  };

  return (
    <section>
      <h1>Login</h1>
      {from && <p>After login, you will be redirected to: {from}</p>}
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
          {errors.email && <div role="alert">{errors.email}</div>}
        </div>
        <div>
          <label>Password<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></label>
          {errors.password && <div role="alert">{errors.password}</div>}
        </div>
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
      <p><Link to="/auth/forgot">Forgot your password?</Link></p>

      <div style={{ marginTop: '1rem' }}>
        <p>Or continue with</p>
        <a
          href={getOAuthUrl('google')}
          className="btn"
          aria-label="Sign in with Google"
          onClick={(e) => {
            e.preventDefault();
            const w = window.open(getOAuthUrl('google'), 'oauth_google', 'width=500,height=600');
            if (!w) window.location.href = getOAuthUrl('google');
          }}
        >
          Google
        </a>
      </div>

      {msg && <p role="status">{msg}</p>}
    </section>
  );
}
