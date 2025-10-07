import AdminOptionsNav from '../../../ui/AdminOptionsNav';

const ManagePermissions = () => {
    return (
        <>
            <AdminOptionsNav />
            <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 mb-6">
                    Zarządzaj uprawnieniami użytkowników
                </h1>
                <p className="text-md text-gray-600 mb-10">Tutaj możesz nadawać lub odbierać uprawnienia użytkownikom.</p>
                {/* Dodaj tutaj komponenty i logikę do zarządzania uprawnieniami */}
            </div>
        </>
    );
};

export default ManagePermissions;