import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SubPagesNav from '../components/ui/SubPagesNav';
import BurgerMenu from '../components/ui/BurgerMenu';
import Gatito from '../img/gatito.jpg';
import PetReportCard from '../components/ui/PetReportCard';
const ReportsPage = () => {
	const location = useLocation();
	const currentPath = location.pathname;
	const [isBurgerOpen, setIsBurgerOpen] = useState(false);
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
					<PetReportCard
						image={Gatito}
						petName={'Kicik'}
						petStatus={'Zaginiony'}
						reportDate={'01.03.2024'}
					/>
					<PetReportCard
						image={Gatito}
						petName={'Kicik'}
						petStatus={'Zaginiony'}
						reportDate={'01.03.2024'}
					/>
					<PetReportCard
						image={Gatito}
						petName={'Kicik'}
						petStatus={'Zaginiony'}
						reportDate={'01.03.2024'}
					/>
					<PetReportCard
						image={Gatito}
						petName={'Kicik'}
						petStatus={'Zaginiony'}
						reportDate={'01.03.2024'}
					/>
					<PetReportCard
						image={Gatito}
						petName={'Kicik'}
						petStatus={'Zaginiony'}
						reportDate={'01.03.2024'}
					/>
					<PetReportCard
						image={Gatito}
						petName={'Kicik'}
						petStatus={'Zaginiony'}
						reportDate={'01.03.2024'}
					/>
					<PetReportCard
						image={Gatito}
						petName={'Kicik'}
						petStatus={'Zaginiony'}
						reportDate={'01.03.2024'}
					/>
				</div>
			</div>
		</div>
	);
};
export default ReportsPage;
