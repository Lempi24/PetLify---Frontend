import PetProfiles from '../components/ui/PetProfiles';
import SubPagesNav from '../components/ui/SubPagesNav';
import BurgerMenu from '../components/ui/BurgerMenu';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const PetProfilesPage = () => {
	const location = useLocation();
	const currentPath = location.pathname;
	const [isBurgerOpen, setIsBurgerOpen] = useState(false);

	return (
		<div className="relative flex">
			<SubPagesNav currentPath={currentPath} isBurgerOpen={isBurgerOpen} />

			<div className="flex flex-col gap-6 px-5 w-full h-screen bg-secondary py-5 overflow-y-auto">
				<div className="flex items-center justify-between pb-4">
					<h2 className="text-2xl border-b-2 w-full py-5">Profile zwierząt</h2>
					<BurgerMenu
						isBurgerOpen={isBurgerOpen}
						handleBurger={() => setIsBurgerOpen((prev) => !prev)}
					/>
				</div>

				<div className="flex-1">
					<PetProfiles />
				</div>
			</div>
		</div>
	);
};

export default PetProfilesPage;
