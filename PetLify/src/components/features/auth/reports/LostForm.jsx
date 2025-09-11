import FormInput from '../../../ui/FormInput';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';

const LostForm = () => {
	const navigate = useNavigate();
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
	const [preview, setPreview] = useState(null);
	const [selectedPosition, setSelectedPosition] = useState(null);

	const photoFile = watch('photo');

	useEffect(() => {
		if (photoFile && photoFile.length > 0) {
			const file = photoFile[0];
			const objectUrl = URL.createObjectURL(file);
			setPreview(objectUrl);

			return () => URL.revokeObjectURL(objectUrl);
		} else {
			setPreview(null);
		}
	}, [photoFile]);

	const onSubmit = async (data) => {
		console.log('onSubmit został wywołany!');
		const token = localStorage.getItem('token');
		console.log('Token:', token);

		console.log('Form data przed wysyłką:', data);

		try {
			setLoading(true);
			const formData = new FormData();

			for (const key in data) {
				if (key === 'photo' && data.photo?.length > 0) {
					formData.append('photo', data.photo[0]);
				} else {
					formData.append(key, data[key]);
				}
			}

			const response = await axios.post(
				import.meta.env.VITE_BACKEND_URL + '/main-page/create-lost-form',
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			console.log('Success:', response);
			toast.success('Zgłoszenie zostało wysłane');
			reset();
			navigate('/main-page');
		} catch (error) {
			toast.error('Wystąpił błąd przy wysyłaniu formularza');
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex justify-center items-start p-4 min-h-screen'>
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
							placeholder='Wpisz'
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
							placeholder='Wpisz'
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
							placeholder='Wpisz'
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
						<FormInput
							type='text'
							placeholder='Wpisz'
							{...register('petAge')}
							error={errors.petAge}
						/>
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
							Podaj datę zaginięcia
						</label>
						<FormInput
							type='date'
							placeholder='Data zaginięcia'
							{...register('lostDate', { required: 'Podaj datę zaginięcia' })}
							error={errors.lostDate}
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
							className='w-full p-2 rounded-md bg-secondary border border-cta'
							rows={4}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Zdjęcie zwierzęcia
						</label>

						<input
							type='file'
							id='photo-upload'
							{...register('photo', { required: 'Dodaj zdjęcie zwierzęcia' })}
							accept='image/*'
							className='hidden'
						/>

						<label
							htmlFor='photo-upload'
							className='inline-block bg-cta cursor-pointer py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-300 select-none'
						>
							Wybierz zdjęcie
						</label>

						{errors.photo && (
							<p className='text-negative text-sm mt-1'>
								{errors.photo.message}
							</p>
						)}
					</div>

					{preview && (
						<div className='mt-2'>
							<img
								src={preview}
								alt='Podgląd zdjęcia'
								style={{ width: 300, height: 300, objectFit: 'cover' }}
								className='rounded-md border border-cta'
							/>
						</div>
					)}

					<button
						type='submit'
						disabled={loading}
						style={{
							backgroundColor: loading
								? 'var(--color-positive)'
								: 'var(--color-cta)',
						}}
						className='w-full text-white py-2 px-4 rounded-md transition duration-300 hover:opacity-90'
					>
						{loading ? 'Wysyłanie...' : 'Zgłoś zaginięcie'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default LostForm;
