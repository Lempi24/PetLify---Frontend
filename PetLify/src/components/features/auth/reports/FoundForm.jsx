import FormInput from '../../../ui/FormInput';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const FoundForm = () => {
	const MAX_PHOTOS = 5
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

    const autocompleteRef = useRef(null);

    const onChosenPlace = () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.formatted_address) {
            setValue('foundPlace', place.formatted_address, {
            shouldValidate: true,
            shouldDirty: true,
            });
			if(place.geometry && place.geometry.location){
				const lat = place.geometry.location.lat();
				const lng = place.geometry.location.lng();

				setValue('latitude', lat);
				setValue('longitude', lng);

				setSelectedPosition({ lat, lng });
			}
        }
    };

	const [loading, setLoading] = useState(false);
	const [previews, setPreviews] = useState([]);
	const [setSelectedPosition] = useState(null);

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

	const onSubmit = async (data) => {
		console.log('onSubmit został wywołany!');
		const token = localStorage.getItem('token');
		console.log('Token:', token);

		const foundPlace = data.foundPlace || '';
		const foundPlaceSplit = foundPlace.split(',');
		data.foundStreet = foundPlaceSplit[0]?.trim() || '';
		data.foundCity = foundPlaceSplit[1]?.trim().replace(/^\d{2}-\d{3}\s*/, '') || '';

		const latitude = data.latitude || '';
		const longitude = data.longitude || '';
		data.foundCoordinates = longitude && latitude ? `${longitude},${latitude}` : '';

		console.log('Form data przed wysyłką:', data);

		try {
			setLoading(true);
			const formData = new FormData();

			for (const key in data) {
				if (key === 'photos' && data.photos?.length > 0) {
					Array.from(data.photos).forEach((file) => {
						formData.append('photos', file);
					});
				} else {
					formData.append(key, data[key]);
				}
			}

			const response = await axios.post(
				import.meta.env.VITE_BACKEND_URL + '/main-page/create-found-form',
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
						Zgłoś odnalezienie
					</h2>
				</div>

				<form
					onSubmit={handleSubmit(onSubmit)}
					encType='multipart/form-data'
					className='w-full p-6 rounded-lg space-y-4'
				>
					<div>
						<label className='block text-sm font-medium mb-1'>
							Podaj imię zwierzęcia (jeśli znane)
						</label>
						<FormInput
							type='text'
							placeholder='Np. Reksio, Mruczek'
							{...register('petName')}
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
							Podaj rasę zwierzęcia (jeśli znana)
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
						<FormInput
							type='text'
							placeholder='Np. 5 miesięcy, 3 lata'
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
							Podaj datę odnalezienia
						</label>
						<FormInput
							type='date'
							placeholder='Data odnalezienia'
							{...register('foundDate', { required: 'Podaj datę odnalezienia' })}
							error={errors.foundDate}
						/>
					</div>

                    <div>
                        <LoadScript
							googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
							libraries={['places']}
						>
							<label className='block text-sm font-medium mb-1'>
								Podaj miejsce odnalezienia
							</label>
							<Autocomplete
								options={{
									types:['address'],
									componentRestrictions: { country: 'pl'},
								}}
								onLoad={(autocomplete) => {
									autocompleteRef.current = autocomplete;
								}}
								onPlaceChanged={onChosenPlace}
							>
								<input
									type='text'
									placeholder='Wpisz adres...'
									className='w-full p-2 rounded-md bg-secondary border border-cta'
									name='foundPlace'
								/>
							</Autocomplete>
						</LoadScript>
						<input type="hidden" {...register('latitude')} />
						<input type="hidden" {...register('longitude')} />
					</div>

					<div>
						<label className='block text-sm font-medium mb-1'>
							Opis
						</label>
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
						{loading ? 'Wysyłanie...' : 'Zgłoś odnalezienie'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default FoundForm;