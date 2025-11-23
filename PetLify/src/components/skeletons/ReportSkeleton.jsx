import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ReportSkeleton() {
	return (
		<SkeletonTheme
			baseColor='var(--color-secondary)'
			highlightColor='var(--color-cta)'
		>
			<div className='flex flex-col gap-10 px-5 w-full min-h-screen bg-secondary py-5 overflow-y-auto'>
				<div className='flex items-center'>
					<Skeleton width={40} height={40} borderRadius={8} />
				</div>

				<div>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10 pr-2'>
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className='bg-main rounded-xl overflow-hidden border-cta border-2 flex flex-col'
							>
								{/* IMAGE */}
								<div className='w-full h-52 sm:h-48 lg:aspect-[4/3] overflow-hidden'>
									<Skeleton height='100%' />
								</div>

								{/* CONTENT */}
								<div className='p-4 border-b border-accent space-y-3'>
									<div className='flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2'>
										<Skeleton width={120} height={24} />
										<Skeleton width={80} height={24} borderRadius={12} />
									</div>
									<Skeleton width={140} height={20} />
								</div>

								{/* BUTTONS */}
								<div className='flex flex-col sm:flex-row items-center justify-around p-4 gap-3'>
									<Skeleton width={120} height={36} borderRadius={8} />
									<Skeleton width={100} height={36} borderRadius={8} />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</SkeletonTheme>
	);
}
