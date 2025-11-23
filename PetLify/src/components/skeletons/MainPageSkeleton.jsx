import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function MainPageSkeleton() {
	return (
		<SkeletonTheme
			baseColor='var(--color-secondary)'
			highlightColor='var(--color-cta)'
		>
			<div className='custom-scroll flex flex-col w-full gap-2 lg:overflow-y-scroll pr-2'>
				{[...Array(5)].map((_, index) => (
					<div
						key={index}
						className='bg-main rounded-xl p-3 flex items-center w-full'
					>
						{/* Zdjęcie zwierzaka */}
						<Skeleton width={60} height={60} circle />

						{/* Informacje o zwierzaku */}
						<div className='ml-4 flex-1 flex flex-col gap-1'>
							<Skeleton width='40%' height={32} /> {/* pet_name */}
							<Skeleton width='60%' height={20} /> {/* gatunek/rasa */}
						</div>
					</div>
				))}
			</div>
		</SkeletonTheme>
	);
}
