import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormInput from './FormInput';
import { useForm } from 'react-hook-form';
import { useUser } from '../../context/UserContext';
import {  Autocomplete } from '@react-google-maps/api';
import { useRef } from 'react';

const userIconPath =
	'M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z';
const phoneIconPath =
	'M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z';
const pinIconPath =
	'M320 64C214 64 128 148.4 128 252.6C128 371.9 248.2 514.9 298.4 569.4C310.2 582.2 329.8 582.2 341.6 569.4C391.8 514.9 512 371.9 512 252.6C512 148.4 426 64 320 64z';
const SettingsPanel = ({ type, onClose }) => {
	const navigate = useNavigate();
	const { user, fetchUser } = useUser();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm({ shouldUnregister: true, mode: 'onChange' });
	const password = watch('newPassword') || '';
	const passwordChecks = {
		minLength: password.length >= 8,
		hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
		hasSpecialDigit: /[\d]/.test(password) && /[\W_]/.test(password),
	};
	const autocompleteRef = useRef(null);

	const onChosenPlace = () => {
		if (autocompleteRef.current) {
			const place = autocompleteRef.current.getPlace();
			if (place.geometry) {
				const lat = place.geometry.location.lat();
				const lng = place.geometry.location.lng();
				const cityName = place.name;
				let country = null;
				if (place.address_components) {
					const countryComponent = place.address_components.find((component) =>
						component.types.includes('country')
					);
					if (countryComponent) {
						country = countryComponent.long_name;
					}
				}
				setValue('city', cityName, { shouldValidate: true });
				setValue('latitude', lat);
				setValue('longitude', lng);
				setValue('country', country);
				console.log(
					`Wybrano miejsce: ${cityName} (${lat}, ${lng}, ${country})`
				);
			}
		} else {
			console.log('Brak geometrii dla wybranego miejsca.');
		}
	};
	const submitCall = async (data) => {
		if (type === 'editProfile') {
			try {
				const token = localStorage.getItem('token');
				if (!token) {
					navigate('/');
					return;
				}
				await axios.put(
					import.meta.env.VITE_BACKEND_URL + '/settings/update-user-info',
					{
						email: user.email,
						name: data.userName,
						surname: data.userSurname,
						phoneNumber: data.userPhoneNumber,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				await fetchUser();
				reset();
				onClose();
				toast.success('Dane zostały zaktualizowane.');
			} catch (error) {
				console.error(
					'Update failed:',
					error.response?.data?.message || 'An error occurred.'
				);
				toast.error('Aktualizacja danych nie powiodła się. Spróbuj ponownie.');
			}
		} else if (type === 'editPassword') {
			console.log(data);
			try {
				const token = localStorage.getItem('token');
				if (!token) {
					navigate('/');
					return;
				}
				await axios.put(
					import.meta.env.VITE_BACKEND_URL + '/settings/update-password',
					{
						email: user.email,
						currentPassword: data.currentPassword,
						newPassword: data.newPassword,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				reset();
				onClose();
				toast.success('Hasło zostało zaktualizowane pomyślnie.');
			} catch (error) {
				console.error(
					'Password update failed:',
					error.response?.data?.message || 'An error occurred.'
				);
				toast.error('Aktualizacja hasła nie powiodła się. Spróbuj ponownie.');
			}
		} else if (type === 'editLocation') {
			console.log(data);
			try {
				const token = localStorage.getItem('token');
				if (!token) {
					navigate('/');
					return;
				}
				await axios.put(
					import.meta.env.VITE_BACKEND_URL + '/settings/update-location',
					{
						email: user.email,
						city: data.city,
						latitude: data.latitude,
						longitude: data.longitude,
						country: data.country,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				await fetchUser();
				reset();
				onClose();
				toast.success('Lokalizacja została zaktualizowana.');
			} catch (error) {
				console.error(
					'Location update failed:',
					error.response?.data?.message || 'An error occurred.'
				);
				toast.error(
					'Aktualizacja lokalizacji nie powiodła się. Spróbuj ponownie.'
				);
			}
		}
	};
	return (
		<form
			onSubmit={handleSubmit(submitCall)}
			className='bg-main p-3 rounded-xl space-y-3'
		>
			<p className='text-lg'>Edytuj dane</p>
			{type === 'editProfile' && (
				<div className='space-y-3'>
					<FormInput
						placeholder={user.first_name || 'Imię'}
						icon={userIconPath}
						{...register('userName')}
					/>
					<FormInput
						placeholder={user.surname || 'Nazwisko'}
						icon={userIconPath}
						{...register('userSurname')}
					/>
					<FormInput
						placeholder={user.phone || 'Numer telefonu'}
						icon={phoneIconPath}
						error={errors.userPhoneNumber}
						{...register('userPhoneNumber', {
							pattern: {
								value: /^[0-9]{9}$/i,
								message: 'Nieprawidłowy numer telefonu (9 cyfr)',
							},
						})}
					/>
					{errors.userPhoneNumber && (
						<p className='text-negative text-sm -mt-2 ml-3'>
							{errors.userPhoneNumber.message}
						</p>
					)}
				</div>
			)}
			{type === 'editPassword' && (
				<div className='space-y-3'>
					<FormInput
						type='password'
						placeholder='Aktualne hasło'
						icon={userIconPath}
						{...register('currentPassword', {
							required: 'Aktualne hasło jest wymagane',
						})}
					/>
					{errors.currentPassword && (
						<p className='text-red-500 text-sm'>
							{errors.currentPassword.message}
						</p>
					)}
					<FormInput
						type='password'
						placeholder='Nowe Hasło'
						icon={userIconPath}
						{...register('newPassword', {
							required: 'To pole jest wymagane',
							validate: (value) => {
								if (value.length < 8) return 'Hasło musi mieć minimum 8 znaków';
								if (!/[a-z]/.test(value) || !/[A-Z]/.test(value))
									return 'Hasło musi zawierać małą i dużą literę';
								if (!/\d/.test(value) || !/[\W_]/.test(value))
									return 'Hasło musi zawierać cyfrę i znak specjalny';
								return true;
							},
						})}
					/>
					<FormInput
						type='password'
						placeholder='Powtórz nowe hasło'
						icon={userIconPath}
						{...register('repeatPassword', {
							required: 'Proszę podać nowe hasło',
							validate: (value) =>
								value === watch('newPassword') || 'Hasła muszą być takie same',
						})}
					/>
					{errors.repeatPassword && (
						<p className='text-red-500 text-sm'>
							{errors.repeatPassword.message}
						</p>
					)}
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
					</div>
				</div>
			)}
			{type === 'editLocation' && (
				<div className='space-y-3'>
					<Autocomplete
						options={{
							types: ['(cities)'],
							componentRestrictions: { country: 'pl' },
						}}
						onLoad={(autocomplete) => {
							autocompleteRef.current = autocomplete;
						}}
						onPlaceChanged={onChosenPlace}
					>
						<FormInput
							placeholder='Wpisz miasto...'
							icon={pinIconPath}
							{...register('city')}
						/>
					</Autocomplete>

					<input type='hidden' {...register('latitude')} />
					<input type='hidden' {...register('longitude')} />
					<input type='hidden' {...register('country')} />
				</div>
			)}
			<div className='flex justify-end gap-3'>
				<button
					className='text-secondary cursor-pointer'
					onClick={() => onClose()}
				>
					Anuluj
				</button>
				<button
					className='bg-cta
									py-2 px-6 rounded-xl cursor-pointer'
				>
					Zapisz
				</button>
			</div>
		</form>
	);
};
export default SettingsPanel;
