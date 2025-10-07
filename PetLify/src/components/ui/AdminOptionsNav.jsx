import { Link, useLocation } from 'react-router-dom';

const AdminOptionsNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="bg-orange-400 w-full px-6 py-3 shadow-md flex justify-center gap-6 sticky top-0 z-50">
      <Link
        to="/main-page"
        className={`px-4 py-2 rounded-2xl font-semibold cursor-pointer transition ${
          currentPath === '/main-page' ? 'bg-orange-500 text-white' : 'text-white hover:bg-orange-500'
        }`}
      >
        Strona główna
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
        to="/admin-panel/manage-lost-reports"
        className={`px-4 py-2 rounded-2xl font-semibold cursor-pointer transition ${
          currentPath === '/admin-panel/manage-lost-reports' ? 'bg-orange-500 text-white' : 'text-white hover:bg-orange-500'
        }`}
      >
        Zarządzaj zgłoszeniami zaginięcia
      </Link>
      <Link
        to="/admin-panel/manage-found-reports"
        className={`px-4 py-2 rounded-2xl font-semibold cursor-pointer transition ${
          currentPath === '/admin-panel/manage-found-reports' ? 'bg-orange-500 text-white' : 'text-white hover:bg-orange-500'
        }`}
      >
        Zarządzaj zgłoszeniami odnalezienia
      </Link>
    </nav>
  );
};

export default AdminOptionsNav;
