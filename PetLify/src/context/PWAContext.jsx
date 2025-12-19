import React, { createContext, useState, useEffect, useContext } from 'react';

const PWAContext = createContext();

export const PWAProvider = ({ children }) => {
	const [promptInstall, setPromptInstall] = useState(null);
	const [supportsPWA, setSupportsPWA] = useState(false);

	useEffect(() => {
		const handler = (e) => {
			console.log('Złapano prompt PWA globalnie!');
			e.preventDefault();
			setPromptInstall(e);
			setSupportsPWA(true);
		};

		window.addEventListener('beforeinstallprompt', handler);

		return () => window.removeEventListener('beforeinstallprompt', handler);
	}, []);

	const installPWA = async () => {
		if (!promptInstall) return;
		promptInstall.prompt();
		const { outcome } = await promptInstall.userChoice;
		if (outcome === 'accepted') {
			setSupportsPWA(false);
		}
	};

	return (
		<PWAContext.Provider value={{ supportsPWA, installPWA }}>
			{children}
		</PWAContext.Provider>
	);
};

export const usePWA = () => useContext(PWAContext);
