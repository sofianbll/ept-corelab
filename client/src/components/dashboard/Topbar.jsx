function Topbar({ title, user }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Corelab LMS</p>
        <h1>{title}</h1>
      </div>

      <div className="topbar-user">
        <span>{user?.email}</span>
        <strong>{user?.role}</strong>
      </div>
    </header>
  );
}

export default Topbar;
