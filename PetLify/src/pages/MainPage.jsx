import { useState, useEffect } from 'react';
import PetCard from '../components/ui/PetCard';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LostDog from '../img/lost-dog.jpg';
import FoundCat from '../img/found-cat.jpg';
import PetInfo from '../components/ui/PetInfo';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import AuthForm from '../components/features/auth/AuthForm';
import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';
const INITIAL_FILTERS = {
	species: '',
	breed: '',
	location: '',
	ageFrom: '',
	ageTo: '',
	ageUnit: 'years', // NEW: lata | miesiące
	sort: 'newest',
};
const PAGE_SIZE = 3; // <<< PAGINACJA: ile kart na stronę
// <<< PAGINACJA: stan

// ---- Wiek: tylko cyfry, min=1; blokada myślnika itp. ----
function sanitizeAgeInt(v) {
	if (v === '' || v === null || typeof v === 'undefined') return '';
	const onlyDigits = String(v).replace(/\D+/g, '');
	if (onlyDigits === '') return '';
	const n = parseInt(onlyDigits, 10);
	if (!Number.isFinite(n)) return '';
	return String(Math.max(1, n));
}

const BLOCKED_KEYS = new Set(['-', '+', 'e', 'E', '.', ',', ' ']);

// ---- Gatunek/Rasa: tylko litery (w tym PL) i spacje ----
const LETTERS_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]+$/;
const isLettersOrEmpty = (s) => !s || LETTERS_REGEX.test(s);

const MainPage = () => {
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: PAGE_SIZE,
		total: 0,
		totalPages: 1,
	});
	const { user } = useUser();
	const { user: loggedInUser } = useAuth();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [activeTab, setActiveTab] = useState('lost');
	const [userPanelActive, setUserPanelActive] = useState(false);
	const [handlePopUpState, setHandlePopUpState] = useState({
		formChoiceActive: false,
		formActive: false,
	});
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [isLoginPopupActive, setIsLoginPopupActive] = useState(false);
	const [petsData, setPetsData] = useState([]);
	const [allPetsData, setAllPetsData] = useState([]);
	const [selectedPosition, setSelectedPosition] = useState(null);
	const basePin = {
		latitude: 52.4057,
		longitude: 16.9313,
	};
	const [filters, setFilters] = useState(INITIAL_FILTERS);
	const [appliedFilters, setAppliedFilters] = useState(null);

	const petSpeciesTypes = [
		{ value: '', label: '-- Wybierz --' },
		{ value: 'dog', label: 'Pies' },
		{ value: 'cat', label: 'Kot' },
		{ value: 'bird', label: 'Ptak' },
		{ value: 'rodent', label: 'Gryzoń' },
		{ value: 'reptile', label: 'Gad' },
		{ value: 'other', label: 'Inne' },
	];

	const fetchPetsData = async (type, page = 1) => {
		setActiveTab(type);
		setAppliedFilters(null);

		try {
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/main-page/fetch-pets`,
				{
					params: { type, status: 'active', page, limit: pagination.pageSize },
				}
			);
			console.log('pagination payload', response.data);
			const payload = response.data || {};
			const mapped = (payload.items || []).map((pet) => {
				const map = petSpeciesTypes.find((s) => s.value === pet.pet_species);
				return map ? { ...pet, pet_species: map.label } : pet;
			});

			setAllPetsData(mapped);
			setPetsData(mapped);
			setPagination({
				page: payload.page || 1,
				pageSize: payload.pageSize || PAGE_SIZE,
				total: payload.total || 0,
				totalPages: payload.totalPages || 1,
			});
		} catch (error) {
			console.error('Error fetching pets data:', error);
			setAllPetsData([]);
			setPetsData([]);
			setPagination({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
		}
	};

	useEffect(() => {
		fetchPetsData('lost', 1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleLogOut = () => {
		localStorage.removeItem('token');
		window.dispatchEvent(new Event('tokenChange'));
		navigate('/');
	};

	const handlePetInfo = (pet) => {
		setSearchParams({ petId: pet.id, type: activeTab });
	};

	const onApplyFilters = async (page = 1) => {
		// --- Walidacja: jeśli rasa zawiera coś innego niż litery/spacje,
		// to nie wołamy backendu — od razu pokazujemy "Brak wyników..."
		if (!isLettersOrEmpty(filters.breed)) {
			setAppliedFilters(null);
			setAllPetsData([]);
			setPetsData([]);
			setPagination({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
			return;
		}

		const sortMap = {
			newest: 'newest',
			oldest: 'oldest',
			ageAsc: 'age_asc',
			ageDesc: 'age_desc',
		};

		const params = {
			type: activeTab,
			status: 'active',
			species: filters.species || undefined,
			breed: filters.breed?.trim() || undefined,
			cityStreet: filters.location?.trim() || undefined,
			ageFrom: filters.ageFrom
				? Math.max(1, parseInt(filters.ageFrom, 10) || 1)
				: undefined,
			ageTo: filters.ageTo
				? Math.max(1, parseInt(filters.ageTo, 10) || 1)
				: undefined,
			ageUnit: filters.ageUnit || 'years', // NEW
			sort: sortMap[filters.sort] || 'newest',
			page,
			limit: pagination.pageSize, // <<< PAGINACJA
		};

		try {
			const { data } = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/main-page/fetch-pets`,
				{ params }
			);

			setAppliedFilters(params);

			const items = (data?.items || []).map((pet) => {
				const map = petSpeciesTypes.find((s) => s.value === pet.pet_species);
				return map ? { ...pet, pet_species: map.label } : pet;
			});

			setAllPetsData(items);
			setPetsData(items);
			setPagination({
				page: data?.page || 1,
				pageSize: data?.pageSize || PAGE_SIZE,
				total: data?.total || 0,
				totalPages: data?.totalPages || 1,
			});
		} catch (e) {
			console.error('Apply filters error:', e);
			setAllPetsData([]);
			setPetsData([]);
			setPagination({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
		}
	};

	const onResetFilters = async () => {
		setFilters(INITIAL_FILTERS);
		setAppliedFilters(null);
		await fetchPetsData(activeTab, 1);
	};

	const goPrev = () => {
		if (pagination.page > 1) {
			const newPage = pagination.page - 1;
			if (appliedFilters) onApplyFilters(newPage);
			else fetchPetsData(activeTab, newPage);
		}
	};
	const goNext = () => {
		if (pagination.page < pagination.totalPages) {
			const newPage = pagination.page + 1;
			if (appliedFilters) onApplyFilters(newPage);
			else fetchPetsData(activeTab, newPage);
		}
	};

	// wspólne propsy zabezpieczające dla pól wieku
	const numericGuards = {
		inputMode: 'numeric',
		pattern: '[0-9]*',
		onKeyDown: (e) => {
			if (BLOCKED_KEYS.has(e.key)) e.preventDefault();
		},
		onPaste: (e) => {
			const text = (e.clipboardData || window.clipboardData).getData('text');
			if (!/^\d+$/.test(text)) e.preventDefault();
		},
	};

	// zabezpieczenia dla pól tekstowych (gatunek/rasa)
	const textGuards = {
		pattern: '[A-Za-zÀ-ÖØ-öø-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\\s]*',
		onPaste: (e) => {
			const text = (e.clipboardData || window.clipboardData).getData('text');
			if (!LETTERS_REGEX.test(text)) e.preventDefault();
		},
	};
	const selectedPetId = searchParams.get('petId');
	const type = searchParams.get('type');
	console.log(petsData);
	return (
		<div className='relative bg-secondary flex lg:h-screen'>
			<div className='lg:flex lg:w-4/10  items-center justify-center overflow-y-hidden hidden'>
				{!selectedPetId && (
					<LoadScript
						googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
					>
						<GoogleMap
							mapContainerStyle={{ width: '100%', height: '100%' }}
							center={
								selectedPosition || {
									lat: basePin.latitude,
									lng: basePin.longitude,
								}
							}
							zoom={11}
							options={{
								mapTypeControl: false,
								streetViewControl: false,
								clickableIcons: false,
							}}
						>
							{petsData.map((pet) => {
								let lat, lng;
								if (typeof pet.coordinates === 'string') {
									const coordsStr = pet.coordinates.replace(/[()]/g, '');
									const [latStr, lngStr] = coordsStr.split(',');
									lat = parseFloat(latStr);
									lng = parseFloat(lngStr);
								} else {
									lat = pet.coordinates.x;
									lng = pet.coordinates.y;
								}

								if (isNaN(lat) || isNaN(lng)) return null;

								return (
									<OverlayView
										position={{ lat, lng }}
										mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
									>
										<div
											onClick={() => handlePetInfo(pet)}
											className='absolute -translate-x-1/2 -translate-y-full rounded-full overflow-hidden border-2 border-cta shadow-md w-[50px] h-[50px] cursor-pointer'
										>
											<img
												src={pet.photo_url[0]}
												className='w-full h-full object-cover'
											/>
										</div>
									</OverlayView>
								);
							})}
						</GoogleMap>
					</LoadScript>
				)}
			</div>

			<div className='flex flex-col items-center gap-2 py-4 px-6 lg:w-6/10 w-full'>
				{/* + Zgłoś zwierzę */}
				<div className='w-full'>
					<button
						onClick={() =>
							setHandlePopUpState({ formChoiceActive: true, formActive: false })
						}
						className='bg-cta w-full rounded-xl p-2 cursor-pointer'
					>
						+ Zgłoś zwierzę
					</button>
				</div>

				{/* Zakładki */}
				<div className='flex w-full gap-2'>
					<button
						className={`w-1/2 rounded-xl p-2 cursor-pointer transition-colors ${
							activeTab === 'lost' ? 'bg-cta' : 'bg-gray-300 text-main'
						}`}
						onClick={() => fetchPetsData('lost', 1)}
					>
						Zaginione
					</button>
					<button
						className={`w-1/2 rounded-xl p-2 cursor-pointer transition-colors ${
							activeTab === 'found' ? 'bg-cta' : 'bg-gray-300 text-main'
						}`}
						onClick={() => fetchPetsData('found', 1)}
					>
						Znalezione
					</button>
				</div>

				{/* Pasek z lejem + avatar */}
				<div className='relative w-full flex items-center justify-between'>
					{/* Lejek */}
					<button
						onClick={() => setFiltersOpen((s) => !s)}
						className='w-[50px] h-[50px] bg-cta rounded-xl fill-text p-1 cursor-pointer'
						title='Filtry'
						aria-label='Filtry'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 640 640'
							className='w-full h-full'
						>
							<path d='M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z' />
						</svg>
					</button>

					<button
						onClick={() => setUserPanelActive((prev) => !prev)}
						className='w-[50px] h-[50px] bg-white rounded-full p-1 z-1 cursor-pointer'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 640 640'
							className='w-full h-full'
						>
							<path d='M320 312C253.7 312 200 258.3 200 192C200 125.7 253.7 72 320 72C386.3 72 440 125.7 440 192C440 258.3 386.3 312 320 312zM289.5 368L350.5 368C360.2 368 368 375.8 368 385.5C368 389.7 366.5 393.7 363.8 396.9L336.4 428.9L367.4 544L368 544L402.6 405.5C404.8 396.8 413.7 391.5 422.1 394.7C484 418.3 528 478.3 528 548.5C528 563.6 515.7 575.9 500.6 575.9L139.4 576C124.3 576 112 563.7 112 548.6C112 478.4 156 418.4 217.9 394.8C226.3 391.6 235.2 396.9 237.4 405.6L272 544.1L272.6 544.1L303.6 429L276.2 397C273.5 393.8 272 389.8 272 385.6C272 375.9 279.8 368.1 289.5 368.1z' />
						</svg>
					</button>

					{/* Panel użytkownika */}
					{
						<div
							className={`absolute right-0 top-[calc(50%-25px)] bg-user-options-fill w-full max-w-[500px] md:w-1/2 lg:w-1/2 z-0 flex flex-col gap-4 rounded-3xl p-3 transition-all duration-300 ease-in-out origin-right ${
								userPanelActive
									? 'opacity-100 scale-100'
									: 'opacity-0 scale-95 pointer-events-none'
							}`}
						>
							{user ? (
								<>
									<div>
										<p className='text-xl font-bold'>
											{user?.first_name
												? user.first_name + ' ' + user.surname
												: 'Użytkownik'}
										</p>
										<p className='text-sm'>{loggedInUser?.email}</p>
									</div>

									<div className='flex flex-col items-center gap-3'>
										<Link
											to='/chats'
											className='bg-cta w-9/10 rounded-2xl p-2 font-bold cursor-pointer text-center'
										>
											Moje czaty
										</Link>
										<Link
											to='/reports'
											className='bg-cta w-9/10 rounded-2xl p-2 font-bold cursor-pointer text-center'
										>
											Moje zgłoszenia
										</Link>
										<Link
											to='/settings'
											className='bg-cta w-9/10 rounded-2xl p-2 font-bold cursor-pointer text-center'
										>
											Ustawienia
										</Link>

										{loggedInUser?.role === 'admin' && (
											<Link
												to='/admin-panel'
												className='bg-cta w-9/10 rounded-2xl p-2 font-bold cursor-pointer text-center'
											>
												Panel administracyjny
											</Link>
										)}

										<div className='w-9/10'>
											<button
												className='flex items-center cursor-pointer gap-3'
												onClick={handleLogOut}
											>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													viewBox='0 0 640 640'
													className='fill-cta w-[25px]'
												>
													<path d='M224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160zM566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L438.6 169.3C426.1 156.8 405.8 156.8 393.3 169.3C380.8 181.8 380.8 202.1 393.3 214.6L466.7 288L256 288C238.3 288 224 302.3 224 320C224 337.7 238.3 352 256 352L466.7 352L393.3 425.4C380.8 437.9 380.8 458.2 393.3 470.7C405.8 483.2 426.1 483.2 438.6 470.7L566.6 342.7z' />
												</svg>
												Wyloguj się
											</button>
										</div>
									</div>
								</>
							) : (
								<p className='w-8/10'>
									Żeby korzystać z funkcji menu użytkownika należy się
									<span
										onClick={() => setIsLoginPopupActive(true)}
										className='text-cta cursor-pointer'
									>
										{' '}
										zalogować.
									</span>
								</p>
							)}
						</div>
					}
				</div>

				{/* PANEL FILTRÓW */}
				{filtersOpen && (
					<div className='w-full bg-user-options-fill rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-visible'>
						<div className='flex flex-col relative z-50'>
							<label className='text-sm text-accent mb-1'>Gatunek</label>
							<select
								className='rounded-xl px-3 py-2 bg-secondary text-text outline-none relative z-50'
								value={filters.species}
								onChange={(e) =>
									setFilters((s) => ({ ...s, species: e.target.value }))
								}
							>
								{petSpeciesTypes.map((opt) => (
									<option key={opt.value || 'none'} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>

						<div className='flex flex-col'>
							<label className='text-sm text-accent mb-1'>Rasa</label>
							<input
								className='rounded-xl px-3 py-2 bg-secondary text-text outline-none'
								placeholder='np. Doberman'
								value={filters.breed}
								pattern='[A-Za-zÀ-ÖØ-öø-ÿĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]*'
								onPaste={(e) => {
									const text = (
										e.clipboardData || window.clipboardData
									).getData('text');
									if (!LETTERS_REGEX.test(text)) e.preventDefault();
								}}
								onChange={(e) =>
									setFilters((s) => ({ ...s, breed: e.target.value }))
								}
								title='Używaj tylko liter i spacji'
							/>
						</div>

						<div className='flex flex-col md:col-span-2'>
							<label className='text-sm text-accent mb-1'>
								Miasto , Ulica (oddziel przecinkami)
							</label>
							<input
								className='rounded-xl px-3 py-2 bg-secondary text-text outline-none'
								placeholder='np. Poznań, Zwierzyniecka'
								value={filters.location}
								onChange={(e) =>
									setFilters((s) => ({ ...s, location: e.target.value }))
								}
							/>
						</div>

						{/* WIEK + jednostka */}
						<div className='flex flex-col'>
							<label className='text-sm text-accent mb-1'>
								Wiek od ({filters.ageUnit === 'months' ? 'miesiące' : 'lata'})
							</label>
							<input
								type='number'
								min='1'
								step='1'
								inputMode='numeric'
								pattern='[0-9]*'
								className='rounded-xl px-3 py-2 bg-secondary text-text outline-none'
								placeholder={filters.ageUnit === 'months' ? 'np. 6' : 'np. 1'}
								value={filters.ageFrom}
								onKeyDown={(e) => {
									if (BLOCKED_KEYS.has(e.key)) e.preventDefault();
								}}
								onPaste={(e) => {
									const text = (
										e.clipboardData || window.clipboardData
									).getData('text');
									if (!/^\d+$/.test(text)) e.preventDefault();
								}}
								onChange={(e) =>
									setFilters((s) => ({
										...s,
										ageFrom: sanitizeAgeInt(e.target.value),
									}))
								}
							/>
						</div>

						<div className='flex flex-col'>
							<label className='text-sm text-accent mb-1'>
								Wiek do ({filters.ageUnit === 'months' ? 'miesiące' : 'lata'})
							</label>
							<input
								type='number'
								min='1'
								step='1'
								inputMode='numeric'
								pattern='[0-9]*'
								className='rounded-xl px-3 py-2 bg-secondary text-text outline-none'
								placeholder={filters.ageUnit === 'months' ? 'np. 12' : 'np. 10'}
								value={filters.ageTo}
								onKeyDown={(e) => {
									if (BLOCKED_KEYS.has(e.key)) e.preventDefault();
								}}
								onPaste={(e) => {
									const text = (
										e.clipboardData || window.clipboardData
									).getData('text');
									if (!/^\d+$/.test(text)) e.preventDefault();
								}}
								onChange={(e) =>
									setFilters((s) => ({
										...s,
										ageTo: sanitizeAgeInt(e.target.value),
									}))
								}
							/>
						</div>

						{/* Jednostka wieku */}
						<div className='flex flex-col md:col-span-2'>
							<label className='text-sm text-accent mb-1'>
								Jednostka wieku
							</label>
							<select
								className='rounded-xl px-3 py-2 bg-secondary text-text outline-none'
								value={filters.ageUnit}
								onChange={(e) =>
									setFilters((s) => ({ ...s, ageUnit: e.target.value }))
								}
							>
								<option value='years'>lata</option>
								<option value='months'>miesiące</option>
							</select>
						</div>

						<div className='flex flex-col md:col-span-2'>
							<label className='text-sm text-accent mb-1'>Sortowanie</label>
							<select
								className='rounded-xl px-3 py-2 bg-secondary text-text outline-none'
								value={filters.sort}
								onChange={(e) =>
									setFilters((s) => ({ ...s, sort: e.target.value }))
								}
							>
								<option value='newest'>Najnowsze</option>
								<option value='oldest'>Najstarsze</option>
								<option value='ageAsc'>Wiek rosnąco</option>
								<option value='ageDesc'>Wiek malejąco</option>
							</select>
						</div>

						<div className='flex items-center gap-3 md:col-span-2'>
							<button
								className='bg-cta rounded-2xl px-4 py-2 cursor-pointer'
								onClick={() => onApplyFilters(1)}
							>
								Filtruj
							</button>
							<button
								className='bg-secondary rounded-2xl px-4 py-2 cursor-pointer'
								onClick={onResetFilters}
							>
								Reset
							</button>
						</div>
					</div>
				)}

				{/* LISTA KART */}
				<div className='custom-scroll flex flex-col w-full gap-2 lg:overflow-y-scroll pr-2'>
					{petsData.length === 0 ? (
						<div className='text-accent text-center py-8'>
							Brak wyników dla wybranych filtrów.
						</div>
					) : (
						petsData.map((pet) => (
							<PetCard key={pet.id} pet={pet} handlePetInfo={handlePetInfo} />
						))
					)}
				</div>
				{/* PAGINACJA – serwerowa */}
				{pagination.total > 0 && (
					<div className='w-full flex items-center justify-center gap-2 sm:gap-3 py-3'>
						<button
							className='bg-cta rounded-xl px-3 py-2 cursor-pointer disabled:opacity-50 flex items-center gap-1'
							onClick={goPrev}
							disabled={pagination.page <= 1}
						>
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 19l-7-7 7-7'
								/>
							</svg>
							<span className='hidden sm:inline'>Poprzednia</span>
						</button>

						<div className='flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm text-accent'>
							<span className='whitespace-nowrap'>
								Strona {pagination.page} / {pagination.totalPages}
							</span>
							<span className='hidden sm:inline'>•</span>
							<span className='whitespace-nowrap'>
								Łącznie {pagination.total}
							</span>
						</div>

						<button
							className='bg-cta rounded-xl px-3 py-2 cursor-pointer disabled:opacity-50 flex items-center gap-1'
							onClick={goNext}
							disabled={pagination.page >= pagination.totalPages}
						>
							<span className='hidden sm:inline'>Następna</span>
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M9 5l7 7-7 7'
								/>
							</svg>
						</button>
					</div>
				)}
			</div>

			{/* Popup wyboru typu formularza */}
			{handlePopUpState.formChoiceActive && (
				<div className='fixed w-full h-full z-100 backdrop-blur-2xl'>
					<div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-9/10 lg:w-1/2 bg-main rounded-2xl p-6'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 640 640'
							className='fill-text h-[75px]'
						>
							<path d='M298.5 156.9C312.8 199.8 298.2 243.1 265.9 253.7C233.6 264.3 195.8 238.1 181.5 195.2C167.2 152.3 181.8 109 214.1 98.4C246.4 87.8 284.2 114 298.5 156.9zM164.4 262.6C183.3 295 178.7 332.7 154.2 346.7C129.7 360.7 94.5 345.8 75.7 313.4C56.9 281 61.4 243.3 85.9 229.3C110.4 215.3 145.6 230.2 164.4 262.6zM133.2 465.2C185.6 323.9 278.7 288 320 288C361.3 288 454.4 323.9 506.8 465.2C510.4 474.9 512 485.3 512 495.7L512 497.3C512 523.1 491.1 544 465.3 544C453.8 544 442.4 542.6 431.3 539.8L343.3 517.8C328 514 312 514 296.7 517.8L208.7 539.8C197.6 542.6 186.2 544 174.7 544C148.9 544 128 523.1 128 497.3L128 495.7C128 485.3 129.6 474.9 133.2 465.2zM485.8 346.7C461.3 332.7 456.7 295 475.6 262.6C494.5 230.2 529.6 215.3 554.1 229.3C578.6 243.3 583.2 281 564.3 313.4C545.4 345.8 510.3 360.7 485.8 346.7zM374.1 253.7C341.8 243.1 327.2 199.8 341.5 156.9C355.8 114 393.6 87.8 425.9 98.4C458.2 109 472.8 152.3 458.5 195.2C444.2 238.1 406.4 264.3 374.1 253.7z' />
						</svg>

						<button
							onClick={() =>
								setHandlePopUpState({
									formChoiceActive: false,
									formActive: false,
								})
							}
							className='absolute right-5 cursor-pointer'
							aria-label='Zamknij'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 640 640'
								className='fill-cta w-[30px]'
							>
								<path d='M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3L320.5 274.7L183.1 137.4z' />
							</svg>
						</button>

						<div className='relative space-y-3 mb-3'>
							<p className='text-center text-3xl font-bold'>
								Status zwierzęcia
							</p>
							<p className='text-center'>Wybierz odpowiednią opcję:</p>
						</div>

						<div className='flex items-center justify-around'>
							<div className='relative p-1 w-1/2'>
								<button
									className='group h-100 w-full overflow-hidden cursor-pointer'
									onClick={() => {
										setHandlePopUpState({
											formChoiceActive: false,
											formActive: false,
										});
										navigate('/main-page/create-lost-form');
									}}
								>
									<img
										src={LostDog}
										alt='Confused dog looking up'
										className='w-full h-full object-cover object-center group-hover:scale-150 transition-transform duration-300'
									/>
									<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full h-full bg-main-transparent'>
										<p className='text-xl font-bold group-hover:scale-80 transition-transform duration-300'>
											Zaginiony
										</p>
									</div>
								</button>
							</div>

							<div className='relative p-1 w-1/2'>
								<button
									className='group h-100 w-full overflow-hidden cursor-pointer'
									onClick={() => {
										setHandlePopUpState({
											formChoiceActive: false,
											formActive: false,
										});
										navigate('/main-page/create-found-form');
									}}
								>
									<img
										src={FoundCat}
										alt='Relaxed cat sleeping on the couch'
										className='w-full h-full object-cover object-center group-hover:scale-150 transition-transform duration-300'
									/>
									<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full h-full bg-main-transparent'>
										<p className='text-xl font-bold group-hover:scale-80 transition-transform duration-300'>
											Znaleziony
										</p>
									</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{selectedPetId && (
				<PetInfo
					petId={selectedPetId}
					reportType={type}
					setSelectedPetId={() => setSearchParams({})}
					mode='view'
					onAction={() => setIsLoginPopupActive((prev) => !prev)}
				/>
			)}

			{isLoginPopupActive && (
				<div className='fixed w-full h-full z-100 flex items-center backdrop-blur-lg justify-center'>
					<AuthForm
						popupMode={true}
						onAction={() => setIsLoginPopupActive(false)}
					/>
				</div>
			)}
		</div>
	);
};

export default MainPage;
