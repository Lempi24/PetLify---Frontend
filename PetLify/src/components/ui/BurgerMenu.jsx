const BurgerMenu = ({ isBurgerOpen, handleBurger }) => {
	return (
		<div
			onClick={handleBurger}
			className='relative flex flex-col items-center justify-center w-[50px] h-[50px] z-100 lg:hidden'
		>
			<div
				className={`absolute ${
					isBurgerOpen ? 'rotate-45' : '-translate-y-3'
				} h-[3px] w-full bg-white transition-transform duration-300`}
			></div>
			<div
				className={`absolute ${
					isBurgerOpen ? '-rotate-45' : ''
				} h-[3px] w-full bg-white transition-transform duration-300`}
			></div>
		</div>
	);
};
export default BurgerMenu;
