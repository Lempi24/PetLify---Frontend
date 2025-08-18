import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SubPagesNav from '../components/ui/SubPagesNav';
import BurgerMenu from '../components/ui/BurgerMenu';
import UserChats from '../components/features/auth/user/UserChats';
const ChatsPage = () => {
	const location = useLocation();
	const currentPath = location.pathname;
	const [isBurgerOpen, setIsBurgerOpen] = useState(false);
	return (
		<div className='relative flex'>
			<SubPagesNav currentPath={currentPath} isBurgerOpen={isBurgerOpen} />
			<div className='flex flex-col gap-10 px-5 w-full h-screen bg-secondary py-5'>
				<div className='flex items-center'>
					<h2 className='text-2xl border-b-2 w-full py-5'>Moje czaty</h2>
					<BurgerMenu
						isBurgerOpen={isBurgerOpen}
						handleBurger={() => setIsBurgerOpen((prev) => !prev)}
					/>
				</div>
				<div className='flex flex-col items-center gap-4 lg:overflow-y-scroll custom-scroll pl-2'>
					<UserChats
						userName={'Anna Nowak'}
						petName={'Burek'}
						lastMessage={
							'Wydaje mi się, że widziałam podobnego psa rano w Parku'
						}
						lastMessageTime={'5 min. temu'}
						seen={false}
					/>
					<UserChats
						userName={'Piotr Wiśniewski'}
						petName={'Kicia'}
						lastMessage={
							'Dzień dobry! Bardzo się cieszę, że znalazł Pan kici. Spotkajmy'
						}
						lastMessageTime={'2 godz. temu'}
						seen={false}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
					<UserChats
						userName={'Ewa Zielińska'}
						petName={'Grubcio'}
						lastMessage={'Dziękuję za informację!'}
						lastMessageTime={'Wczoraj'}
						seen={true}
					/>
				</div>
			</div>
		</div>
	);
};
export default ChatsPage;
