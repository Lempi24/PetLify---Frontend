const SettingsButtonContainer = ({
	pMessage,
	btnMessage,
	subMessage,
	negative,
	btnType,
	radioStateHandle,
	isChecked,
	onAction,
}) => {
	return (
		<div className='bg-main flex items-center justify-between p-3 rounded-xl'>
			<div className='w-full'>
				<p className={`${negative ? 'text-negative' : ''} max-w-8/10`}>
					{pMessage}
				</p>
				<p className='text-sm text-accent'>{subMessage}</p>
			</div>
			{btnType === 'button' ? (
				<button
					type='button'
					onClick={onAction}
					className={`${
						negative ? 'bg-negative' : 'bg-cta'
					} py-2 px-6 rounded-xl cursor-pointer`}
				>
					{btnMessage}
				</button>
			) : (
				<button
					type='button'
					onClick={radioStateHandle}
					className={`relative w-[60px] h-[30px] ${
						isChecked ? 'bg-cta' : 'bg-main'
					} rounded-2xl transition-colors duration-300 cursor-pointer`}
				>
					<div
						className={`absolute ${
							isChecked ? 'translate-x-full' : ''
						} top-0 left-0 h-full w-1/2 bg-white rounded-full transition-transform duration-300 ease-in-out`}
					></div>
				</button>
			)}
		</div>
	);
};
export default SettingsButtonContainer;
