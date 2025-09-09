import FormInput from "../../../ui/FormInput";
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

const LostForm = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm({ mode: 'onChange' });

    const petSpeciesTypes = [
        { label: "Pies", value: "dog" },
        { label: "Kot", value: "cat" },
        { label: "Ptak", value: "bird"},
        { label: "Gryzoń", value: "rodent" },
        { label: "Gad", value: "reptile" },
        { label: "Inne", value: "others" }
    ];

    const petSizeTypes = [
        { label: "Mały", value: "small" },
        { label: "Średni", value: "medium" },
        { label: "Duży", value: "large" },
    ];

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
        try {
            setLoading(true);
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
            await axios.post(import.meta.env.VITE_BACKEND_URL + '/main-page/create-lost-form', formData);
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
        <div className="relative min-h-screen bg-[--color-main] text-[--color-text] px-4">
            <Link to='/main-page' className="absolute top-6 left-2 z-10 p-2">
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 640 640'
                    className='fill-cta w-6 h-6 hover:scale-110 transition-transform duration-300'
                >
                    <path d='M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z' />
                </svg>
            </Link>

            <div className="flex items-center justify-center min-h-screen">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    encType="multipart/form-data"
                    className="w-full max-w-xl bg-[--color-secondary] p-6 rounded-lg shadow-lg space-y-4"
                >
                    <h2 className="text-xl font-semibold mb-2 text-center text-[--color-accent]">Zgłoś zaginięcie zwierzęcia</h2>

                    <FormInput
                        type='text'
                        placeholder="Imię zwierzęcia"
                        {...register('petName', { required: 'To pole jest wymagane' })}
                        error={errors.petName}
                    />

                    <FormInput
                        type='select'
                        placeholder="Gatunek zwierzęcia"
                        options={petSpeciesTypes}
                        {...register('petSpecies', { required: 'To pole jest wymagane' })}
                        error={errors.petSpecies}
                    />

                    <FormInput
                        type='text'
                        placeholder="Rasa zwierzęcia"
                        {...register('petBreed')}
                        error={errors.petBreed}
                    />

                    <FormInput
                        type='text'
                        placeholder="Kolor zwierzęcia"
                        {...register('petColor', { required: 'Podaj kolor zwierzęcia' })}
                        error={errors.petColor}
                    />

                    <FormInput
                        type='select'
                        placeholder="Wielkość zwierzęcia"
                        options={petSizeTypes}
                        {...register('petSize', { required: 'Podaj wielkość zwierzęcia' })}
                        error={errors.petSize}
                    />

                    <FormInput
                        type="date"
                        placeholder="Data zaginięcia"
                        {...register('lostDate', { required: 'Podaj datę zaginięcia' })}
                        error={errors.lostDate}
                    />

                    <FormInput
                        placeholder="Lokalizacja zaginięcia"
                        {...register('lostLocation', { required: 'To pole jest wymagane' })}
                        error={errors.lostLocation}
                    />

                    <div>
                        <label className="block text-sm font-medium mb-1">Opis</label>
                        <textarea
                            {...register('description')}
                            className="w-full p-2 rounded-md bg-[--color-main] text-[--color-text] border border-[--color-gray]"
                            rows={4}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Zdjęcie zwierzęcia</label>

                        <input
                            type="file"
                            id="photo-upload"
                            {...register('photo', { required: 'Dodaj zdjęcie zwierzęcia' })}
                            accept="image/*"
                            className="hidden"
                        />

                        <label
                            htmlFor="photo-upload"
                            style={{
                                backgroundColor: 'var(--color-cta)'
                            }}
                            className="inline-block cursor-pointer text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-300 select-none"
                        >
                            Wybierz zdjęcie
                        </label>

                        {errors.photo && (
                            <p className="text-[--color-negative] text-sm mt-1">{errors.photo.message}</p>
                        )}
                    </div>

                    {preview && (
                        <div className="mt-2">
                            <img 
                                src={preview}
                                alt="Podgląd zdjęcia"
                                style={{ width: 300, height: 300, objectFit: 'cover' }}
                                className="rounded-md border border-[--color-gray]" 
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? 'var(--color-positive)' : 'var(--color-cta)'
                        }}
                        className="w-full text-white py-2 px-4 rounded-md transition duration-300 hover:opacity-90"
                    >
                        {loading ? 'Wysyłanie...' : 'Zgłoś zaginięcie'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default LostForm;
