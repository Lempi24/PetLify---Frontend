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

	// NOWE: stan akceptacji regulaminu + modal + błąd
	const [acceptTerms, setAcceptTerms] = useState(false);
	const [showTermsModal, setShowTermsModal] = useState(false);
	const [termsError, setTermsError] = useState('');

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
					},
					{
						withCredentials: true,
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
			// REJESTRACJA

			// 1) Sprawdzenie regulaminu
			if (!acceptTerms) {
				setTermsError('Aby się zarejestrować, musisz zaakceptować regulamin.');
				toast.error('Musisz zaakceptować regulamin, aby się zarejestrować.');
				return;
			} else {
				setTermsError('');
			}

			// 2) ReCAPTCHA
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
				setAcceptTerms(false);
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
		// resetujemy stan regulaminu przy przełączaniu formularza
		setAcceptTerms(false);
		setTermsError('');
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
					type='button'
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

						{/* CHECKBOX REGULAMINU */}
						<div className='mt-2'>
							<div className='flex items-start gap-2'>
								<input
									id='terms'
									type='checkbox'
									checked={acceptTerms}
									onChange={(e) => setAcceptTerms(e.target.checked)}
									className='mt-1 w-4 h-4 cursor-pointer accent-cta'
								/>
								<label htmlFor='terms' className='text-sm leading-snug'>
									Akceptuję{' '}
									<button
										type='button'
										onClick={() => setShowTermsModal(true)}
										className='text-cta underline cursor-pointer'
									>
										regulamin serwisu
									</button>
									.
								</label>
							</div>
							{termsError && (
								<p className='text-xs text-negative mt-1'>{termsError}</p>
							)}
						</div>
					</div>
				)}

				<div className='flex flex-col items-center justify-center gap-3 w-full'>
					<button
						type='submit'
						className='bg-cta px-10 py-3 tex-text rounded-md w-full cursor-pointer'
					>
						{isLoging ? 'Zaloguj się' : 'Zarejestruj się'}
					</button>
					<p className='text-gray'>
						{isLoging ? 'Nie masz konta?' : 'Masz już konto?'}
						<span className='text-cta cursor-pointer' onClick={changeForm}>
							{isLoging ? ' Zarejestruj się' : ' Zaloguj się'}
						</span>
					</p>
					{!popupMode && (
						<p className='text-gray'>
							Zaloguj się jako{' '}
							<Link to={'/main-page'} className='text-cta cursor-pointer'>
								gość
							</Link>
						</p>
					)}
				</div>
			</div>

			{/* MODAL Z REGULAMINEM */}
			{showTermsModal && (
				<div className='fixed inset-0 z-[120] flex items-center justify-center bg-black/70'>
					<div className='bg-main w-11/12 max-w-3xl max-h-[80vh] rounded-2xl p-6 flex flex-col'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-xl font-bold'>Regulamin serwisu PetLify</h2>
							<button
								type='button'
								onClick={() => setShowTermsModal(false)}
								className='cursor-pointer text-cta text-2xl leading-none'
								aria-label='Zamknij regulamin'
							>
								×
							</button>
						</div>

						<div className='custom-scroll overflow-y-auto pr-2 text-sm leading-relaxed space-y-3'>
							{
								<div className='custom-scroll overflow-y-auto pr-2 text-sm leading-relaxed space-y-4'>
									<div>
										<p className='font-semibold'>Regulamin serwisu Petlify</p>
										<p className='text-xs text-gray-400'>
											(wersja 1.1 – obowiązująca od 10 listopada 2025 r.)
										</p>
									</div>

									{/* §1 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§1. Postanowienia ogólne
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Regulamin określa zasady korzystania z serwisu
												internetowego Petlify (dalej: „Serwis”).
											</li>
											<li>
												Serwis ma charakter bezpłatny i służy do publikowania,
												przeglądania oraz zarządzania ogłoszeniami dotyczącymi
												zagubionych i odnalezionych zwierząt domowych.
											</li>
											<li>
												Operatorem Serwisu jest Zespół Projektowy Petlify
												(dalej: „Operator”), działający w ramach projektu
												edukacyjnego.
											</li>
											<li>
												Kontakt z Operatorem możliwy jest za pośrednictwem
												formularza kontaktowego w Serwisie lub drogą e-mailową
												na adres:{' '}
												<span className='font-mono'>
													petflify.team@gmail.com
												</span>
												.
											</li>
											<li>
												Korzystanie z Serwisu oznacza akceptację niniejszego
												Regulaminu.
											</li>
										</ol>
									</section>

									{/* §2 */}
									<section>
										<h3 className='font-semibold mb-1'>§2. Definicje</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												<strong>Użytkownik</strong> – osoba fizyczna
												korzystająca z Serwisu, w szczególności publikująca lub
												przeglądająca ogłoszenia.
											</li>
											<li>
												<strong>Konto Użytkownika</strong> – zbiór danych i
												ustawień przypisanych do danego Użytkownika.
											</li>
											<li>
												<strong>Ogłoszenie</strong> – informacja o zagubionym
												lub odnalezionym zwierzęciu, dodana przez Użytkownika.
											</li>
											<li>
												<strong>Operator</strong> – Zespół Projektowy Petlify,
												odpowiedzialny za utrzymanie i administrację Serwisu.
											</li>
											<li>
												<strong>Regulamin</strong> – niniejszy dokument.
											</li>
										</ol>
									</section>

									{/* §3 */}
									<section>
										<h3 className='font-semibold mb-1'>§3. Zakres usług</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Serwis umożliwia Użytkownikom:
												<ul className='list-disc pl-6 ml-2 mt-1 space-y-1'>
													<li>
														publikowanie ogłoszeń o zagubionych lub
														odnalezionych zwierzętach,
													</li>
													<li>
														przeglądanie ogłoszeń bez konieczności logowania,
													</li>
													<li>
														kontakt z innymi Użytkownikami poprzez wbudowany
														komunikator,
													</li>
													<li>przeglądanie mapy z lokalizacjami zgłoszeń,</li>
													<li>otrzymywanie powiadomień (e-mail, push).</li>
												</ul>
											</li>
											<li>Korzystanie z Serwisu jest bezpłatne.</li>
											<li>
												Operator zastrzega sobie prawo do moderowania, skracania
												lub usuwania ogłoszeń niezgodnych z Regulaminem lub
												prawem.
											</li>
											<li>
												Operator może czasowo zawiesić działanie Serwisu w celu
												aktualizacji lub napraw technicznych.
											</li>
										</ol>
									</section>

									{/* §4 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§4. Warunki korzystania z Serwisu
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Użytkownik jest zobowiązany do:
												<ul className='list-disc pl-6 ml-2 mt-1 space-y-1'>
													<li>podawania prawdziwych danych,</li>
													<li>
														niepublikowania treści niezgodnych z prawem, w tym
														obraźliwych, wulgarnych lub wprowadzających w błąd,
													</li>
													<li>
														publikowania wyłącznie ogłoszeń związanych z
														zagubionymi lub odnalezionymi zwierzętami.
													</li>
												</ul>
											</li>
											<li>
												Użytkownik może posiadać jedno Konto przypisane do
												danego adresu e-mail.
											</li>
											<li>
												Użytkownik może w każdej chwili usunąć swoje Konto lub
												ogłoszenie.
											</li>
										</ol>
									</section>

									{/* §5 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§5. Odpowiedzialność Użytkownika
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Użytkownik ponosi pełną odpowiedzialność za treść
												publikowanych ogłoszeń.
											</li>
											<li>
												Operator nie ponosi odpowiedzialności za:
												<ul className='list-disc pl-6 ml-2 mt-1 space-y-1'>
													<li>prawdziwość i aktualność ogłoszeń,</li>
													<li>
														skuteczność działań podejmowanych na ich podstawie,
													</li>
													<li>
														ewentualne szkody wynikłe z prób odzyskania lub
														przekazania zwierząt.
													</li>
												</ul>
											</li>
											<li>
												Publikując ogłoszenie, Użytkownik udziela Operatorowi
												bezpłatnej, niewyłącznej licencji na publikację treści i
												zdjęć w ramach Serwisu na czas jego publikacji.
											</li>
										</ol>
									</section>

									{/* §6 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§6. Weryfikacja i usuwanie ogłoszeń
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Operator może dokonywać weryfikacji zgłoszeń, w
												szczególności pod kątem treści niezgodnych z Regulaminem
												lub dublujących istniejące ogłoszenia.
											</li>
											<li>
												Ogłoszenia mogą być automatycznie usuwane po 30 dniach
												od ich publikacji.
											</li>
											<li>
												Operator zastrzega sobie prawo do usunięcia lub
												zablokowania konta Użytkownika w przypadku naruszenia
												niniejszego Regulaminu.
											</li>
										</ol>
									</section>

									{/* §7 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§7. Odpowiedzialność Operatora
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Operator dokłada starań, aby Serwis działał
												nieprzerwanie i bez błędów, jednak nie gwarantuje
												nieprzerwanego dostępu.
											</li>
											<li>
												Operator nie ponosi odpowiedzialności za:
												<ul className='list-disc pl-6 ml-2 mt-1 space-y-1'>
													<li>przerwy techniczne,</li>
													<li>
														utratę danych wynikłą z awarii sprzętu lub
														oprogramowania,
													</li>
													<li>
														działanie osób trzecich, które mogą zakłócić
														działanie Serwisu.
													</li>
												</ul>
											</li>
											<li>
												Operator nie jest stroną kontaktów ani umów pomiędzy
												Użytkownikami.
											</li>
										</ol>
									</section>

									{/* §8 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§8. Świadczenie usług drogą elektroniczną
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Operator świadczy na rzecz Użytkowników usługi drogą
												elektroniczną, w tym:
												<ul className='list-disc pl-6 ml-2 mt-1 space-y-1'>
													<li>prowadzenie Konta,</li>
													<li>publikowanie i przeglądanie ogłoszeń,</li>
													<li>komunikację między Użytkownikami.</li>
												</ul>
											</li>
											<li>
												Umowa o świadczenie usług drogą elektroniczną zostaje
												zawarta w momencie akceptacji Regulaminu.
											</li>
											<li>
												Użytkownik może w każdej chwili rozwiązać umowę,
												usuwając Konto.
											</li>
											<li>
												Operator może rozwiązać umowę w przypadku naruszenia
												Regulaminu lub przepisów prawa.
											</li>
											<li>
												Korzystanie z Serwisu może wiązać się ze standardowym
												ryzykiem związanym z korzystaniem z sieci Internet.
											</li>
										</ol>
									</section>

									{/* §9 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§9. Ochrona danych osobowych
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Administratorem danych osobowych Użytkowników jest
												Zespół Projektowy Petlify.
											</li>
											<li>
												Dane osobowe przetwarzane są wyłącznie w celach:
												<ul className='list-disc pl-6 ml-2 mt-1 space-y-1'>
													<li>prowadzenia Konta,</li>
													<li>publikacji ogłoszeń,</li>
													<li>umożliwienia kontaktu między Użytkownikami,</li>
													<li>zapewnienia bezpieczeństwa Serwisu.</li>
												</ul>
											</li>
											<li>
												Podanie danych jest dobrowolne, ale niezbędne do
												korzystania z niektórych funkcji Serwisu.
											</li>
											<li>
												Użytkownik ma prawo dostępu do danych, ich sprostowania,
												usunięcia, ograniczenia przetwarzania oraz przenoszenia.
											</li>
										</ol>
									</section>

									{/* §10 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§10. Zgłaszanie naruszeń
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Każdy Użytkownik lub osoba trzecia może zgłosić
												Operatorowi treści naruszające prawo lub Regulamin.
											</li>
											<li>
												Zgłoszenia należy przesyłać na adres e-mail:{' '}
												<span className='font-mono'>
													petflify.team@gmail.com
												</span>{' '}
												z podaniem linku do ogłoszenia i opisu naruszenia.
											</li>
											<li>
												Operator po otrzymaniu zgłoszenia niezwłocznie podejmie
												działania zmierzające do usunięcia lub zablokowania
												spornych treści.
											</li>
											<li>
												Operator nie ponosi odpowiedzialności za treści
												użytkowników przed otrzymaniem zgłoszenia.
											</li>
										</ol>
									</section>

									{/* §11 */}
									<section>
										<h3 className='font-semibold mb-1'>§11. Prawa autorskie</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Wszelkie prawa do nazwy, logo, szaty graficznej, kodu
												źródłowego oraz układu Serwisu należą do Operatora.
											</li>
											<li>
												Zabrania się kopiowania, modyfikowania lub
												rozpowszechniania jakiejkolwiek części Serwisu bez zgody
												Operatora.
											</li>
										</ol>
									</section>

									{/* §12 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§12. Reklamy i finansowanie
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Serwis może być finansowany z reklam, darowizn lub
												dofinansowań.
											</li>
											<li>
												Reklamy, jeśli występują, będą oznaczone w sposób
												jednoznaczny i czytelny.
											</li>
										</ol>
									</section>

									{/* §13 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§13. Prawo właściwe i rozstrzyganie sporów
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Do niniejszego Regulaminu stosuje się prawo polskie.
											</li>
											<li>
												Użytkownik będący konsumentem może skorzystać z
												pozasądowych sposobów rozstrzygania sporów, w tym z
												platformy ODR dostępnej pod adresem:{' '}
												<a
													href='https://ec.europa.eu/consumers/odr'
													target='_blank'
													rel='noreferrer'
													className='text-cta underline'
												>
													https://ec.europa.eu/consumers/odr
												</a>
												.
											</li>
											<li>
												W sprawach nieuregulowanych stosuje się przepisy Kodeksu
												cywilnego oraz ustaw o ochronie konsumentów i o
												świadczeniu usług drogą elektroniczną.
											</li>
										</ol>
									</section>

									{/* §14 */}
									<section>
										<h3 className='font-semibold mb-1'>
											§14. Postanowienia końcowe
										</h3>
										<ol className='list-decimal pl-6 ml-2 space-y-1'>
											<li>
												Operator zastrzega sobie prawo do zmiany Regulaminu, o
												czym poinformuje Użytkowników z odpowiednim
												wyprzedzeniem.
											</li>
											<li>
												Wszelkie zmiany obowiązują od dnia ich opublikowania w
												Serwisie.
											</li>
											<li>
												Regulamin wchodzi w życie z dniem jego opublikowania.
											</li>
										</ol>
									</section>
								</div>
							}
							<p>
								Niniejszy regulamin określa zasady korzystania z serwisu
								PetLify.
							</p>
						</div>

						<div className='flex justify-end gap-3 mt-4'>
							<button
								type='button'
								onClick={() => setShowTermsModal(false)}
								className='px-4 py-2 rounded-xl bg-secondary text-text cursor-pointer'
							>
								Zamknij
							</button>
							<button
								type='button'
								onClick={() => {
									setAcceptTerms(true);
									setTermsError('');
									setShowTermsModal(false);
								}}
								className='px-4 py-2 rounded-xl bg-cta text-text font-semibold cursor-pointer'
							>
								Akceptuję regulamin
							</button>
						</div>
					</div>
				</div>
			)}

			{loading && (
				<div className='absolute w-full h-full top-1/2 left-1/2 -translate-1/2 flex items-center justify-center bg-main-transparent z-100'>
					<div className='w-10 h-10 border-4 border-accent border-t-cta rounded-full animate-spin'></div>
				</div>
			)}
		</form>
	);
};

export default AuthForm;
