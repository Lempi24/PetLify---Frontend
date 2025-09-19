import FormInput from '../../../ui/FormInput';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

const FoundForm = () => {
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
        }
    };

	const [loading, setLoading] = useState(false);
	const [preview, setPreview] = useState(null);

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
                                Podaj miejsce zaginięcia
                            </label>
                            <Autocomplete
                                onLoad={(autocomplete) => {
                                autocompleteRef.current = autocomplete;
                                }}
                                onPlaceChanged={onChosenPlace}
                            >
                                <input
                                    type='text'
                                    placeholder='Wpisz adres...'
                                    className='w-full p-2 rounded-md bg-secondary border border-cta'
                                    onChange={(e) => setValue('foundPlace', e.target.value)}
                                    name='foundPlace'
                                />
                            </Autocomplete>
                        </LoadScript>
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
						{loading ? 'Wysyłanie...' : 'Zgłoś odnalezienie'}
					</button>
				</form>
			</div>
		</div>
	);
};

export default FoundForm;