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
	const [reportToClose, setReportToClose] = useState(null);
	const [userReportsData, setUserReportsData] = useState({
		found: [],
		lost: [],
	});

	const translatedStatus = {
		found: 'Znaleziony',
		lost: 'Zaginiony',
	};

	const markAsClosed = async (reportId) => {
		const token = localStorage.getItem('token');
		if (!token) return;

		try {
			await axios.patch(
				import.meta.env.VITE_BACKEND_URL + `/reports/update-status/${reportId}`,
				{ status: 'closed' },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			fetchUserReports();
		} catch (error) {
			console.error('Error updating report status: ', error);
		} finally {
			setReportToClose(null);
		}
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
	const closedReports = allReports.filter((r) => r.status === 'closed');

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
											reportType={translatedStatus[report.type]}   
											reportDate={report.found_date?.split('T')[0]}
											onView={() => { setSelectedPet(report); setMode('view'); }}
											onEdit={() => { setSelectedPet(report); setMode('edit'); }}
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
											reportType={translatedStatus[report.type]}
											reportDate={report.found_date?.split('T')[0]}
											onView={() => { setSelectedPet(report); setMode('view'); }}
											onEdit={() => { setSelectedPet(report); setMode('edit'); }}
											onClose={report.status === 'active' ? () => setReportToClose(report) : undefined}
										/>
									))}
								</div>
							</>
						)}

						{reportToClose && (
							<div className="fixed inset-0 backdrop-blur-2xl flex items-center justify-center z-10000">
							<div className="bg-main p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-md mx-4 border-2 border-cta">
								<p className="text-lg font-bold text-text text-center">
								Czy na pewno chcesz zamknąć zgłoszenie {reportToClose.pet_name}?
								</p>
								<p className="text-sm text-center text-accent">
								Operacja ta zmieni status zgłoszenia na „Zamknięte”.
								</p>
								<div className="flex gap-4">
								<button
									onClick={() => markAsClosed(reportToClose.id)}
									className="bg-negative text-white px-6 py-2 rounded-lg hover:bg-cta-dark transition-colors cursor-pointer"
								>
									Tak, zamknij
								</button>
								<button
									onClick={() => setReportToClose(null)}
									className="px-6 py-2 rounded-lg text-text border-2 border-gray-300 hover:bg-secondary transition-colors cursor-pointer"
								>
									Anuluj
								</button>
								</div>
							</div>
							</div>
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
											reportType={translatedStatus[report.type]}   
											reportDate={report.found_date?.split('T')[0]}
											onView={() => { setSelectedPet(report); setMode('view'); }}
											onEdit={() => { setSelectedPet(report); setMode('edit'); }}
										/>
									))}
								</div>
							</>
						)}
						
						{/* Zamknięte zgłoszenia */}
						{closedReports.length > 0 && (
							<>
								<h3 className='text-xl font-semibold border-b pb-2'>
									Zamknięte zgłoszenia
								</h3>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10 pr-2'>
									{closedReports.map((report) => (
										<PetReportCard
											key={report.id}
											image={report.photo_url[0]}
											petName={report.pet_name}
											reportType={translatedStatus[report.type]}   
											reportDate={report.found_date?.split('T')[0]}
											onView={() => { setSelectedPet(report); setMode('view'); }}
										/>
									))}
								</div>
							</>
						)}
					</>					
				)}
			</div>
			{selectedPet && (
				<PetInfo
					petId={selectedPet.id}
					reportType={selectedPet.type}
					setSelectedPetId={() => setSelectedPet(null)}
					mode={mode}
				/>
			)}
		</div>
	);
};

export default ReportsPage;
