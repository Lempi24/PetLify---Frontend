import ImageCarousel from './ImageCarousel';
import useAuth from '../../hooks/useAuth';
const PetInfo = ({ pet, setSelectedPet }) => {
	const loggedUser = useAuth();
	const isOwner = loggedUser && loggedUser.email === pet.owner;
	return (
		<div
			className='fixed backdrop-blur-2xl h-screen w-screen z-10'
			onClick={() => setSelectedPet(null)}
		>
			<div
				className='fixed left-1/2 -translate-x-1/2 h-full w-full lg:w-1/2 bg-main  overflow-y-auto p-6'
				onClick={(e) => e.stopPropagation()}
			>
				<div className='flex flex-col gap-8'>
					<div className='flex items-center gap-4'>
						<h2 className='font-bold text-4xl'>{pet.pet_name}</h2>
						<span className='bg-negative p-2 rounded-2xl'>Zaginiony</span>
						<button
							onClick={() => setSelectedPet(null)}
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
					</div>
					<ImageCarousel images={pet.photo_url} />
				</div>
				<div className='flex flex-col py-8 border-b-2 border-accent gap-4'>
					<div className='flex items-center gap-2'>
						<p className='bold text-xl'>Gatunek:</p>
						<p className='text-accent'>{pet.pet_species}</p>
					</div>
					<div className='flex items-center gap-2'>
						<p className='bold text-xl'>Rasa:</p>
						<p className='text-accent'>{pet.pet_breed}</p>
					</div>
					<div className='flex items-center gap-2'>
						<p className='bold text-xl'>Wiek:</p>
						<p className='text-accent'>Ok. {pet.pet_age}</p>
					</div>

					<div className='space-y-2 mt-6 border-t border-secondary pt-4'>
						<p className='font-bold text-xl'>Znaki szczególne:</p>
						<p className='text-accent'>{pet.description}</p>
					</div>

					<div className='space-y-2 mt-6 border-t border-secondary pt-4'>
						<p className='font-bold text-xl'>Ostatnio widziany:</p>
						<p className='text-accent'>
							01.03.2022, ok 18:30 <br />
							{pet.street}, {pet.city}
						</p>
					</div>
				</div>
				<div className='border-b-2 border-accent pb-8'>
					<div className='w-full h-[200px] flex justify-center items-center bg-secondary rounded-2xl mt-8'>
						<p>Tutaj będzie mapa... SERIO!</p>
					</div>
				</div>
				<div className='flex flex-col py-8 space-y-2'>
					<p className='font-bold text-xl mb-4'>Kontakt do właściciela:</p>
					<p className='text-accent'>{pet.owner}</p>
					<p className='text-accent'>Tel: {pet.phone}</p>
					{!isOwner && (
						<button className='bg-cta rounded-2xl py-1 px-3 ml-auto text-lg cursor-pointer'>
							Chat
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
export default PetInfo;
