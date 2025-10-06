const PetReportCard = ({ image, petName, petStatus, reportDate }) => {
	return (
		<div className='bg-main rounded-xl overflow-hidden border-cta border-2 max-h-[450px]'>
			<img src={image} alt='Kicik' className='w-full h-64 object-cover' />
			<div className='p-4 border-b-1 border-accent space-y-3'>
				<div className='flex items-center gap-4'>
					<h2 className='font-bold text-2xl'>{petName}</h2>
					<p
						className={`${
							petStatus === 'zaginiony'
								? 'bg-negative'
								: petStatus === 'znaleziony'
								? 'bg-positive'
								: 'bg-cta'
						} p-2 rounded-xl`}
					>
						{petStatus}
					</p>
				</div>
				<p>Zgłoszono: {reportDate}</p>
			</div>
			<div className='flex items-center justify-around p-4 gap-4'>
				<button className='text-cta cursor-pointer p-2'>
					Zobacz szczegóły
				</button>
				<button className='text-cta cursor-pointer p-2'>Edytuj</button>
			</div>
		</div>
	);
};
export default PetReportCard;
