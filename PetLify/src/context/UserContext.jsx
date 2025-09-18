import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const loggedInUser = useAuth();
	const fetchUser = async () => {
		if (!loggedInUser?.email) return;
		const token = localStorage.getItem('token');
		if (!token) return;
		const { data } = await axios.get(
			import.meta.env.VITE_BACKEND_URL + '/auth/me',
			{
				headers: {
					Authorization: `Bearer ${token}`,
					userEmail: loggedInUser.email,
				},
			}
		);
		setUser(data);
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
