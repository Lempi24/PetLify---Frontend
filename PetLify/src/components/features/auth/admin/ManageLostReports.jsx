import { useState, useEffect } from 'react';
import axios from 'axios';
import PetCard from '../../../ui/PetCard';
import PetInfo from '../../../ui/PetInfo';
import { useNavigate } from 'react-router-dom';
import AdminOptionsNav from '../../../ui/AdminOptionsNav';

const ManageLostReports = () => {
	const [lostPets, setLostPets] = useState([]);
	const [selectedPet, setSelectedPet] = useState(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [pendingAction, setPendingAction] = useState({ type: '', petId: null });
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
				import.meta.env.VITE_BACKEND_URL +
					`/main-page/fetch-pets?type=lost&status=pending`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log('FETCH LOST PETS RESPONSE:', response.data);
			const petsWithLabels = response.data.items.map((pet) => {
				if (pet.pet_species) {
					pet.pet_species =
						petSpeciesTypes.find((s) => s.value === pet.pet_species)?.label ||
						pet.pet_species;
				}
				return pet;
			});

			setLostPets(petsWithLabels);
		} catch (error) {
			console.error('Błąd podczas pobierania zgubionych zwierząt:', error);
		}
	};

	useEffect(() => {
		fetchLostPets();
	}, []);

	const handleActionClick = (type, petId) => {
		setPendingAction({ type, petId });
		setShowConfirmDialog(true);
	};

	const handleConfirmAction = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/');
			return;
		}

		try {
			if (pendingAction.type === 'approve') {
				await axios.post(
					import.meta.env.VITE_BACKEND_URL + `/admin-panel/approve-report`,
					{ reportId: pendingAction.petId, reportType: 'lost' },
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
			} else if (pendingAction.type === 'reject') {
				await axios.post(
					import.meta.env.VITE_BACKEND_URL + `/admin-panel/reject-report`,
					{ reportId: pendingAction.petId, reportType: 'lost' },
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
			}

			setLostPets((prev) =>
				prev.filter((pet) => pet.id !== pendingAction.petId)
			);
			setShowConfirmDialog(false);
			setPendingAction({ type: '', petId: null });
		} catch (error) {
			console.error('Błąd podczas wykonywania akcji:', error);
		}
	};

	const handleCancelAction = () => {
		setShowConfirmDialog(false);
		setPendingAction({ type: '', petId: null });
	};

	const handlePetClick = (pet) => {
		setSelectedPet(pet);
	};

	const getActionText = () => {
		if (pendingAction.type === 'approve') {
			return 'zatwierdzić';
		} else if (pendingAction.type === 'reject') {
			return 'odrzucić';
		}
		return '';
	};

	return (
		<>
			<AdminOptionsNav />
			<div className='flex flex-col items-center justify-center text-center mt-16 px-4'>
				<h1 className='text-3xl md:text-4xl font-extrabold text-orange-400 mb-6'>
					Akceptuj lub odrzuć zgłoszenia zaginionych zwierząt
				</h1>
				<p className='text-md text-gray-400 mb-10'>
					Tutaj możesz akceptować lub odrzucać zgłoszenia zaginionych zwierząt.
				</p>
			</div>

			{selectedPet && (
				<PetInfo pet={selectedPet} setSelectedPet={setSelectedPet} />
			)}

			{showConfirmDialog && (
				<div className='fixed inset-0 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
					<div className='bg-main rounded-lg border border-primary shadow-xl max-w-md w-full p-6'>
						<h3 className='text-xl font-bold text-orange-400 mb-4'>
							Potwierdź akcję
						</h3>
						<p className='text-gray-400 mb-6'>
							Czy na pewno chcesz {getActionText()} zgłoszenie o ID:{' '}
							<strong>{pendingAction.petId}</strong>?
						</p>
						<div className='flex justify-end gap-3'>
							<button
								onClick={handleCancelAction}
								className='px-4 py-2 text-gray-400 border border-primary rounded-md hover:bg-gray-800 transition-colors'
							>
								Anuluj
							</button>
							<button
								onClick={handleConfirmAction}
								className={`px-4 py-2 text-white rounded-md transition-colors ${
									pendingAction.type === 'approve'
										? 'bg-green-500 hover:bg-green-600'
										: 'bg-red-500 hover:bg-red-600'
								}`}
							>
								{pendingAction.type === 'approve' ? 'Zatwierdź' : 'Odrzuć'}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className='flex flex-col gap-4 w-full px-4 max-w-4xl mx-auto'>
				{lostPets.map((pet) => (
					<div
						key={pet.id}
						className='flex items-center justify-between border p-4 rounded shadow'
					>
						<PetCard pet={pet} handlePetInfo={handlePetClick} />
						<div className='flex flex-col gap-2 ml-4'>
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleActionClick('approve', pet.id);
								}}
								className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors'
							>
								Zatwierdź
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleActionClick('reject', pet.id);
								}}
								className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors'
							>
								Odrzuć
							</button>
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default ManageLostReports;
