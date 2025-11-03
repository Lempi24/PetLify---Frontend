import dogo from '../../../img/dogo.png';
import AuthForm from './AuthForm';
const Form = () => {
	return (
		<div className='relative w-full h-full flex flex-col items-center justify-center lg:flex-row'>
			<AuthForm />
			<div className='lg:relative hidden lg:block lg:w-1/2'>
				<div className='lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:h-full lg:z-10 lg:flex lg:items-center lg:justify-center'>
					<div className='absolute inset-0 bg-main opacity-75'></div>

					<div className='relative text-center flex flex-col items-center gap-4'>
						<h2 className='font-bold text-5xl'>Znajdź swojego przyjaciela!</h2>
						<p>PetLify: Nadzieja dla zagubionych, pomoc dla szukających</p>
					</div>
				</div>
				<img
					src={dogo}
					alt='pieseczek'
					className='lg:max-w-full lg:h-auto lg:scale-x-[-1]'
				/>
			</div>
		</div>
	);
};
export default Form;
