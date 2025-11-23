import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SubPagesNav from '../components/ui/SubPagesNav';
import BurgerMenu from '../components/ui/BurgerMenu';
import PetInfo from '../components/ui/PetInfo';
import PetReportCard from '../components/ui/PetReportCard';
import axios from 'axios';
import ReportSkeleton from '../components/skeletons/ReportSkeleton';
const ReportsPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const currentPath = location.pathname;
	const [isBurgerOpen, setIsBurgerOpen] = useState(false);
	const [userReportsData, setUserReportsData] = useState({
		found: [],
		lost: [],
	});

	const translatedStatus = {
		pending: 'Oczekiwanie',
		active: 'Aktywne',
		rejected: 'Odrzucone',
		found: 'Znaleziony',
		lost: 'Zaginiony',
	};

	const allReports = [...userReportsData.found, ...userReportsData.lost];
	const [selectedPet, setSelectedPet] = useState(null);
	const [mode, setMode] = useState('view');
	const [loading, setLoading] = useState(false);
	const fetchUserReports = async () => {
		const token = localStorage.getItem('token');
		setLoading(true);
		if (!token) {
			navigate('/');
		}
		try {
			const response = await axios.get(
				import.meta.env.VITE_BACKEND_URL + `/reports/fetch-reports`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			setUserReportsData(response.data);
		} catch (error) {
			console.error('Error fetching user reports data: ', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUserReports();
	}, []);

	// Podział na sekcje wg statusu
	const pendingReports = allReports.filter((r) => r.status === 'pending');
	const activeReports = allReports.filter((r) => r.status === 'active');
	const rejectedReports = allReports.filter((r) => r.status === 'rejected');

	return (
		<div className='relative flex'>
			<SubPagesNav currentPath={currentPath} isBurgerOpen={isBurgerOpen} />

			<div className='relative flex flex-col gap-10 px-5 w-full min-h-screen bg-secondary py-5 overflow-y-auto'>
				<div className='flex items-center'>
					<h2 className='text-2xl border-b-2 w-full py-5'>Moje zgłoszenia</h2>
					<BurgerMenu
						isBurgerOpen={isBurgerOpen}
						handleBurger={() => setIsBurgerOpen((prev) => !prev)}
					/>
				</div>

				{loading ? (
					<ReportSkeleton />
				) : (
					<>
						{/* Oczekiwanie */}
						{pendingReports.length > 0 && (
							<>
								<h3 className='text-xl font-semibold border-b pb-2'>
									Oczekiwanie
								</h3>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10 pr-2'>
									{pendingReports.map((report) => (
										<PetReportCard
											key={report.id}
											image={report.photo_url[0]}
											petName={report.pet_name}
											petStatus={translatedStatus[report.status]}
											reportDate={report.found_date?.split('T')[0]}
											onView={() => {
												setSelectedPet(report);
												setMode('view');
											}}
											onEdit={() => {
												setSelectedPet(report);
												setMode('edit');
											}}
										/>
									))}
								</div>
							</>
						)}

						{/* Aktywne */}
						{activeReports.length > 0 && (
							<>
								<h3 className='text-xl font-semibold border-b pb-2'>Aktywne</h3>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10 pr-2'>
									{activeReports.map((report) => (
										<PetReportCard
											key={report.id}
											image={report.photo_url[0]}
											petName={report.pet_name}
											petStatus={translatedStatus[report.status]}
											reportDate={report.found_date?.split('T')[0]}
											onView={() => {
												setSelectedPet(report);
												setMode('view');
											}}
											onEdit={() => {
												setSelectedPet(report);
												setMode('edit');
											}}
										/>
									))}
								</div>
							</>
						)}

						{/* Odrzucone */}
						{rejectedReports.length > 0 && (
							<>
								<h3 className='text-xl font-semibold border-b pb-2'>
									Odrzucone
								</h3>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10 pr-2'>
									{rejectedReports.map((report) => (
										<PetReportCard
											key={report.id}
											image={report.photo_url[0]}
											petName={report.pet_name}
											petStatus={translatedStatus[report.status]}
											reportDate={report.found_date?.split('T')[0]}
											onView={() => {
												setSelectedPet(report);
												setMode('view');
											}}
											onEdit={() => {
												setSelectedPet(report);
												setMode('edit');
											}}
										/>
									))}
								</div>
							</>
						)}
					</>
				)}

				{selectedPet && (
					<PetInfo
						petId={selectedPet.id}
						reportType={selectedPet.type}
						setSelectedPetId={() => setSelectedPet(null)}
						mode={mode}
					/>
				)}
			</div>
		</div>
	);
};

export default ReportsPage;
