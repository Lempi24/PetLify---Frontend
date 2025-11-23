import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function PetInfoSkeleton({ onClose }) {
	return (
		<SkeletonTheme
			baseColor='var(--color-secondary)'
			highlightColor='var(--color-accent)'
		>
			<div className='fixed backdrop-blur-2xl h-screen w-screen z-100'>
				<div className='fixed left-1/2 -translate-x-1/2 h-full w-full lg:w-1/2 bg-main overflow-y-auto p-6 custom-scroll overflow-x-hidden'>
					<div className='flex flex-col gap-8'>
						{/* Header */}
						<div className='flex items-center gap-4'>
							<Skeleton width={200} height={40} className='text-4xl' />
							<Skeleton width={120} height={40} borderRadius={16} />
							<button
								onClick={onClose}
								className='absolute right-5 cursor-pointer'
								aria-label='Zamknij'
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
						{/* Image Carousel */}
						<div className='h-64 lg:h-[500px]'>
							<Skeleton height='100%' borderRadius={8} />
						</div>
					</div>

					{/* Dane zwierzaka */}
					<div className='flex flex-col py-8 border-b-2 border-accent gap-4'>
						<div className='flex items-center gap-2'>
							<p className='bold text-xl'>Gatunek:</p>
							<Skeleton width={150} height={24} />
						</div>
						<div className='flex items-center gap-2'>
							<p className='bold text-xl'>Rasa:</p>
							<Skeleton width={180} height={24} />
						</div>
						<div className='flex items-center gap-2'>
							<p className='bold text-xl'>Wiek:</p>
							<Skeleton width={100} height={24} />
						</div>
						<div className='flex items-center gap-2'>
							<p className='bold text-xl'>Kolor:</p>
							<Skeleton width={120} height={24} />
						</div>
						<div className='flex items-center gap-2'>
							<p className='bold text-xl'>Rozmiar:</p>
							<Skeleton width={140} height={24} />
						</div>

						{/* Znaki szczególne */}
						<div className='space-y-2 mt-6 border-t border-secondary pt-4'>
							<p className='font-bold text-xl'>Znaki szczególne:</p>
							<Skeleton count={3} height={20} />
						</div>

						{/* Lokalizacja */}
						<div className='space-y-2 mt-6 border-t border-secondary pt-4'>
							<p className='font-bold text-xl'>Ostatnio widziany:</p>
							<Skeleton width={250} height={24} />
						</div>
					</div>

					{/* Mapa */}
					<div className='border-b-2 border-accent pb-8'>
						<div className='w-full h-[200px] flex justify-center items-center bg-secondary rounded-2xl mt-8'>
							<Skeleton height={200} borderRadius={16} />
						</div>
					</div>

					{/* Kontakt + akcje */}
					<div className='flex flex-col py-8 space-y-2'>
						<p className='font-bold text-xl mb-4'>Kontakt do właściciela:</p>
						<Skeleton width={200} height={20} />
						<Skeleton width={220} height={20} />
						<Skeleton width={150} height={20} />

						<div className='ml-auto pt-2'>
							<Skeleton width={80} height={36} borderRadius={16} />
						</div>
					</div>
				</div>
			</div>
		</SkeletonTheme>
	);
}
