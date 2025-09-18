import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import SubPagesNav from '../components/ui/SubPagesNav';
import dogo from '../img/burek.jpg';
import SettingsButtonContainer from '../components/ui/SettingsButtonContainer';
import BurgerMenu from '../components/ui/BurgerMenu';
import FormInput from '../components/ui/FormInput';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';

const SettingsPage = () => {
	const { user, setUser, fetchUser } = useUser();
	console.log('Aktualny stan obiektu user:', user);
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({ shouldUnregister: true, mode: 'onChange' });
	const navigate = useNavigate();
	const userIconPath =
		'M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z';
	const phoneIconPath =
		'M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z';
	const location = useLocation();
	const currentPath = location.pathname;
	const [isBurgerOpen, setIsBurgerOpen] = useState(false);
	const [isEditProfileMode, setIsEditProfileMode] = useState(false);
	const [settings, setSettings] = useState({
		chatNotifications: false,
		disappearanceNotifications: false,
	});
	const radioStateHandle = (settingKey) => {
		setSettings((prevSettings) => ({
			...prevSettings,
			[settingKey]: !prevSettings[settingKey],
		}));
	};
	const submitCall = async (data) => {
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
			setIsEditProfileMode(false);
			toast.success('Dane zostały zaktualizowane.');
		} catch (error) {
			console.error(
				'Update failed:',
				error.response?.data?.message || 'An error occurred.'
			);
			toast.error('Aktualizacja danych nie powiodła się. Spróbuj ponownie.');
		}
	};
	return (
		<div className='relative flex'>
			<SubPagesNav currentPath={currentPath} isBurgerOpen={isBurgerOpen} />
			<div className='flex flex-col gap-10 px-5 w-full h-screen bg-secondary py-5'>
				<div className='flex items-center'>
					<h2 className='text-2xl border-b-2 w-full py-5'>Ustawienia</h2>
					<BurgerMenu
						isBurgerOpen={isBurgerOpen}
						handleBurger={() => setIsBurgerOpen((prev) => !prev)}
					/>
				</div>
				<div className='space-y-3'>
					<p className='text-cta'>Profil zwierzaka</p>
					<button className='bg-main flex items-center rounded-xl w-full py-1 px-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] cursor-pointer'>
						<div className='w-[70px] h-[60px] rounded-full overflow-hidden'>
							<img
								src={dogo}
								alt='imię'
								className='w-full h-full object-cover rounded-full'
							/>
						</div>
						<div className='text-left ml-4 w-full min-w-0'>
							<h2 className='font-bold text-2xl'>Burek</h2>
							<p className=''>Gatunek: Pies</p>
							<p className=''>Rasa: Mieszaniec</p>
							<p className='truncate'>
								Cechy: Brązowa sierść, biała łata na sierści
							</p>
						</div>
					</button>
				</div>
				<div>
					<p className='text-cta'>Konto</p>
					<div className='mt-3 space-y-1'>
						{isEditProfileMode && (
							<form
								onSubmit={handleSubmit(submitCall)}
								className='bg-main p-3 rounded-xl space-y-3'
							>
								<p className='text-lg'>Edytuj dane osobowe</p>
								<div className='space-y-3'>
									<FormInput
										placeholder={'Imię'}
										icon={userIconPath}
										{...register('userName')}
									/>
									<FormInput
										placeholder={'Nazwisko'}
										icon={userIconPath}
										{...register('userSurname')}
									/>
									<FormInput
										placeholder={'Numer telefonu'}
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
								<div className='flex justify-end gap-3'>
									<button
										className='text-secondary cursor-pointer'
										onClick={() => setIsEditProfileMode((prev) => !prev)}
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
						)}

						<SettingsButtonContainer
							pMessage={user?.first_name + ' ' + user?.surname || 'Brak danych'}
							subMessage={user?.phone || 'Brak numeru telefonu'}
							btnMessage={'Zmień'}
							btnType={'button'}
							negative={false}
							onAction={() => setIsEditProfileMode((prev) => !prev)}
						/>
						<SettingsButtonContainer
							pMessage={'Zmień hasło'}
							btnMessage={'Zmień'}
							btnType={'button'}
							negative={false}
							onAction={() => setIsEditPasswordMode((prev) => !prev)}
						/>
						<SettingsButtonContainer
							pMessage={'Usuń konto'}
							btnMessage={'Usuń'}
							btnType={'button'}
							negative={true}
						/>
					</div>
				</div>
				<div>
					<p className='text-cta'>Powiadomienia</p>
					<div className='mt-3 space-y-1'>
						<SettingsButtonContainer
							pMessage={'Powiadomienia o nowych czatach'}
							btnMessage={'Zmień'}
							btnType={'radio'}
							radioStateHandle={() => radioStateHandle('chatNotifications')}
							isChecked={settings.chatNotifications}
							negative={false}
						/>
					</div>
					<div className='mt-3 space-y-1'>
						<SettingsButtonContainer
							pMessage={'Powiadomienia o zaginięciach w okolicy'}
							btnMessage={'Zmień'}
							btnType={'radio'}
							radioStateHandle={() =>
								radioStateHandle('disappearanceNotifications')
							}
							isChecked={settings.disappearanceNotifications}
							negative={false}
						/>
					</div>
				</div>
				<div>
					<p className='text-cta'>Aplikacja</p>
					<div className='mt-3 space-y-1'>
						<SettingsButtonContainer
							pMessage={'Domyślna lokalizacja'}
							btnMessage={'Ustaw'}
							btnType={'button'}
							negative={false}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
export default SettingsPage;
