import { useState, useEffect } from 'react';
import axios from 'axios';
import PetCard from "../../../ui/PetCard";
import PetInfo from "../../../ui/PetInfo";
import { useNavigate } from 'react-router-dom';
import AdminOptionsNav from '../../../ui/AdminOptionsNav';

const ManageLostReports = () => {
	const [lostPets, setLostPets] = useState([]);
	const [selectedPet, setSelectedPet] = useState(null); // stan na wybrany raport
	const navigate = useNavigate();

	const petSpeciesTypes = [
		{ value: 'dog', label: 'Pies' },
		{ value: 'cat', label: 'Kot' },
		{ value: 'bird', label: 'Ptak' },
		{ value: 'rodent', label: 'Gryzoń' },
		{ value: 'reptile', label: 'Gad' },
		{ value: 'other', label: 'Inne' },
	];

	const fetchLostPets = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/');
			return;
		}

		try {
			const response = await axios.get(
				import.meta.env.VITE_BACKEND_URL + `/main-page/fetch-pets?type=lost`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const petsWithLabels = response.data.map((pet) => {
				if (pet.pet_species) {
					pet.pet_species =
						petSpeciesTypes.find((s) => s.value === pet.pet_species)?.label ||
						pet.pet_species;
				}
				return pet;
			});

			setLostPets(petsWithLabels);
		} catch (error) {
			console.error('Błąd podczas pobierania zagubionych zwierząt:', error);
		}
	};

	useEffect(() => {
		fetchLostPets();
	}, []);

	const handlePetInfo = (pet) => {
		setSelectedPet(pet);
	};

	return (
		<>
		<AdminOptionsNav />
        <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 mb-6">
                Akceptuj lub odrzuć zgłoszenia zagubionych zwierząt
            </h1>
            <p className="text-md text-gray-600 mb-10">Tutaj możesz akceptować lub odrzucać zgłoszenia zagubionych zwierząt.</p>
            {/* Dodaj tutaj komponenty i logikę do zarządzania zgłoszeniami */}
        </div>
		<div className='flex flex-col gap-2 w-full'>
			{lostPets.map((pet) => (
				<PetCard key={pet.id} pet={pet} handlePetInfo={() => handlePetInfo(pet)} />
			))}
			{selectedPet && (
				<PetInfo pet={selectedPet} setSelectedPet={setSelectedPet} />
			)}
		</div>
        </>
	);
};

export default ManageLostReports;
