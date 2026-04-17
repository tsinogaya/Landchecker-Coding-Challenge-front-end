import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('demo@landchecker.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-card" onSubmit={onSubmit}>
      <h2>Landchecker</h2>
      <p>{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>
      <label>
        Password
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button disabled={loading} type="submit">
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
      </button>
      <button
        type="button"
        className="secondary"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
    </form>
  );
}
