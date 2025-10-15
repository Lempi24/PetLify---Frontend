import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
  const [user, setUser] = useState(null);

  const updateUserFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUser({
          email: decoded.email,
          role: decoded.role,
          token,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to decode token:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    updateUserFromToken();
    const handler = () => updateUserFromToken();
    window.addEventListener('storage', handler);
    window.addEventListener('tokenChange', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('tokenChange', handler);
    };
  }, []);

  
  // Zwracamy zarówno { user } jak i rozpakowane pola usera.
  return { user, ...(user || {}) };
};

export default useAuth;
