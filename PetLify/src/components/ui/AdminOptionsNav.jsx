import { Link, useLocation } from 'react-router-dom';

const AdminOptionsNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="bg-orange-400 w-full px-6 py-3 shadow-md flex justify-center gap-6 sticky top-0 z-50">
      <Link
        to="/admin-panel"
        className={`px-4 py-2 rounded-2xl font-semibold cursor-pointer transition ${
          currentPath === '/admin-panel' ? 'bg-orange-500 text-white' : 'text-white hover:bg-orange-500'
        }`}
      >
        Home
      </Link>
      <Link
        to="/admin-panel/manage-permissions"
        className={`px-4 py-2 rounded-2xl font-semibold cursor-pointer transition ${
          currentPath === '/admin-panel/manage-permissions' ? 'bg-orange-500 text-white' : 'text-white hover:bg-orange-500'
        }`}
      >
        Nadaj uprawnienia
      </Link>
      <Link
        to="/admin-panel/approve-lost-reports"
        className={`px-4 py-2 rounded-2xl font-semibold cursor-pointer transition ${
          currentPath === '/admin-panel/approve-lost-reports' ? 'bg-orange-500 text-white' : 'text-white hover:bg-orange-500'
        }`}
      >
        Zatwierdź zgłoszenia zaginięcia
      </Link>
      <Link
        to="/admin-panel/approve-found-reports"
        className={`px-4 py-2 rounded-2xl font-semibold cursor-pointer transition ${
          currentPath === '/admin-panel/approve-found-reports' ? 'bg-orange-500 text-white' : 'text-white hover:bg-orange-500'
        }`}
      >
        Zatwierdź zgłoszenia odnalezienia
      </Link>
    </nav>
  );
};

export default AdminOptionsNav;
