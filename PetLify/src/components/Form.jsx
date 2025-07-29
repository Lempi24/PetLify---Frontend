import FormInput from './FormInput';
import { useState } from 'react';

const Form = () => {
	const [isLoging, setIsLoging] = useState(true);
	const changeForm = () => {
		setIsLoging((prevState) => !prevState);
	};
	const emailIcon =
		'M112 128C85.5 128 64 149.5 64 176C64 191.1 71.1 205.3 83.2 214.4L291.2 370.4C308.3 383.2 331.7 383.2 348.8 370.4L556.8 214.4C568.9 205.3 576 191.1 576 176C576 149.5 554.5 128 528 128L112 128zM64 260L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 260L377.6 408.8C343.5 434.4 296.5 434.4 262.4 408.8L64 260z';

	const lockIcon =
		'M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z';

	return (
		<form
			action=''
			className='w-full flex flex-col items-center justify-center'
		>
			<div className='flex flex-col gap-4 mt-10 w-8/10 items-center justify-center'>
				<FormInput type='text' placeholder='Email' icon={emailIcon} />

				<FormInput type='password' placeholder='Hasło' icon={lockIcon} />

				{!isLoging && (
					<FormInput
						type='password'
						placeholder='Powtórz hasło'
						icon={lockIcon}
					/>
				)}

				<div className='flex flex-col w-full text-negative'>
					<p>Conajmniej 8 znaków</p>
					<p>Mała i duża litera</p>
					<p>Znak specjalny i cyfra</p>
				</div>

				<div className='flex flex-col items-center justify-center gap-3 w-full'>
					<button className='bg-accent px-10 py-3 tex-text rounded-md w-full'>
						{isLoging ? 'Zaloguj się' : 'Zarejestruj się'}
					</button>
					<p className='text-gray'>
						{isLoging ? 'Nie masz konta?' : 'Masz już konto?'}
						<span className='text-cta' onClick={changeForm}>
							{isLoging ? ' Zarejestruj się' : ' Zaloguj się'}
						</span>
					</p>
				</div>
			</div>
		</form>
	);
};

export default Form;
