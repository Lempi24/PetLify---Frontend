import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ChatSkeleton() {
	return (
		<SkeletonTheme
			baseColor='var(--color-secondary)'
			highlightColor='var(--color-cta)'
		>
			<div className='flex flex-col gap-4 pb-10 h-full pr-2 lg:overflow-y-auto custom-scroll'>
				{Array.from({ length: 5 }).map((_, index) => (
					<div
						key={index}
						className='relative bg-main rounded-2xl p-4 pr-16 shadow-[0_6px_18px_rgba(0,0,0,.35)]'
					>
						<div className='absolute -left-2 top-2 bottom-2 w-2 rounded-xl bg-accent/40' />

						<div className='absolute right-3 top-3'>
							<Skeleton width={80} height={24} borderRadius={8} />
						</div>

						<div className='absolute right-3 bottom-3'>
							<Skeleton circle width={24} height={24} />
						</div>

						<div className='flex items-start gap-4'>
							<Skeleton circle width={54} height={54} />

							<div className='flex-1 min-w-0 space-y-2'>
								<Skeleton width='60%' height={20} />
								<Skeleton width='80%' height={16} />
								<Skeleton width='90%' height={16} />
							</div>
						</div>
					</div>
				))}
			</div>
		</SkeletonTheme>
	);
}
