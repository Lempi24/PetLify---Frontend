import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PetProfileSkeleton = () => {
	return (
		<SkeletonTheme
			baseColor='var(--color-secondary)'
			highlightColor='var(--color-cta)'
		>
			<div
				className='bg-main lg:flex lg:items-center rounded-xl w-full py-3 px-3 
                   shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] 
                   border border-secondary max-w-screen-lg'
			>
				<div className='flex items-center flex-1'>
					<Skeleton
						circle
						width={72}
						height={72}
						className='mr-3 border-2 border-cta'
					/>

					<div className='flex flex-col justify-between flex-1 gap-1'>
						<Skeleton width={150} height={24} />

						<div className='text-base text-accent inline-block'>
							<span className='border-t border-gray-300 w-[81%] block mb-1'></span>

							<Skeleton width={200} height={18} />
						</div>
					</div>
				</div>

				<div className='flex items-center justify-around gap-2 mt-4 lg:mt-0'>
					<Skeleton width={80} height={32} />
					<Skeleton width={80} height={32} />
					<Skeleton width={80} height={32} />
				</div>
			</div>
		</SkeletonTheme>
	);
};
export default PetProfileSkeleton;
