import FormInput from '../../../ui/FormInput';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';
import ReCAPTCHA from 'react-google-recaptcha';
const LostForm = () => {
	const MAX_PHOTOS = 5;
	const navigate = useNavigate();
	const recaptchaRef = useRef(null);
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm({ mode: 'onChange' });

	const petSpeciesTypes = [
		{ label: 'Pies', value: 'dog' },
		{ label: 'Kot', value: 'cat' },
		{ label: 'Ptak', value: 'bird' },
		{ label: 'Gryzoń', value: 'rodent' },
		{ label: 'Gad', value: 'reptile' },
		{ label: 'Inne', value: 'others' },
	];

	const petSizeTypes = [
		{ label: 'Mały', value: 'small' },
		{ label: 'Średni', value: 'medium' },
		{ label: 'Duży', value: 'large' },
	];

	const basePin = {
		latitude: 52.4057,
		longitude: 16.9313,
	};

	const [loading, setLoading] = useState(false);
	const [previews, setPreviews] = useState([]);
	const [selectedPosition, setSelectedPosition] = useState(null);

	const photoFiles = watch('photos');

	useEffect(() => {
		if (photoFiles && photoFiles.length > 0) {
			const objectUrls = Array.from(photoFiles).map((file) =>
				URL.createObjectURL(file)
			);
			setPreviews(objectUrls);

			return () => {
				objectUrls.forEach((url) => URL.revokeObjectURL(url));
			};
		} else {
			setPreviews([]);
		}
	}, [photoFiles]);

	const removePhoto = (indexToRemove) => {
		const updatedFiles = Array.from(photoFiles).filter(
			(_, index) => index !== indexToRemove
		);

		const dataTransfer = new DataTransfer();
		updatedFiles.forEach((file) => dataTransfer.items.add(file));

		setValue('photos', dataTransfer.files, { shouldValidate: true });
	};

	const handleFileChange = (event) => {
		const currentFiles = photoFiles ? Array.from(photoFiles) : [];
		const newFiles = Array.from(event.target.files);

		if (currentFiles.length + newFiles.length > MAX_PHOTOS) {
			toast.error(`Możesz dodać maksymalnie ${MAX_PHOTOS} zdjęć.`);
			event.target.value = '';
			return;
		}

		const combinedFiles = [...currentFiles, ...newFiles];

		const dataTransfer = new DataTransfer();
		combinedFiles.forEach((file) => dataTransfer.items.add(file));

		setValue('photos', dataTransfer.files, { shouldValidate: true });
	};

	const validateAge = (value, unit) => {
		if (!value) return false; 

		const num = Number(value);

		if (!Number.isInteger(num)) {
			return 'Wiek musi być liczbą całkowitą';
		}

		if (num < 0) {
			return 'Wiek nie może być ujemny';
		}

		if (unit === 'months' && num > 11) {
			return 'Maksymalnie 11 miesięcy';
		}

		return true;
	};

	const onSubmit = async (data) => {
		const recaptchaValue = recaptchaRef.current?.getValue();
		if (!recaptchaValue) {
			toast.error('Proszę potwierdzić, że nie jesteś robotem.');
			return;
		}
		console.log('onSubmit został wywołany!');
		const token = localStorage.getItem('token');
		console.log('Token:', token);

		if (data.petAgeValue && data.petAgeUnit) {
			const unitText = data.petAgeUnit === 'months' ? 'miesięcy' : 'lat';
			data.petAge = `${data.petAgeValue} ${unitText}`;
		}

		console.log('Form data przed wysyłką:', data);

		try {
			setLoading(true);
			const formData = new FormData();
			formData.append('recaptchaToken', recaptchaValue);
			for (const key in data) {
				if (key === 'photos' && data.photos?.length > 0) {
					Array.from(data.photos).forEach((file) => {
						formData.append('photos', file);
					});
				} else if (key != 'petAgeValue' && key != 'petAgeUnit') {
					formData.append(key, data[key]);
				}
			}

			const response = await axios.post(
				import.meta.env.VITE_BACKEND_URL + '/reports/create-lost-form',
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			console.log('Success:', response);
			toast.success('Zgłoszenie zostało wysłane');
			recaptchaRef.current?.reset();
			reset();
			navigate('/main-page');
		} catch (error) {
			toast.error('Wystąpił błąd przy wysyłaniu formularza');
			recaptchaRef.current?.reset();
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const validateDate = (dateString) => {
		if (!dateString) return true;

		const selectedDate = new Date(dateString);
		const today = new Date();
		const minDate = new Date();
		minDate.setDate(today.getDate() - 30);

		selectedDate.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);
		minDate.setHours(0, 0, 0, 0);

		if (selectedDate > today) {
			return 'Data nie może być z przyszłości';
		}

		if (selectedDate < minDate) {
			return 'Data nie może być starsza niż 30 dni';
		}

		return true;
	};

	const getMinDate = () => {
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - 30);
		return minDate.toISOString().split('T')[0];
	};

	const getMaxDate = () => {
		const maxDate = new Date();
		return maxDate.toISOString().split('T')[0];
	};

	return (
		<div className='flex justify-center items-start p-4 min-h-screen lg:w-1/2'>
			<div className='w-full max-w-xl space-y-4'>
				<div className='relative flex justify-center items-center mb-4 p-2g'>
					<div className='absolute left-0'>
						<Link to='/main-page'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 640 640'
								className='fill-cta w-6 h-6 hover:scale-110 transition-transform duration-300'
							>
								<path d='M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z' />
							</svg>
						</Link>
					</div>
					<h2 className='text-xl font-semibold text-center'>
						Zgłoś zaginięcie
					</h2>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					encType='multipart/form-data'
					className='w-full p-6 rounded-lg space-y-4'
				>
					<div>
						<label className='block text-sm font-medium mb-1'>
							Podaj imię zwierzęcia
						</label>
						<FormInput
							type='text'
							placeholder='Np. Reksio, Mruczek'
							{...register('petName', { required: 'To pole jest wymagane' })}
							error={errors.petName}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Podaj gatunek zwierzęcia
						</label>
						<FormInput
							type='select'
							placeholder='Gatunek zwierzęcia'
							options={petSpeciesTypes}
							{...register('petSpecies', {
								required: 'To pole jest wymagane',
							})}
							error={errors.petSpecies}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Podaj rasę zwierzęcia
						</label>
						<FormInput
							type='text'
							placeholder='Np. Labrador, Maine Coon'
							{...register('petBreed')}
							error={errors.petBreed}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Podaj kolor zwierzęcia
						</label>
						<FormInput
							type='text'
							placeholder='Np. Czarny, Szaro-biały'
							{...register('petColor', {
								required: 'Podaj kolor zwierzęcia',
							})}
							error={errors.petColor}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Podaj wiek zwierzęcia
						</label>
						<div className='flex gap-0 rounded-md overflow-hidden'>
							<div className='flex-1'>
								<FormInput
									type='number'
									placeholder='Np. 5'
									{...register('petAgeValue', {
										min: { value: 1, message: 'Wiek nie może być ujemny bądź zerowy' },
										validate: (value) => validateAge(value, watch('petAgeUnit')),
									})}
									error={errors.petAgeValue}
									className='rounded-r-none border-r-0'
								/>
							</div>
							<select
								{...register('petAgeUnit')}
								className='w-32 px-3 py-3 border-2 border-cta border-l-0 rounded-r-md bg-secondary text-text'
							>
								<option value='months'>miesięcy</option>
								<option value='years'>lat</option>
							</select>
						</div>
						{errors.petAgeValue && (
							<p className='text-negative text-xs mt-1'>
								{errors.petAgeValue.message}
							</p>
						)}
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Podaj wielkość zwierzęcia
						</label>
						<FormInput
							type='select'
							placeholder='Wielkość zwierzęcia'
							options={petSizeTypes}
							{...register('petSize', {
								required: 'Podaj wielkość zwierzęcia',
							})}
							error={errors.petSize}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Podaj datę zaginięcia (do 30 dni wstecz)
						</label>
						<FormInput
							type='date'
							placeholder='Data zaginięcia'
							{...register('lostDate', {
								required: 'Podaj datę zaginięcia',
								validate: validateDate,
							})}
							error={errors.lostDate}
							min={getMinDate()}
							max={getMaxDate()}
						/>
					</div>

					<div className='mt-4'>
						<label className='block text-sm font-medium mb-2'>
							Zaznacz na mapie lokalizację zaginięcia
						</label>
						<LoadScript
							googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
						>
							<GoogleMap
								mapContainerStyle={{ width: '100%', height: '300px' }}
								center={
									selectedPosition || {
										lat: basePin.latitude,
										lng: basePin.longitude,
									}
								}
								zoom={13}
								onClick={async (event) => {
									const lat = event.latLng.lat();
									const lng = event.latLng.lng();

									setSelectedPosition({ lat, lng });

									try {
										const res = await axios.get(
											`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
												import.meta.env.VITE_GOOGLE_MAPS_API_KEY
											}`
										);

										console.log(res.data.results);

										if (res.data.status === 'OK') {
											const components = res.data.results[0].address_components;

											let street = '';
											let city = '';

											components.forEach((c) => {
												if (c.types.includes('route')) {
													street = c.long_name;
												}
												if (c.types.includes('locality')) {
													city = c.long_name;
												}
											});

											setValue('lostStreet', street, { shouldValidate: true });
											setValue('lostCity', city, { shouldValidate: true });

											const coordinates = `${lng},${lat}`;
											setValue('lostCoordinates', coordinates, {
												shouldValidate: true,
											});

											toast.success('Lokalizacja została ustawiona');
										} else {
											toast.error('Nie udało się pobrać adresu');
										}
									} catch (err) {
										console.error(err);
										toast.error('Błąd przy pobieraniu adresu');
									}
								}}
								options={{
									mapTypeControl: false,
									streetViewControl: false,
								}}
							>
								{selectedPosition && (
									<>
										<Marker
											position={selectedPosition}
											icon={{
												url:
													'data:image/svg+xml;charset=UTF-8,' +
													encodeURIComponent(`
														<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#fe7f00">
															<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
														</svg>
													`),
												scaledSize: new window.google.maps.Size(40, 40),
											}}
										/>
										<Circle
											center={selectedPosition}
											radius={250}
											options={{
												fillColor: '#fe7f00',
												fillOpacity: 0.1,
												strokeColor: '#fe7f00',
												strokeOpacity: 0.4,
												strokeWeight: 2,
												clickable: false,
												draggable: false,
												editable: false,
												visible: true,
												zIndex: 1,
											}}
										/>
									</>
								)}
							</GoogleMap>
						</LoadScript>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>Opis</label>
						<textarea
							{...register('description')}
							placeholder='Opisz dokładnie zwierzę, jego cechy charakterystyczne, ewentualną obrożę, numer chipa, typowe zachowania...'
							className='w-full p-2 rounded-md bg-secondary border border-cta'
							rows={4}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Zdjęcie zwierzęcia (min. 1, max. {MAX_PHOTOS})
						</label>

						<input
							type='file'
							id='photo-upload'
							{...register('photos', {
								validate: {
									required: (files) =>
										files.length > 0 || 'Dodaj przynajmniej jedno zdjęcie.',
									maxAmount: (files) =>
										files.length <= MAX_PHOTOS ||
										`Możesz dodać maksymalnie ${MAX_PHOTOS} zdjęć.`,
								},
							})}
							accept='image/*'
							multiple
							className='hidden'
							onChange={handleFileChange}
						/>

						<label
							htmlFor='photo-upload'
							className='inline-block bg-cta cursor-pointer py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-300 select-none'
						>
							Wybierz zdjęcie
						</label>

						{errors.photos && (
							<p className='text-negative text-sm mt-1'>
								{errors.photos.message}
							</p>
						)}
					</div>

					{previews.length > 0 && (
						<div className='mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4'>
							{previews.map((src, index) => (
								<div key={index} className='relative group'>
									<img
										src={src}
										alt={`Podgląd zdjęcia ${index + 1}`}
										className='w-full h-24 object-cover rounded-md border border-cta'
									/>
									<button
										type='button'
										onClick={() => removePhoto(index)}
										className='absolute top-1 right-1 bg-negative text-white rounded-full w-6 h-6 flex items-center justify-center text-sm cursor-pointer'
										aria-label='Usuń zdjęcie'
									>
										X
									</button>
								</div>
							))}
						</div>
					)}
					<ReCAPTCHA
						sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
						ref={recaptchaRef}
					/>
					<button
						type='submit'
						disabled={loading}
						style={{
							backgroundColor: loading
								? 'var(--color-positive)'
								: 'var(--color-cta)',
						}}
						className='w-full text-white py-2 px-4 rounded-md transition duration-300 hover:opacity-90 cursor-pointer'
					>
						{loading ? 'Wysyłanie...' : 'Zgłoś zaginięcie'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default LostForm;
