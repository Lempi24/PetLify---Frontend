import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SubPagesNav from '../components/ui/SubPagesNav';
import dogo from '../img/burek.jpg';
import SettingsButtonContainer from '../components/ui/SettingsButtonContainer';
import BurgerMenu from '../components/ui/BurgerMenu';
import { useUser } from '../context/UserContext';
import SettingsPanel from '../components/ui/SettingsPanel';
import { toast } from 'react-toastify';
import axios from 'axios';
const SettingsPage = () => {
	const { user } = useUser();
	console.log('Aktualny stan obiektu user:', user);
	const navigate = useNavigate();
	const location = useLocation();
	const currentPath = location.pathname;
	const [isBurgerOpen, setIsBurgerOpen] = useState(false);
	const [activePanel, setActivePanel] = useState(null);
	const [settings, setSettings] = useState({
		chatNotifications: false,
		disappearanceNotifications: false,
	});
	const [initialSettings, setInitialSettings] = useState(null);
	const isChanged =
		initialSettings &&
		settings &&
		JSON.stringify(settings) !== JSON.stringify(initialSettings);
	const changeNotifications = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				navigate('/');
				return;
			}
			const payload = {
				notify_new_chats: settings.chatNotifications,
				notify_missing: settings.disappearanceNotifications,
				email: user.email,
			};

			await axios.put(
				import.meta.env.VITE_BACKEND_URL + '/settings/notifications',
				payload,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			setInitialSettings({ ...settings });
			toast.success('Ustawienia powiadomień zostały zaktualizowane.');
		} catch (error) {
			console.error(
				'Błąd aktualizacji ustawień:',
				error.response?.data?.message || error.message
			);
			toast.error('Nie udało się zapisać ustawień. Spróbuj ponownie.');
		}
	};
	const fetchUserSettings = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				navigate('/');
				return;
			}
			const response = await axios.get(
				import.meta.env.VITE_BACKEND_URL + '/settings/fetch-user-settings',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const data = response.data;
			setSettings({
				chatNotifications: data.notify_new_chats,
				disappearanceNotifications: data.notify_missing,
			});
			setInitialSettings({
				chatNotifications: data.notify_new_chats,
				disappearanceNotifications: data.notify_missing,
			});
		} catch (error) {
			console.error(
				'Błąd pobierania ustawień użytkownika:',
				error.response?.data?.message || error.message
			);
			toast.error('Nie udało się pobrać ustawień. Spróbuj ponownie.');
		}
	};
	useEffect(() => {
		fetchUserSettings();
	}, []);
	const deleteUser = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				navigate('/');
				return;
			}
			await axios.delete(
				import.meta.env.VITE_BACKEND_URL + '/settings/delete-user',
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
					data: { email: user.email },
				}
			);
			localStorage.removeItem('token');
			toast.success('Konto zostało usunięte.');
			navigate('/');
		} catch (error) {
			console.error(
				'Account deletion failed:',
				error.response?.data?.message || 'An error occurred.'
			);
			toast.error('Usunięcie konta nie powiodło się. Spróbuj ponownie.');
		}
	};
	const radioStateHandle = (settingKey) => {
		setSettings((prevSettings) => ({
			...prevSettings,
			[settingKey]: !prevSettings[settingKey],
		}));
	};
	useEffect(() => {
		if (initialSettings === null) {
			setInitialSettings(settings);
		}
	}, [initialSettings, settings]);
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
						{activePanel === 'editProfile' && (
							<SettingsPanel
								type={'editProfile'}
								onClose={() => setActivePanel(null)}
							/>
						)}
						{activePanel === 'editPassword' && (
							<SettingsPanel
								type={'editPassword'}
								onClose={() => setActivePanel(null)}
							/>
						)}

						{!activePanel && (
							<>
								<SettingsButtonContainer
									pMessage={
										user?.first_name + ' ' + user?.surname || 'Brak danych'
									}
									subMessage={user?.phone || 'Brak numeru telefonu'}
									btnMessage={'Zmień'}
									btnType={'button'}
									negative={false}
									onAction={() => setActivePanel('editProfile')}
								/>

								<SettingsButtonContainer
									pMessage={'Zmień hasło'}
									btnMessage={'Zmień'}
									btnType={'button'}
									negative={false}
									onAction={() => setActivePanel('editPassword')}
								/>
								<SettingsButtonContainer
									pMessage={'Usuń konto'}
									btnMessage={'Usuń'}
									btnType={'button'}
									negative={true}
									onAction={() => setActivePanel('deleteAccount')}
								/>
							</>
						)}
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
					{isChanged && (
						<button
							onClick={() => changeNotifications()}
							className='bg-cta py-2 px-6 rounded-xl cursor-pointer mt-3 ml-auto block'
						>
							Zapisz
						</button>
					)}
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
			{activePanel === 'deleteAccount' && (
				<div
					className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center backdrop-blur-2xl w-full h-full z-1000`}
				>
					<div className='bg-secondary p-6 rounded-lg shadow-lg flex flex-col items-center gap-4'>
						<p className='text-lg font-bold text-negative'>
							Czy na pewno chcesz usunąć konto?
						</p>
						<p className='text-sm text-center text-accent'>
							Ta operacja jest nieodwracalna. Twoje dane i konto zostaną trwale
							usunięte.
						</p>
						<div className='flex gap-4'>
							<button
								onClick={() => deleteUser()}
								className='bg-negative px-6 py-2 rounded-lg cursor-pointer'
							>
								Tak, usuń na zawsze
							</button>
							<button
								onClick={() => setActivePanel(null)}
								className='px-6 py-2 rounded-lg text-accent cursor-pointer'
							>
								Anuluj
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
export default SettingsPage;
