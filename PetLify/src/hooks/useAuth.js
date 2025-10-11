import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
	const [user, setUser] = useState(null);

	const updateUserFromToken = () => {
		try {
			const token = localStorage.getItem('token');
			if (token) {
				const decodedToken = jwtDecode(token);
				console.log('Decoded token:', decodedToken);
				setUser({
					email: decodedToken.email,
					role: decodedToken.role,
					token: token,
				});
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error('Failed to decode token:', error);
			setUser(null);
		}
	};

	useEffect(() => {
		updateUserFromToken();

		window.addEventListener('storage', updateUserFromToken);
		window.addEventListener('tokenChange', updateUserFromToken);

		return () => {
			window.removeEventListener('storage', updateUserFromToken);
			window.removeEventListener('tokenChange', updateUserFromToken);
		};
	}, []);
	return { user };
};
export default useAuth;
