import { useState, useEffect, use } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		try {
			const token = localStorage.getItem('token');
			if (token) {
				const decodedToken = jwtDecode(token);
				setUser({
					email: decodedToken.email,
				});
			}
		} catch (error) {
			console.error('Failed to decode token:', error);
			setUser(null);
		}
	}, []);
	return user;
};
export default useAuth;
