import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useUser } from '../../context/UserContext';
const SubPagesNav = ({ currentPath, isBurgerOpen }) => {
	const { user } = useUser();
	return (
		<div
			className={`lg:w-2/5 px-10 space-y-10 bg-main h-full w-full z-100 ${
				isBurgerOpen ? 'block absolute py-10' : 'hidden'
			} lg:block py-5`}
		>
			<div className='flex items-center gap-3'>
				<Link to='/main-page'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 640 640'
						className='fill-cta w-[25px]'
					>
						<path d='M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z' />
					</svg>
				</Link>
				{/* Tutaj zamiast przycisku będzie avatar użytkownika, skopiowałem go z maina jako refka */}
				{/* Zamiast button będzie img, potem się to ostyluje */}
				<button className='w-[50px] h-[50px] bg-white rounded-full p-1 z-1 cursor-pointer'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 640 640'
						className='w-full h-full'
					>
						<path d='M320 312C253.7 312 200 258.3 200 192C200 125.7 253.7 72 320 72C386.3 72 440 125.7 440 192C440 258.3 386.3 312 320 312zM289.5 368L350.5 368C360.2 368 368 375.8 368 385.5C368 389.7 366.5 393.7 363.8 396.9L336.4 428.9L367.4 544L368 544L402.6 405.5C404.8 396.8 413.7 391.5 422.1 394.7C484 418.3 528 478.3 528 548.5C528 563.6 515.7 575.9 500.6 575.9L139.4 576C124.3 576 112 563.7 112 548.6C112 478.4 156 418.4 217.9 394.8C226.3 391.6 235.2 396.9 237.4 405.6L272 544.1L272.6 544.1L303.6 429L276.2 397C273.5 393.8 272 389.8 272 385.6C272 375.9 279.8 368.1 289.5 368.1z' />
					</svg>
				</button>
				<div>
					<p>{user?.first_name + ' ' + user?.surname || 'Użytkownik'}</p>
					<p>{user?.email}</p>
				</div>
			</div>
			<div className='flex flex-col gap-3'>
				<Link
					to='/chats'
					className={`p-4 w-9/10 border-b-2 border-cta ${
						currentPath === '/chats' ? 'bg-cta text-main' : ''
					}`}
				>
					Moje czaty
				</Link>
				<Link
					to='/reports'
					className={`p-4 w-9/10 border-b-2 border-cta ${
						currentPath === '/reports' ? 'bg-cta text-main' : ''
					}`}
				>
					Moje zgłoszenia
				</Link>
				<Link
					to='/settings'
					className={`p-4 w-9/10 border-b-2 border-cta ${
						currentPath === '/settings' ? 'bg-cta text-main' : ''
					}`}
				>
					Ustawienia
				</Link>
			</div>
		</div>
	);
};
export default SubPagesNav;
