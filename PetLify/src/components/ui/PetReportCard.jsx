const PetReportCard = ({
	image,
	petName,
	reportType,
	reportStatus,
	reportDate,
	onView,
	onEdit,
	onClose,
}) => {
	const isClosed = reportStatus === 'closed';

	return (
		<div className='bg-main rounded-xl overflow-hidden border-cta border-2 flex flex-col relative'>
			{onClose && !isClosed && (
				<button
					onClick={onClose}
					className='p-4 absolute top-2 right-2 bg-negative text-white rounded-full text-sm pointer cursor-pointer z-10'
				>
					Zamknij zgłoszenie
				</button>
			)}

			{/* IMAGE */}
			<div className='w-full h-52 sm:h-48 lg:aspect-[4/3] overflow-hidden'>
				<img src={image} alt={petName} className='w-full h-full object-cover' />
			</div>

			{/* CONTENT */}
			<div className='p-4 border-b border-accent space-y-3'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2'>
					<h2 className='font-bold text-xl sm:text-2xl'>{petName}</h2>
					<p className={`px-3 py-1 rounded-xl w-fit ${reportType === 'Zaginiony' ? 'bg-negative' : 'bg-positive'}`}>
						{reportType}
					</p>
					<p className='px-3 py-1 rounded-xl w-fit bg-cta'>
						{reportStatus}
					</p>
				</div>


				<p className='text-sm sm:text-base'>Zgłoszono: {reportDate}</p>
			</div>

			{/* BUTTONS */}
			<div className='flex flex-col sm:flex-row items-center justify-around p-4 gap-3'>
				<button onClick={onView} className='text-cta cursor-pointer p-2'>
					Zobacz szczegóły
				</button>
				{!isClosed && onEdit && (
					<button onClick={onEdit} className='text-cta cursor-pointer p-2'>
						Edytuj
					</button>
				)}
			</div>
		</div>
	);
};

export default PetReportCard;
