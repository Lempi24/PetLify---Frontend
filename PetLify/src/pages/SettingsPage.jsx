import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import SubPagesNav from '../components/SubPagesNav';
import dogo from '../img/burek.jpg';
import SettingsButtonContainer from '../components/SettingsButtonContainer';
const SettingsPage = () => {
	const location = useLocation();
	const currentPath = location.pathname;
	const [isBurgerOpen, setIsBurgerOpen] = useState(false);
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
					<div
						onClick={() => setIsBurgerOpen((prev) => !prev)}
						className='relative flex flex-col items-center justify-center w-[50px] h-[50px] z-1000 lg:hidden'
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
						<SettingsButtonContainer
							pMessage={'Zmień hasło'}
							btnMessage={'Zmień'}
							btnType={'button'}
							negative={false}
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
