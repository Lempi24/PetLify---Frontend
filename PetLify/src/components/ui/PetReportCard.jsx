const PetReportCard = ({
	image,
	petName,
	petStatus,
	reportDate,
	onView,
	onEdit,
}) => {
	return (
		<div className='bg-main rounded-xl overflow-hidden border-cta border-2 flex flex-col'>
			{/* IMAGE */}
			<div className='w-full h-52 sm:h-48 lg:aspect-[4/3] overflow-hidden'>
				<img src={image} alt='Kicik' className='w-full h-full object-cover' />
			</div>

			{/* CONTENT */}
			<div className='p-4 border-b border-accent space-y-3'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2'>
					<h2 className='font-bold text-xl sm:text-2xl'>{petName}</h2>

					<p
						className={`${
							petStatus === 'zaginiony'
								? 'bg-negative'
								: petStatus === 'znaleziony'
								? 'bg-positive'
								: 'bg-cta'
						} px-3 py-1 rounded-xl w-fit`}
					>
						{petStatus}
					</p>
				</div>

				<p className='text-sm sm:text-base'>Zgłoszono: {reportDate}</p>
			</div>

			{/* BUTTONS */}
			<div className='flex flex-col sm:flex-row items-center justify-around p-4 gap-3'>
				<button onClick={onView} className='text-cta cursor-pointer p-2'>
					Zobacz szczegóły
				</button>
				<button onClick={onEdit} className='text-cta cursor-pointer p-2'>
					Edytuj
				</button>
			</div>
		</div>
	);
};
export default PetReportCard;
