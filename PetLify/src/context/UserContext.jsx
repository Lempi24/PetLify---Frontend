import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { user: loggedInUser } = useAuth();

  const fetchUser = async () => {
    try {
      const email = loggedInUser?.email;
      const token = localStorage.getItem('token');
      if (!email || !token) {
        setUser(null);
        return;
      }

      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userEmail: email, // Node i tak zlowercasuje header
          },
        }
      );
      setUser(data || null);
    } catch (e) {
      console.error('Błąd podczas pobierania użytkownika:', e);
      setUser(null);
    }
  };

  useEffect(() => {
    if (!loggedInUser) {
      setUser(null);
      return;
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser?.email]);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

// re-eksport hooka, żeby stare importy nadal działały
export { default as useUser } from './useUser';
