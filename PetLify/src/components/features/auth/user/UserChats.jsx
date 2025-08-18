const UserChats = ({
	userName,
	petName,
	lastMessage,
	lastMessageTime,
	seen,
}) => {
	return (
		<div className='relative w-full'>
			{!seen && (
				<div className='absolute top-0 -left-2 bg-cta h-full rounded-xl text-transparent w-50'></div>
			)}
			<button className='relative bg-main flex items-center rounded-xl w-full lg:w-3/4 py-1 px-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] cursor-pointer z-1'>
				<div className='w-[60px] h-[60px] rounded-full overflow-hidden bg-text shrink-0'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 640 640'
						className='w-full h-full'
					>
						<path d='M320 312C253.7 312 200 258.3 200 192C200 125.7 253.7 72 320 72C386.3 72 440 125.7 440 192C440 258.3 386.3 312 320 312zM289.5 368L350.5 368C360.2 368 368 375.8 368 385.5C368 389.7 366.5 393.7 363.8 396.9L336.4 428.9L367.4 544L368 544L402.6 405.5C404.8 396.8 413.7 391.5 422.1 394.7C484 418.3 528 478.3 528 548.5C528 563.6 515.7 575.9 500.6 575.9L139.4 576C124.3 576 112 563.7 112 548.6C112 478.4 156 418.4 217.9 394.8C226.3 391.6 235.2 396.9 237.4 405.6L272 544.1L272.6 544.1L303.6 429L276.2 397C273.5 393.8 272 389.8 272 385.6C272 375.9 279.8 368.1 289.5 368.1z' />
					</svg>
				</div>
				<div className='text-left ml-4 w-3/4 lg:w-full'>
					<div className='flex items-center justify-between'>
						<h2 className='font-bold text-lg truncate'>{userName}</h2>
						<p className='text-[0.6rem] lg:text-sm'>{lastMessageTime}</p>
					</div>
					<p className='text-cta text-sm'>W sprawie: {petName}</p>
					<p className='truncate text-sm'>{lastMessage}</p>
				</div>
			</button>
		</div>
	);
};
export default UserChats;
