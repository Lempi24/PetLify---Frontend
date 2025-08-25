import { useState } from 'react';
import PetCard from '../components/ui/PetCard';
import Burek from '../img/burek.jpg';
import { Link, useNavigate } from 'react-router-dom';
import LostDog from '../img/lost-dog.jpg';
import FoundCat from '../img/found-cat.jpg';
const MainPage = () => {
	const [activeTab, setActiveTab] = useState('lost');
	const [userPanelActive, setUserPanelActive] = useState(false);
	const [handlePopUpState, setHandlePopUpState] = useState({
		formChoiceActive: false,
		formActive: false,
	});
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
		<div className='relative bg-secondary flex lg:h-screen'>
			<div className='lg:flex lg:w-4/10 lg:bg-main items-center justify-center overflow-y-hidden hidden'>
				<h2 className='font-bold text-4xl text-center'>Tutaj będzie mapa!</h2>
			</div>
			<div className='flex flex-col items-center justify-center gap-2 py-4 px-6 lg:w-6/10 w-full'>
				<div className='w-full'>
					<button
						onClick={() =>
							setHandlePopUpState({
								formChoiceActive: true,
								formActive: false,
							})
						}
						className='bg-cta w-full rounded-xl p-2 cursor-pointer'
					>
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
			{handlePopUpState.formChoiceActive && (
				<div className='fixed w-full h-full z-100 backdrop-blur-2xl'>
					<div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-9/10 lg:w-1/2 bg-main rounded-2xl p-6'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 640 640'
							className='fill-text h-[75px]'
						>
							<path d='M298.5 156.9C312.8 199.8 298.2 243.1 265.9 253.7C233.6 264.3 195.8 238.1 181.5 195.2C167.2 152.3 181.8 109 214.1 98.4C246.4 87.8 284.2 114 298.5 156.9zM164.4 262.6C183.3 295 178.7 332.7 154.2 346.7C129.7 360.7 94.5 345.8 75.7 313.4C56.9 281 61.4 243.3 85.9 229.3C110.4 215.3 145.6 230.2 164.4 262.6zM133.2 465.2C185.6 323.9 278.7 288 320 288C361.3 288 454.4 323.9 506.8 465.2C510.4 474.9 512 485.3 512 495.7L512 497.3C512 523.1 491.1 544 465.3 544C453.8 544 442.4 542.6 431.3 539.8L343.3 517.8C328 514 312 514 296.7 517.8L208.7 539.8C197.6 542.6 186.2 544 174.7 544C148.9 544 128 523.1 128 497.3L128 495.7C128 485.3 129.6 474.9 133.2 465.2zM485.8 346.7C461.3 332.7 456.7 295 475.6 262.6C494.5 230.2 529.6 215.3 554.1 229.3C578.6 243.3 583.2 281 564.3 313.4C545.4 345.8 510.3 360.7 485.8 346.7zM374.1 253.7C341.8 243.1 327.2 199.8 341.5 156.9C355.8 114 393.6 87.8 425.9 98.4C458.2 109 472.8 152.3 458.5 195.2C444.2 238.1 406.4 264.3 374.1 253.7z' />
						</svg>
						<button
							onClick={() =>
								setHandlePopUpState({
									formChoiceActive: false,
									formActive: false,
								})
							}
							className='absolute right-5 cursor-pointer'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 640 640'
								className='fill-cta w-[30px]'
							>
								<path d='M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z' />
							</svg>
						</button>
						<div className='relative space-y-3 mb-3'>
							<p className='text-center text-3xl font-bold'>
								Status zwierzęcia
							</p>
							<p className='text-center'>Wybierz odpowiednią opcję:</p>
						</div>
						<div className='flex items-center justify-around'>
							<div className='relative p-1 w-1/2'>
								<button className='group h-100 w-full overflow-hidden cursor-pointer'>
									<img
										src={LostDog}
										alt='Confused dog looking up'
										className='w-full h-full object-cover object-center group-hover:scale-150 transition-transform duration-300'
									/>
									<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full h-full bg-main-transparent'>
										<p className='text-xl font-bold group-hover:scale-80 transition-transform duration-300'>
											Zaginiony
										</p>
									</div>
								</button>
							</div>
							<div className='relative p-1 w-1/2'>
								<button className='group h-100 w-full overflow-hidden cursor-pointer'>
									<img
										src={FoundCat}
										alt='Relaxed cat sleeping on the couch'
										className='w-full h-full object-cover object-center group-hover:scale-150 transition-transform duration-300'
									/>
									<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full h-full bg-main-transparent'>
										<p className='text-xl font-bold group-hover:scale-80 transition-transform duration-300'>
											Znaleziony
										</p>
									</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
export default MainPage;
