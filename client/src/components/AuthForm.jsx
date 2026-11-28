import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from './ErrorBanner';

const inputCls =
  'w-full rounded-xl border border-transparent bg-tint px-4 py-3 text-base placeholder:text-muted/70 focus:border-brand focus:outline-none disabled:opacity-60';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Already logged in asel tar form dakhvu nako
  if (user) return <Navigate to={redirectTo} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (isRegister && !name.trim()) return setError('Enter your name.');
    if (password.length < 8 && isRegister) return setError('Password must be at least 8 characters.');

    setBusy(true);
    try {
      if (isRegister) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-12 sm:pt-20">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {isRegister ? 'Create your account' : 'NotedSpace'}
        </h1>
        <p className="mt-2 text-muted">
          {isRegister
            ? 'Save your notes and open them from anywhere.'
            : 'Log in to see your study notes.'}
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
        {isRegister && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={60}
              disabled={busy}
              className={inputCls}
              placeholder="Your name"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={busy}
            className={inputCls}
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Password</span>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              disabled={busy}
              className={`${inputCls} pr-12`}
              placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {error && <ErrorBanner title={isRegister ? "Couldn't sign you up" : "Couldn't log you in"} message={error} onClose={() => setError('')} />}

        <button type="submit" disabled={busy} className="btn-primary w-full py-3 text-base">
          {isRegister ? <UserPlus size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <Link
          to={isRegister ? '/login' : '/register'}
          state={location.state}
          className="font-medium text-brand-ink hover:underline"
        >
          {isRegister ? 'Log in' : 'Sign up'}
        </Link>
      </p>
    </div>
  );
}