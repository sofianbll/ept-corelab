import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

function FirstLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const user = await api.auth.firstLogin(password);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Impossible de changer le mot de passe.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Première connexion</h1>
        <p className="login-subtitle">Choisis ton mot de passe personnel.</p>

        {error && <div className="form-error">{error}</div>}

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}

export default FirstLoginPage;
