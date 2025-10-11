import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from "../../../../hooks/useAuth";
import AdminOptionsNav from '../../../ui/AdminOptionsNav';

const ManagePermissions = () => {
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('user');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    if (!user) return <p>Loading...</p>;

    if (user.role !== 'admin') {
        return <Navigate to="/main-page" replace />;
    }

    const handleUpdatePermissions = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setMessage('Proszę podać adres email użytkownika');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch( 
                import.meta.env.VITE_BACKEND_URL + '/admin-panel/manage-permissions', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        userEmail: email,
                        newRole: selectedRole,
                    }),
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Nieautoryzowany dostęp. Zaloguj się ponownie.');
                }
                if (response.status === 403) {
                    throw new Error('Brak uprawnień administratora');
                }
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Email i rola są wymagane');
                }
                if (response.status === 404) {
                    throw new Error('Użytkownik o podanym emailu nie istnieje');
                }
                if (response.status === 500) {
                    throw new Error('Błąd serwera podczas aktualizacji uprawnień');
                }
                throw new Error(`Błąd HTTP: ${response.status}`);
            }

            const data = await response.json();

            setMessage(`Pomyślnie zaktualizowano uprawnienia dla ${email} na rolę: ${selectedRole}`);
            setEmail('');
            setSelectedRole('user');
            
        } catch (error) {
            console.error('Error updating permissions:', error);
            
            if (error.message.includes('Nieautoryzowany') || error.message.includes('Brak danych')) {
                setMessage(`${error.message}. Sprawdź czy jesteś zalogowany.`);
            } else {
                setMessage(error.message || 'Wystąpił błąd podczas komunikacji z serwerem');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AdminOptionsNav />
            <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 mb-6">
                    Zarządzaj uprawnieniami użytkowników
                </h1>
                <p className="text-md text-gray-400 mb-10">
                    Tutaj możesz nadawać lub odbierać uprawnienia użytkownikom.
                </p>

                <div className="w-full max-w-md bg-secondary rounded-lg p-6 shadow-lg">
                    <form onSubmit={handleUpdatePermissions} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email użytkownika
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="text-text pl-12 pr-3 py-3 rounded-md bg-secondary border-cta border-2 placeholder:text-gray w-full "
                                placeholder="Wprowadź email użytkownika"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                                Wybierz rolę
                            </label>
                            <select
                                id="role"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="pl-12 pr-3 py-3 rounded-md bg-secondary border-cta border-2 placeholder:text-gray w-full "
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 rounded-md font-medium ${
                                isLoading
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-cta hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800'
                            } text-white transition-colors`}
                        >
                            {isLoading ? 'Aktualizowanie...' : 'Zaktualizuj uprawnienia'}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-4 p-3 rounded-md ${
                            message.includes('Pomyślnie') 
                                ? 'bg-green-900 text-green-200' 
                                : 'bg-red-900 text-red-200'
                        }`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ManagePermissions;