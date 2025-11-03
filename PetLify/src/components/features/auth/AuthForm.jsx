import { useState, useRef } from 'react';
import { reconnectSocket } from '../../../lib/socket';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import { toast } from 'react-toastify';
import FormInput from '../../ui/FormInput';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import Logo from '../../ui/Logo';
const AuthForm = ({ popupMode, onAction }) => {
	const navigate = useNavigate();
	const { fetchUser } = useUser();
	const [isLoging, setIsLoging] = useState(true);
	const [loading, setLoading] = useState(false);
	const recaptchaRef = useRef(null);
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
				if (response.data.token && popupMode) {
					localStorage.setItem('token', response.data.token);
					window.dispatchEvent(new Event('tokenChange'));
					reset();
					onAction();
				} else {
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

				const message = error.response?.data?.message;

				if (message === 'Account not verified. Please check your email.') {
					toast.warning(
						'Konto nie jest jeszcze zweryfikowane. Sprawdź swoją skrzynkę e-mail.'
					);
				} else if (message === 'Invalid credentials') {
					toast.error('Niepoprawny email lub hasło. Spróbuj ponownie.');
				} else {
					toast.error(
						'Wystąpił błąd podczas logowania. Spróbuj ponownie później.'
					);
				}
			}
		} else {
			const recaptchaValue = recaptchaRef.current?.getValue();

			if (!recaptchaValue) {
				toast.error('Proszę potwierdzić, że nie jesteś robotem');
				return;
			}
			try {
				await axios.post(import.meta.env.VITE_BACKEND_URL + '/auth/register', {
					email: data.userMail,
					password: data.userPassword,
					recaptchaToken: recaptchaValue,
				});
				recaptchaRef.current?.reset();
				reset();
				setIsLoging(true);
				toast.success(
					'Rejestracja udana! Sprawdź swoją skrzynkę e-mail i potwierdź konto.'
				);
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
		<form
			onSubmit={handleSubmit(submitCall)}
			action=''
			className={`w-full flex flex-col items-center justify-center lg:w-1/3 lg:bg-secondary lg:h-[600px] ${
				popupMode
					? 'bg-secondary fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full'
					: ''
			}`}
		>
			{popupMode && (
				<button
					onClick={onAction}
					className='absolute top-0 right-0 p-5 cursor-pointer'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 640 640'
						className='fill-cta w-[30px]'
					>
						<path d='M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z' />
					</svg>
				</button>
			)}
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
								value === watch('userPassword') || 'Hasła muszą być takie same',
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
								passwordChecks.hasUpperLower ? 'text-positive' : 'text-negative'
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
						<div className='my-4'>
							<ReCAPTCHA
								sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
								ref={recaptchaRef}
							/>
						</div>
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
					<p className='text-gray'>
						Zaloguj się jako{' '}
						<Link to={'/main-page'} className='text-cta cursor-pointer'>
							gość
						</Link>
					</p>
				</div>
			</div>
			{loading && (
				<div className='absolute w-full h-full flex items-center justify-center bg-main-transparent z-100'>
					<div className='w-10 h-10 border-4 border-accent border-t-cta rounded-full animate-spin'></div>
				</div>
			)}
		</form>
	);
};
export default AuthForm;
