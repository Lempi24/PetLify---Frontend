import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import SubPagesNav from '../components/ui/SubPagesNav';
import dogo from '../img/burek.jpg';
import SettingsButtonContainer from '../components/ui/SettingsButtonContainer';
import BurgerMenu from '../components/ui/BurgerMenu';
import { useUser } from '../context/UserContext';
import SettingsPanel from '../components/ui/SettingsPanel';
import { set } from 'react-hook-form';
const SettingsPage = () => {
	const { user, fetchUser } = useUser();
	console.log('Aktualny stan obiektu user:', user);

	const location = useLocation();
	const currentPath = location.pathname;
	const [isBurgerOpen, setIsBurgerOpen] = useState(false);
	const [activePanel, setActivePanel] = useState(null);
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
