import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.auth.login(email, password);

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      navigate(result.user.firstLogin ? '/first-login' : '/');
    } catch (error) {
      setError(error.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={handleLogin} className="login-form">
        <h1>CORELAB</h1>
        <p className="login-subtitle">Connecte-toi pour continuer ton parcours.</p>

        {error && <div className="form-error">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Connexion'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
