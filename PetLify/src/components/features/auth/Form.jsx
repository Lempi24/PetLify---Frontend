import FormInput from '../../ui/FormInput';
import { useState } from 'react';
import dogo from '../../../img/dogo.png';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../../../context/UserContext';
import { reconnectSocket } from '../../../lib/socket';
const Form = () => {
	const navigate = useNavigate();
	const { fetchUser } = useUser();
	const [isLoging, setIsLoging] = useState(true);
	const [loading, setLoading] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
	} = useForm({ shouldUnregister: true, mode: 'onChange' });
	const password = watch('userPassword') || '';

	const passwordChecks = {
		minLength: password.length >= 8,
		hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
		hasSpecialDigit: /[\d]/.test(password) && /[\W_]/.test(password),
	};

	const submitCall = async (data) => {
		if (isLoging) {
			setLoading(true);
			try {
				const response = await axios.post(
					import.meta.env.VITE_BACKEND_URL + '/auth/login',
					{
						email: data.userMail,
						password: data.userPassword,
					}
				);
				if (response.data.token) {
					localStorage.setItem('token', response.data.token);
					window.dispatchEvent(new Event('tokenChange'));
					reset();
					navigate('/main-page');
				}
			} catch (error) {
				setLoading(false);
				console.error(
					'Login failed:',
					error.response?.data?.message || 'An error occurred.'
				);
				toast.error('Niepoprawny email lub hasło. Spróbuj ponownie.');
			}
		} else {
			try {
				await axios.post(import.meta.env.VITE_BACKEND_URL + '/auth/register', {
					email: data.userMail,
					password: data.userPassword,
				});
				reset();
				setIsLoging(true);
				toast.success('Rejestracja udana! Teraz możesz się zalogować.');
			} catch (error) {
				if (error.response && error.response.status === 409) {
					toast.error('Użytkownik o podanym emailu już istnieje.');
				} else {
					toast.error('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
				}
			}
		}
	};
	const changeForm = () => {
		setIsLoging((prevState) => !prevState);
	};
	const emailIcon =
		'M112 128C85.5 128 64 149.5 64 176C64 191.1 71.1 205.3 83.2 214.4L291.2 370.4C308.3 383.2 331.7 383.2 348.8 370.4L556.8 214.4C568.9 205.3 576 191.1 576 176C576 149.5 554.5 128 528 128L112 128zM64 260L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 260L377.6 408.8C343.5 434.4 296.5 434.4 262.4 408.8L64 260z';

	const lockIcon =
		'M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z';

	return (
		<div className='relative w-full h-full flex flex-col items-center justify-center lg:flex-row'>
			{loading && (
				<div className='absolute w-full h-full flex items-center justify-center bg-main-transparent z-100'>
					<div className='w-10 h-10 border-4 border-accent border-t-cta rounded-full animate-spin'></div>
				</div>
			)}
			<form
				onSubmit={handleSubmit(submitCall)}
				action=''
				className='w-full flex flex-col items-center justify-center lg:w-1/3 lg:bg-secondary lg:h-[600px]'
			>
				<div className='flex flex-col gap-4 mt-10 w-8/10 items-center justify-center'>
					<FormInput
						type='text'
						placeholder='Email'
						icon={emailIcon}
						error={errors.userMail}
						{...register('userMail', {
							required: 'Adres e-mail jest wymagany',
							pattern: {
								value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
								message: 'Wprowadź poprawny format adresu e-mail',
							},
						})}
					/>
					{errors.userMail && (
						<p className=' text-negative text-left w-full'>
							{errors.userMail.message}
						</p>
					)}

					<FormInput
						type='password'
						placeholder='Hasło'
						icon={lockIcon}
						error={errors.userPassword}
						{...register('userPassword', {
							required: 'Hasło jest wymagane',
						})}
					/>
					{errors.userPassword && (
						<p className=' text-negative text-left w-full'>
							{errors.userPassword.message}
						</p>
					)}
					{!isLoging && (
						<FormInput
							type='password'
							placeholder='Powtórz hasło'
							icon={lockIcon}
							{...register('confirmPassword', {
								validate: (value) =>
									value === watch('userPassword') ||
									'Hasła muszą być takie same',
							})}
						/>
					)}
					{errors.confirmPassword && (
						<p className='text-negative text-left w-full'>
							{errors.confirmPassword.message}
						</p>
					)}
					{!isLoging && (
						<div className='flex flex-col w-full text-negative'>
							<p
								className={
									passwordChecks.minLength ? 'text-positive' : 'text-negative'
								}
							>
								Conajmniej 8 znaków
							</p>
							<p
								className={
									passwordChecks.hasUpperLower
										? 'text-positive'
										: 'text-negative'
								}
							>
								Mała i duża litera
							</p>
							<p
								className={
									passwordChecks.hasSpecialDigit
										? 'text-positive'
										: 'text-negative'
								}
							>
								Znak specjalny i cyfra
							</p>
						</div>
					)}

					<div className='flex flex-col items-center justify-center gap-3 w-full'>
						<button className='bg-cta px-10 py-3 tex-text rounded-md w-full cursor-pointer'>
							{isLoging ? 'Zaloguj się' : 'Zarejestruj się'}
						</button>
						<p className='text-gray'>
							{isLoging ? 'Nie masz konta?' : 'Masz już konto?'}
							<span className='text-cta cursor-pointer' onClick={changeForm}>
								{isLoging ? ' Zarejestruj się' : ' Zaloguj się'}
							</span>
						</p>
					</div>
				</div>
			</form>
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