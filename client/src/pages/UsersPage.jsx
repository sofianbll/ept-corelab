import { useEffect, useState } from 'react';
import { api } from '../api/axios';

function parseUsersImport(rawValue) {
  const value = rawValue.trim();
  if (!value) return [];

  if (value.startsWith('[')) {
    return JSON.parse(value);
  }

  return value.split('\n').filter(Boolean).map((line) => {
    const [email, name, role = 'student'] = line.split(',').map((part) => part.trim());
    return { email, name, role };
  });
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const result = await api.users.list();
      setUsers(result.data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const usersToImport = parseUsersImport(importText);
      if (usersToImport.length === 0) {
        setError('Ajoute au moins un utilisateur à importer.');
        return;
      }
      const result = await api.users.import(usersToImport);
      setMessage(`${result.imported ?? usersToImport.length} utilisateur(s) importé(s).`);
      setImportText('');
      await loadUsers();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Import impossible.');
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Utilisateurs</h1>
        </div>
        <span className="status-pill">{users.length} comptes</span>
      </div>

      {error && <div className="form-error">{error}</div>}
      {message && <div className="form-success">{message}</div>}

      <section className="panel">
        <div className="panel-header">
          <h2>Import CSV / JSON</h2>
          <span>email,name,role</span>
        </div>
        <form className="admin-form" onSubmit={handleImport}>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="student@corelab.fr,Student One,student"
            rows={5}
          />
          <button className="primary-button" type="submit">Importer</button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Liste utilisateurs</h2>
          <button className="ghost-button" type="button" onClick={loadUsers}>Rafraîchir</button>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Première connexion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.firstLogin ? 'Oui' : 'Non'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default UsersPage;
