import { useState } from 'react';
import PetCard from '../components/ui/PetCard';
import Burek from '../img/burek.jpg';
import { Link, useNavigate } from 'react-router-dom';
const MainPage = () => {
	const [activeTab, setActiveTab] = useState('lost');
	const [userPanelActive, setUserPanelActive] = useState(false);
	const pets = [
		{
			id: 1,
			name: 'Burek',
			species: 'Pies',
			breed: 'Mieszaniec',
			location: 'Os. Zwycięstwa, Poznań',
			imageUrl: Burek,
		},
		{
			id: 2,
			name: 'Mruczek',
			species: 'Kot',
			breed: 'Dachowiec',
			location: 'Jeżyce, Poznań',
			imageUrl: Burek,
		},
		{
			id: 3,
			name: 'Fiona',
			species: 'Pies',
			breed: 'Labrador Retriever',
			location: 'Wilda, Poznań',
			imageUrl: Burek,
		},
		{
			id: 4,
			name: 'Puszek',
			species: 'Królik',
			breed: 'Mini Lop',
			location: 'Grunwald, Poznań',
			imageUrl: Burek,
		},
		{
			id: 5,
			name: 'Ćwirek',
			species: 'Ptak',
			breed: 'Kanarek',
			location: 'Rataje, Poznań',
			imageUrl: Burek,
		},
		{
			id: 6,
			name: 'Bella',
			species: 'Kot',
			breed: 'Ragdoll',
			location: 'Łazarz, Poznań',
			imageUrl: Burek,
		},
		{
			id: 7,
			name: 'Szczurek',
			species: 'Gryzoń',
			breed: 'Szczur domowy',
			location: 'Stare Miasto, Poznań',
			imageUrl: Burek,
		},
		{
			id: 8,
			name: 'Max',
			species: 'Pies',
			breed: 'Owczarek Niemiecki',
			location: 'Nowe Miasto, Poznań',
			imageUrl: Burek,
		},
		{
			id: 9,
			name: 'Figaro',
			species: 'Kot',
			breed: 'Maine Coon',
			location: 'Piątkowo, Poznań',
			imageUrl: Burek,
		},
		{
			id: 10,
			name: 'Złotko',
			species: 'Gryzoń',
			breed: 'Chomik syryjski',
			location: 'Winogrady, Poznań',
			imageUrl: Burek,
		},
	];
	const handleLogOut = () => {
		//Tutaj będzie logika wylogowania, zabicie tokena, navigacja do logowania
		alert('Wylogowanie');
	};
	return (
		<div className='bg-secondary flex lg:h-screen'>
			<div className='lg:flex lg:w-4/10 lg:bg-main items-center justify-center overflow-y-hidden hidden'>
				<h2 className='font-bold text-4xl text-center'>Tutaj będzie mapa!</h2>
			</div>
			<div className='flex flex-col items-center justify-center gap-2 py-4 px-6 lg:w-6/10 w-full'>
				<div className='w-full'>
					<button className='bg-cta w-full rounded-xl p-2 cursor-pointer'>
						+ Zgłoś zwierzę
					</button>
				</div>
				<div className='flex w-full gap-2'>
					<button
						className={`w-1/2 rounded-xl p-2 cursor-pointer transition-colors ${
							activeTab === 'lost' ? 'bg-cta' : 'bg-gray-300 text-main'
						}`}
						onClick={() => setActiveTab('lost')}
					>
						Zaginione
					</button>
					<button
						className={`w-1/2 rounded-xl p-2 cursor-pointer transition-colors ${
							activeTab === 'found' ? 'bg-cta' : 'bg-gray-300 text-main'
						}`}
						onClick={() => setActiveTab('found')}
					>
						Znalezione
					</button>
				</div>
				<div className='relative w-full flex items-center justify-between'>
					<button className='w-[50px] h-[50px] bg-cta rounded-xl fill-text p-1 cursor-pointer'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 640 640'
							className='w-full h-full'
						>
							<path d='M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z' />
						</svg>
					</button>
					<button
						onClick={() => setUserPanelActive((prev) => !prev)}
						className='w-[50px] h-[50px] bg-white rounded-full p-1 z-1 cursor-pointer'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 640 640'
							className='w-full h-full'
						>
							<path d='M320 312C253.7 312 200 258.3 200 192C200 125.7 253.7 72 320 72C386.3 72 440 125.7 440 192C440 258.3 386.3 312 320 312zM289.5 368L350.5 368C360.2 368 368 375.8 368 385.5C368 389.7 366.5 393.7 363.8 396.9L336.4 428.9L367.4 544L368 544L402.6 405.5C404.8 396.8 413.7 391.5 422.1 394.7C484 418.3 528 478.3 528 548.5C528 563.6 515.7 575.9 500.6 575.9L139.4 576C124.3 576 112 563.7 112 548.6C112 478.4 156 418.4 217.9 394.8C226.3 391.6 235.2 396.9 237.4 405.6L272 544.1L272.6 544.1L303.6 429L276.2 397C273.5 393.8 272 389.8 272 385.6C272 375.9 279.8 368.1 289.5 368.1z' />
						</svg>
					</button>
					{/* Panel użytkownika. Animacje do ewentualnej poprawy */}
					<div
						className={`absolute right-0 top-[calc(50%-25px)] bg-user-options-fill w-full max-w-[500px] md:w-1/2 lg:w-1/2 z-0 flex flex-col gap-4 rounded-3xl p-3 transition-all duration-300 ease-in-out origin-right ${
							userPanelActive
								? 'opacity-100 scale-100'
								: 'opacity-0 scale-95 pointer-events-none'
						}`}
					>
						<div>
							<p className='text-xl font-bold'>Jan Kowalski</p>
							<p className='text-sm'>example@gmail.com</p>
						</div>
						<div className='flex flex-col items-center gap-3'>
							<Link
								to='/chats'
								className='bg-cta w-9/10 rounded-2xl p-2 font-bold cursor-pointer text-center'
							>
								Moje czaty
							</Link>
							<Link
								to='/reports'
								className='bg-cta w-9/10 rounded-2xl p-2 font-bold cursor-pointer text-center'
							>
								Moje zgłoszenia
							</Link>
							<Link
								to='/settings'
								className='bg-cta w-9/10 rounded-2xl p-2 font-bold cursor-pointer text-center'
							>
								Ustawienia konta
							</Link>
							<div className='w-9/10'>
								<button
									className='flex items-center cursor-pointer gap-3'
									onClick={handleLogOut}
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										viewBox='0 0 640 640'
										className='fill-cta w-[25px]'
									>
										<path d='M224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160zM566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L438.6 169.3C426.1 156.8 405.8 156.8 393.3 169.3C380.8 181.8 380.8 202.1 393.3 214.6L466.7 288L256 288C238.3 288 224 302.3 224 320C224 337.7 238.3 352 256 352L466.7 352L393.3 425.4C380.8 437.9 380.8 458.2 393.3 470.7C405.8 483.2 426.1 483.2 438.6 470.7L566.6 342.7z' />
									</svg>
									Wyloguj się
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className='custom-scroll flex flex-col w-full gap-2 lg:overflow-y-scroll pr-2'>
					{pets.map((pet) => (
						<PetCard key={pet.id} pet={pet} />
					))}
				</div>
			</div>
		</div>
	);
};
export default MainPage;
