import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const { user: loggedInUser } = useAuth();
	const fetchUser = async () => {
		if (!loggedInUser?.email) {
			console.log("Brak emaila, nie pobieram użytkownika.");
			return;
		}
		const token = localStorage.getItem('token');
		if (!token) {
			console.log("Brak tokena, nie pobieram użytkownika.");
			return;
		}
		
		try {
			const { data } = await axios.get(
				import.meta.env.VITE_BACKEND_URL + '/auth/me',
				{
					headers: {
						Authorization: `Bearer ${token}`,
						userEmail: loggedInUser.email,
					},
				}
			);
			console.log("Pobrano dane użytkownika:", data);
			setUser(data);
		} catch (e) {
			console.error("Błąd podczas pobierania użytkownika:", e);
		}
	};

	useEffect(() => {
		fetchUser();
	}, [loggedInUser]);

	return (
		<UserContext.Provider value={{ user, setUser, fetchUser }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = () => useContext(UserContext);
