import { useEffect, useState } from 'react';
import ImageCarousel from './ImageCarousel';
import useAuth from '../../hooks/useAuth';
import ChatModal from '../chat/ChatModal';
import { GoogleMap,  OverlayView } from '@react-google-maps/api';
// NOWY czat – backend (Socket.IO + REST)
import {
	ensureThread,
	fetchMessages,
	sendMessageHttp,
} from '../../services/chatApi';
import { getSocket } from '../../lib/socket';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PetInfoSkeleton from '../skeletons/PetInfoSkeleton';
import { toast } from 'react-toastify';
// Proste pole edytowalne używane w trybie "edit"
const EditableField = ({
	value,
	onChange,
	mode,
	type = 'text',
	className = '',
}) =>
	mode === 'edit' ? (
		<input
			type={type}
			value={value ?? ''}
			onChange={(e) => onChange(e.target.value)}
			className='border border-cta rounded px-2 py-1 text-accent'
		/>
	) : (
		<p className={`text-accent ${className}`}>{value}</p>
	);

const PetInfo = ({
	petId,
	setSelectedPetId,
	mode = 'view',
	reportType,
	onAction,
}) => {
	const navigate = useNavigate();

	//  POPRAWKA: useAuth zwraca { user }, więc trzeba go rozpakować
	const { user: authUser } = useAuth();
	const me = authUser?.email;
	const [pet, setPet] = useState(null);
	const isOwner = me && me === pet?.owner;
	// --- CZAT (backend) ---
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [thread, setThread] = useState(null);
	const [messages, setMessages] = useState([]);
	const petSpeciesTypes = {
		dog: 'Pies',
		cat: 'Kot',
		bird: 'Ptak',
		rodent: 'Gryzoń',
		reptile: 'Gad',
		other: 'Inne',
	};
	const petSizes = {
		small: 'Mały',
		medium: 'Średni',
		large: 'Duży',
	};
	useEffect(() => {
		if (!petId || !reportType) return;
		const fetchPet = async () => {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/main-page/fetch-pet/${petId}`,
					{ params: { reportType } }
				);
				setPet(response.data);
			} catch (err) {
				console.error('Błąd pobierania zgłoszenia:', err);
				setPet(null);
			}
		};
		fetchPet();
	}, [petId, reportType]);

	// Dołącz do pokoju po ustaleniu wątku i włącz live-update
	useEffect(() => {
		if (!thread) return;
		const socket = getSocket();
		socket.emit('chat:join', { threadId: thread.id });

		// ✅ Normalizacja eventu z socketa do kształtu jak w DB
		const onNew = (msg) => {
			if (msg.threadId !== thread.id) return;
			setMessages((prev) => [
				...prev,
				{
					id: msg.id,
					thread_id: msg.threadId,
					sender_email: msg.senderEmail, // email nadawcy
					text: msg.text,
					attachments: msg.attachments,
					created_at: msg.createdAt,
				},
			]);
		};

		socket.off('chat:newMessage');
		socket.on('chat:newMessage', onNew);

		return () => {
			socket.off('chat:newMessage', onNew);
		};
	}, [thread]);

	function openChatWindow() {
		setIsChatOpen(true);
		setThread(null);
		setMessages([]);
	}

	function closeChatWindow() {
		setIsChatOpen(false);
		setThread(null);
		setMessages([]);
	}

	async function handleSend(text, attachments = []) {
		if (!me) return;

		let t = thread;
		// Tworzymy/odnajdujemy wątek dopiero przy pierwszym wysłaniu
		if (!t) {
			t = await ensureThread({
				subject: pet?.pet_name || 'Zwierzak',
				petId: pet?.id ?? null,
				ownerEmail: me,
				partnerEmail: pet?.owner,
			});
			setThread(t);

			// pobierz historię (jeśli wątek już istniał)
			try {
				const history = await fetchMessages(t.id);
				setMessages(history || []);
			} catch {
				/* no-op */
			}
			// dołączenie do pokoju zrobi useEffect
		}

		const socket = getSocket();
		if (socket.connected) {
			socket.emit('chat:send', { threadId: t.id, text, attachments });
		} else {
			// fallback HTTP gdy socket niepołączony
			const msg = await sendMessageHttp(t.id, { text, attachments });
			setMessages((prev) => [...prev, msg]);
		}
	}

	// Zapis edycji
	const handleSave = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/');
			return;
		}
		const payload = {
			id: pet.id,
			pet_name: pet.pet_name,
			pet_species: pet.pet_species,
			pet_breed: pet.pet_breed,
			pet_age: pet.pet_age,
			description: pet.description,
			street: pet.street,
			city: pet.city,
			photo_url: pet.photo_url,
			type: reportType,
			status: 'pending',
		};
		try {
			console.log(pet);
			await axios.put(
				import.meta.env.VITE_BACKEND_URL + `/reports/edit-report`,
				payload,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.success('Zgłoszenie zostało zaktualizowane.');
			setSelectedPetId(null);
		} catch (error) {
			console.error('Błąd zapisu: ', error);
			toast.error('Wystąpił błąd podczas zapisu zgłoszenia.');
		}
	};
	if (!pet) {
		return <PetInfoSkeleton />;
	}
	return (
		<div
			className='fixed backdrop-blur-2xl h-screen w-screen z-100'
			onClick={() => setSelectedPetId(null)}
		>
			<div
				className='fixed left-1/2 -translate-x-1/2 h-full w-full lg:w-1/2 bg-main overflow-y-auto p-6 custom-scroll overflow-x-hidden'
				onClick={(e) => e.stopPropagation()}
			>
				<div className='flex flex-col gap-8'>
					<div className='flex items-center gap-4'>
						<EditableField
							value={pet?.pet_name}
							onChange={(v) => setPet({ ...pet, pet_name: v })}
							mode={mode}
							className='text-4xl font-bold'
						/>
						<span className='bg-negative p-2 rounded-2xl'>
							{reportType === 'lost' ? 'Zaginiony' : 'Znaleziony'}
						</span>
						<button
							onClick={() => setSelectedPetId(null)}
							className='absolute right-5 cursor-pointer'
							aria-label='Zamknij'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 640 640'
								className='fill-cta w-[30px]'
							>
								<path d='M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z' />
							</svg>
						</button>
					</div>

					<ImageCarousel images={pet?.photo_url} />
				</div>
				{/* Dane zwierzaka */}
				<div className='flex flex-col py-8 border-b-2 border-accent gap-4'>
					{/* Gatunek */}
					<div className='flex items-center gap-2'>
						<p className='bold text-xl'>Gatunek:</p>
						{mode === 'edit' ? (
							<select
								value={pet?.pet_species ?? ''}
								onChange={(e) =>
									setPet({ ...pet, pet_species: e.target.value })
								}
								className='border border-cta rounded px-2 py-1 text-accent bg-secondary'
							>
								{Object.keys(petSpeciesTypes).map((key) => (
									<option key={key} value={key}>
										{petSpeciesTypes[key]}
									</option>
								))}
							</select>
						) : (
							<p className='text-accent'>
								{petSpeciesTypes[pet?.pet_species] || 'Nie podano'}
							</p>
						)}
					</div>

					{/* Rasa */}
					<div className='flex items-center gap-2'>
						<p className='bold text-xl'>Rasa:</p>
						<EditableField
							value={pet?.pet_breed || 'Nie podano'}
							onChange={(v) => setPet({ ...pet, pet_breed: v })}
							mode={mode}
						/>
					</div>

					{/* Wiek */}
					<div className='flex items-center gap-2'>
						<p className='bold text-xl'>Wiek:</p>
						{mode === 'edit' ? (
							<div className='flex gap-0 rounded-md overflow-hidden'>
								<input
									type='number'
									value={pet?.pet_age_value ?? ''}
									onChange={(e) =>
										setPet({ ...pet, pet_age_value: e.target.value })
									}
									className='border border-cta px-2 py-1 text-accent'
								/>
								<select
									value={pet?.pet_age_unit ?? 'months'}
									onChange={(e) =>
										setPet({ ...pet, pet_age_unit: e.target.value })
									}
									className='w-32 px-3 py-1 border border-cta rounded-r-md bg-secondary text-text'
								>
									<option value='months'>miesięcy</option>
									<option value='years'>lat</option>
								</select>
							</div>
						) : (
							<p className='text-accent'>
								{pet?.pet_age_value} {pet?.pet_age_unit || ''}
							</p>
						)}
					</div>

					{/* Kolor */}
					<div className='flex items-center gap-2'>
						<p className='bold text-xl'>Kolor:</p>
						<EditableField
							value={pet?.pet_color || 'Nie podano'}
							onChange={(v) => setPet({ ...pet, pet_color: v })}
							mode={mode}
						/>
					</div>

					{/* Rozmiar */}
					<div className='flex items-center gap-2'>
						<p className='bold text-xl'>Rozmiar:</p>
						{mode === 'edit' ? (
							<select
								value={pet?.pet_size ?? ''}
								onChange={(e) => setPet({ ...pet, pet_size: e.target.value })}
								className='border border-cta rounded px-2 py-1 text-accent bg-secondary'
							>
								{Object.keys(petSizes).map((key) => (
									<option key={key} value={key}>
										{petSizes[key]}
									</option>
								))}
							</select>
						) : (
							<p className='text-accent'>
								{petSizes[pet?.pet_size] || 'Nie podano'}
							</p>
						)}
					</div>

					{/* Znaki szczególne */}
					<div className='space-y-2 mt-6 border-t border-secondary pt-4'>
						<p className='font-bold text-xl'>Znaki szczególne:</p>
						{mode === 'edit' ? (
							<textarea
								value={pet?.description || ''}
								onChange={(e) =>
									setPet({ ...pet, description: e.target.value })
								}
								placeholder='Opisz cechy charakterystyczne zwierzęcia...'
								className='w-full p-2 rounded-md bg-secondary border border-cta text-accent'
								rows={4}
							/>
						) : (
							<p className='text-accent'>{pet?.description || 'Brak opisu'}</p>
						)}
					</div>

					{/* Lokalizacja */}
					{authUser && (
						<div className='space-y-2 mt-6 border-t border-secondary pt-4'>
							<p className='font-bold text-xl'>
								{reportType === 'lost' ? 'Ostatnio widziany:' : 'Znaleziony:'}
							</p>
							{mode === 'edit' ? (
								<div className='flex flex-col gap-2'>
									<input
										type='text'
										value={pet?.street ?? ''}
										onChange={(e) => setPet({ ...pet, street: e.target.value })}
										className='border border-cta rounded px-2 py-1 text-accent'
										placeholder='Ulica'
									/>
									<input
										type='text'
										value={pet?.city ?? ''}
										onChange={(e) => setPet({ ...pet, city: e.target.value })}
										className='border border-cta rounded px-2 py-1 text-accent'
										placeholder='Miasto'
									/>
								</div>
							) : (
								<p className='text-accent'>
									<br />
									{pet?.street || 'Nie podano'}, {pet?.city || 'Nie podano'}
								</p>
							)}
						</div>
					)}
				</div>

				{authUser ? (
					<>
						{/* Mapa – placeholder */}
						<div className='border-b-2 border-accent pb-8'>
							<div className='w-full h-[200px] flex justify-center items-center bg-secondary rounded-2xl mt-8'>
								<GoogleMap
									mapContainerStyle={{ width: '100%', height: '100%' }}
									center={(() => {
										let lat, lng;
										if (typeof pet.coordinates === 'string') {
											const coordsStr = pet.coordinates.replace(/[()]/g, '');
											const [latStr, lngStr] = coordsStr.split(',');
											lat = parseFloat(latStr);
											lng = parseFloat(lngStr);
										} else {
											lat = pet.coordinates?.x;
											lng = pet.coordinates?.y;
										}

										// Fallback, gdyby coś poszło nie tak
										if (isNaN(lat) || isNaN(lng)) {
											return { lat: 52.2297, lng: 21.0122 }; // Warszawa np.
										}

										return { lat, lng };
									})()}
									zoom={13}
									options={{
										mapTypeControl: false,
										streetViewControl: false,
										clickableIcons: false,
										styles: [
											{
												elementType: 'geometry',
												stylers: [{ color: '#1e201e' }],
											},

											{
												elementType: 'labels.text.fill',
												stylers: [{ color: '#b7bdca' }],
											},
											{
												elementType: 'labels.text.stroke',
												stylers: [{ color: '#1e201e' }],
											},

											{
												featureType: 'road',
												elementType: 'geometry',
												stylers: [{ color: '#3c3d37' }],
											},
											{
												featureType: 'road',
												elementType: 'geometry.stroke',
												stylers: [{ color: '#272a27' }],
											},
											{
												featureType: 'road',
												elementType: 'labels.text.fill',
												stylers: [{ color: '#b7bdca' }],
											},

											{
												featureType: 'water',
												elementType: 'geometry',
												stylers: [{ color: '#272a27' }],
											},
											{
												featureType: 'water',
												elementType: 'labels.text.fill',
												stylers: [{ color: '#767b86' }],
											},

											{
												featureType: 'landscape',
												elementType: 'geometry',
												stylers: [{ color: '#242624' }],
											},
											{
												featureType: 'poi.park',
												elementType: 'geometry',
												stylers: [{ color: '#272a27' }],
											},

											{
												featureType: 'poi',
												elementType: 'all',
												stylers: [{ visibility: 'off' }],
											},

											{
												featureType: 'administrative',
												elementType: 'geometry',
												stylers: [{ color: '#3c3d37' }],
											},
											{
												featureType: 'administrative.country',
												elementType: 'labels.text.fill',
												stylers: [{ color: '#b7bdca' }],
											},

											{
												featureType: 'road.highway',
												elementType: 'geometry',
												stylers: [{ color: '#ce7f31' }],
											},
											{
												featureType: 'road.highway',
												elementType: 'geometry.stroke',
												stylers: [{ color: '#b56e2c' }],
											},
										],
									}}
								>
									{(() => {
										let lat, lng;
										if (typeof pet.coordinates === 'string') {
											const coordsStr = pet.coordinates.replace(/[()]/g, '');
											const [latStr, lngStr] = coordsStr.split(',');
											lat = parseFloat(latStr);
											lng = parseFloat(lngStr);
										} else {
											lat = pet.coordinates?.x;
											lng = pet.coordinates?.y;
										}

										if (isNaN(lat) || isNaN(lng)) return null;

										return (
											<OverlayView
												position={{ lat, lng }}
												mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
											>
												<div className='absolute -translate-x-1/2 -translate-y-full rounded-full overflow-hidden border-2 border-cta shadow-md w-[50px] h-[50px]'>
													<img
														src={pet.photo_url?.[0]}
														alt={pet.pet_name || 'Zwierzak'}
														className='w-full h-full object-cover pointer-events-none'
													/>
												</div>
											</OverlayView>
										);
									})()}
								</GoogleMap>
							</div>
						</div>

						{/* Kontakt + akcje */}
						<div className='flex flex-col py-8 space-y-2'>
							<p className='font-bold text-xl mb-4'>Kontakt do właściciela:</p>
							<p className={`text-accent`}>
								{pet?.first_name && pet?.surname
									? `${pet.first_name} ${pet.surname}`
									: 'Nie podano'}
							</p>
							<p className={`text-accent`}>{pet?.owner || 'Nie podano'}</p>
							<p className={`text-accent`}>{pet?.phone || 'Nie podano'}</p>

							{!isOwner && mode === 'view' && (
								<button
									className='bg-cta rounded-2xl py-1 px-3 ml-auto text-lg cursor-pointer'
									onClick={openChatWindow}
								>
									Chat
								</button>
							)}

							{mode === 'edit' && (
								<button
									onClick={handleSave}
									className='bg-cta rounded-2xl py-1 px-3 ml-auto text-lg cursor-pointer'
								>
									Zapisz
								</button>
							)}
						</div>

						{isChatOpen && (
							<ChatModal
								isOpen={true}
								onClose={closeChatWindow}
								partnerName={pet?.owner || 'Właściciel'}
								topicName={pet?.pet_name || 'Zwierzak'}
								currentUserId={me || 'me'}
								messages={messages.map((m) => ({
									id: m.id,
									senderId: m.sender_email || m.senderEmail || m.senderId,
									text: m.text,
									createdAt: m.createdat || m.created_at || m.createdAt,
									attachments: m.attachments,
								}))}
								onSend={handleSend}
							/>
						)}
					</>
				) : (
					<div className='mt-5'>
						<p>
							W tym miejscu znajdują się informacje poufne. Aby mieć do nich
							dostęp proszę się{' '}
							<span onClick={onAction} className='text-cta cursor-pointer'>
								zalogować
							</span>
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default PetInfo;
