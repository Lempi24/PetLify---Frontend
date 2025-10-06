import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SubPagesNav from '../components/ui/SubPagesNav';
import BurgerMenu from '../components/ui/BurgerMenu';
import Gatito from '../img/gatito.jpg';
import PetReportCard from '../components/ui/PetReportCard';
import axios from 'axios';
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
		pending: 'W toku',
		found: 'Znaleziony',
		lost: 'Zaginiony',
	};
	const allReports = [...userReportsData.found, ...userReportsData.lost];
	const fetchUserReports = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/');
		}
		try {
			const response = await axios.get(
				import.meta.env.VITE_BACKEND_URL + `/user-reports/fetch-reports`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			setUserReportsData(response.data);
		} catch (error) {
			console.error('Error fetching user reports data: ', error);
		}
	};
	useEffect(() => {
		fetchUserReports();
	}, []);
	console.log(allReports);
	return (
		<div className='relative flex'>
			<SubPagesNav currentPath={currentPath} isBurgerOpen={isBurgerOpen} />
			<div className='flex flex-col gap-10 px-5 w-full h-screen bg-secondary py-5'>
				<div className='flex items-center'>
					<h2 className='text-2xl border-b-2 w-full py-5'>Moje zgłoszenia</h2>
					<BurgerMenu
						isBurgerOpen={isBurgerOpen}
						handleBurger={() => setIsBurgerOpen((prev) => !prev)}
					/>
				</div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10 h-full custom-scroll pr-2 lg:overflow-y-auto'>
					{/* Bardzo możliwe, że będziemy zmieniać style reportCardów */}
					{allReports.map((report) => (
						<PetReportCard
							image={report.photo_url[0]}
							petName={report.pet_name}
							petStatus={translatedStatus[report.status]}
							reportDate={report.found_date.split('T')[0]}
						/>
					))}
				</div>
			</div>
		</div>
	);
};
export default ReportsPage;
