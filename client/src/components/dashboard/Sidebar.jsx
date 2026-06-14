import { NavLink, useNavigate } from 'react-router-dom';

const studentLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/courses', label: 'Cours' },
];

const adminLinks = [
  { to: '/admin/users', label: 'Utilisateurs' },
  { to: '/admin/courses', label: 'Gestion cours' },
];

function Sidebar({ user }) {
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? [...studentLinks, ...adminLinks] : studentLinks;

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="logo">CORE<span>LAB</span></div>
        <p className="sidebar-kicker">Learning cockpit</p>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={link.to} key={link.to} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="avatar">{user?.name?.slice(0, 2).toUpperCase() || 'CL'}</div>
        <div>
          <strong>{user?.name || 'Corelab'}</strong>
          <p>{user?.role || 'student'}</p>
        </div>
        <button type="button" onClick={logout}>Sortir</button>
      </div>
    </aside>
  );
}

export default Sidebar;
