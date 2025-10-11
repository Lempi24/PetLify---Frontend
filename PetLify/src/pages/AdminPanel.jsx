import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AdminOptionsNav from "../components/ui/AdminOptionsNav"; 

const AdminPage = () => {
    const { user } = useAuth();

    if (!user) return <p>Loading...</p>;

    if (user.role != "admin") {
        return <Navigate to="/main-page" replace />;
    }

    return (
	<div className="min-h-screen bg-main text-main">
		<AdminOptionsNav />

		<div className="flex flex-col items-center justify-center text-center mt-16 px-4">
			<h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 mb-6">
				Witaj w panelu administracyjnym
			</h1>
			<p className="text-md text-gray-400 mb-10">Zalogowano jako: {user.email}</p>
		</div>
	</div>
	);
};

export default AdminPage;
