const PetCard = ({ pet }) => {
	return (
		<button className='bg-main flex items-center rounded-xl w-full py-1 px-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] cursor-pointer'>
			<div className='w-[60px] h-[60px] rounded-full overflow-hidden'>
				<img
					src={pet.imageUrl}
					alt={pet.name}
					className='w-full h-full object-cover rounded-full'
				/>
			</div>
			<div className='text-left ml-4'>
				<h2 className='font-bold text-2xl'>{pet.name}</h2>
				<p className='flex items-center gap-1'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 640 640'
						className='fill-text w-[20px]'
					>
						<path d='M64 176C80.6 176 94.2 188.6 95.8 204.7L96.1 211.3C97.8 227.4 111.4 240 128 240L307.1 240L448 300.4L448 544C448 561.7 433.7 576 416 576L384 576C366.3 576 352 561.7 352 544L352 412.7C328 425 300.8 432 272 432C243.2 432 216 425 192 412.7L192 544C192 561.7 177.7 576 160 576L128 576C110.3 576 96 561.7 96 544L96 298.4C58.7 285.2 32 249.8 32 208C32 190.3 46.3 176 64 176zM387.8 32C395.5 32 402.7 35.6 407.4 41.8L424 64L476.1 64C488.8 64 501 69.1 510 78.1L528 96L584 96C597.3 96 608 106.7 608 120L608 144C608 188.2 572.2 224 528 224L464 224L457 252L332.3 198.6L363.9 51.4C366.3 40.1 376.2 32 387.8 32zM480 108C469 108 460 117 460 128C460 139 469 148 480 148C491 148 500 139 500 128C500 117 491 108 480 108z' />
					</svg>
					{pet.species}, {pet.breed}
				</p>
				<p className='flex items-center gap-1'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 640 640'
						className='fill-text w-[20px]'
					>
						<path d='M352 348.4C416.1 333.9 464 276.5 464 208C464 128.5 399.5 64 320 64C240.5 64 176 128.5 176 208C176 276.5 223.9 333.9 288 348.4L288 544C288 561.7 302.3 576 320 576C337.7 576 352 561.7 352 544L352 348.4zM328 160C297.1 160 272 185.1 272 216C272 229.3 261.3 240 248 240C234.7 240 224 229.3 224 216C224 158.6 270.6 112 328 112C341.3 112 352 122.7 352 136C352 149.3 341.3 160 328 160z' />
					</svg>
					{pet.location}
				</p>
			</div>
		</button>
	);
};
export default PetCard;
