import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

function DashboardLayout({ children, title }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />

      <main className="dashboard-content">
        <Topbar title={title} user={user} />
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
