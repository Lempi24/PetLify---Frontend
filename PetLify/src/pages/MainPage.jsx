import { useState } from 'react';
import PetCard from '../components/PetCard';
import Burek from '../img/burek.jpg';
const MainPage = () => {
	const [activeTab, setActiveTab] = useState('lost');
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
	return (
		<div className='bg-secondary flex lg:h-screen'>
			<div className='lg:flex lg:w-4/10 lg:bg-main items-center justify-center overflow-y-hidden hidden'>
				<h2 className='font-bold text-4xl text-center'>Tutaj będzie mapa!</h2>
			</div>
			<div className='flex flex-col items-center justify-center gap-2 py-4 px-6 lg:w-6/10'>
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
				<div className='w-full flex items-center justify-between'>
					<button className='w-[50px] h-[50px] bg-cta rounded-xl fill-text p-1'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 640 640'
							className='w-full h-full'
						>
							<path d='M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z' />
						</svg>
					</button>
					{/* Tutaj będzie avatar, się potem zastanowimy nad jego wyglądem jak będzie server hulać */}
					<button className='w-[50px] h-[50px] bg-white rounded-full p-1'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 640 640'
							className='w-full h-full'
						>
							<path d='M320 312C253.7 312 200 258.3 200 192C200 125.7 253.7 72 320 72C386.3 72 440 125.7 440 192C440 258.3 386.3 312 320 312zM289.5 368L350.5 368C360.2 368 368 375.8 368 385.5C368 389.7 366.5 393.7 363.8 396.9L336.4 428.9L367.4 544L368 544L402.6 405.5C404.8 396.8 413.7 391.5 422.1 394.7C484 418.3 528 478.3 528 548.5C528 563.6 515.7 575.9 500.6 575.9L139.4 576C124.3 576 112 563.7 112 548.6C112 478.4 156 418.4 217.9 394.8C226.3 391.6 235.2 396.9 237.4 405.6L272 544.1L272.6 544.1L303.6 429L276.2 397C273.5 393.8 272 389.8 272 385.6C272 375.9 279.8 368.1 289.5 368.1z' />
						</svg>
					</button>
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
