import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

// Helper functions to get display labels
const getSpeciesLabel = (value) => {
    const species = petSpeciesTypes.find(s => s.value === value);
    return species ? species.label : 'Nieznany gatunek';
};

const getSizeLabel = (value) => {
    const size = petSizeTypes.find(s => s.value === value);
    return size ? size.label : 'Nieznany rozmiar';
};

const CreatePetProfile = ({ onClose, onSuccess, editPet = null }) => {
    const [formData, setFormData] = useState({
        petName: '',
        petAgeValue: '',
        petAgeUnit: 'months',
        petSize: '',
        petSpecies: '',
        petBreed: '',
        petColor: '',
    });
    const [photos, setPhotos] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editPet) {
            console.log('Editing pet data:', editPet); // Debug log
            
            let ageValue = '';
            let ageUnit = 'months';
            
            if (editPet.pet_age) {
                const ageMatch = editPet.pet_age.match(/(\d+)\s*(miesięcy|lat|months|years)/i);
                if (ageMatch) {
                    ageValue = ageMatch[1];
                    ageUnit = ageMatch[2].toLowerCase().includes('lat') || ageMatch[2].toLowerCase().includes('year') ? 'years' : 'months';
                }
            }
            
            // Używamy pet_species_type z backendu
            setFormData({
                petName: editPet.pet_name || '',
                petAgeValue: ageValue,
                petAgeUnit: ageUnit,
                petSize: editPet.pet_size || '',
                petSpecies: editPet.pet_species_type || editPet.pet_species || '', // Używamy pet_species_type
                petBreed: editPet.pet_breed || '',
                petColor: editPet.pet_color || '',
            });
            setExistingPhotos(editPet.photo_url || []);
        }
    }, [editPet]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + photos.length + existingPhotos.length > 5) {
            setErrors(prev => ({
                ...prev,
                photos: 'Można przesłać maksymalnie 5 zdjęć'
            }));
            return;
        }
        setPhotos(prev => [...prev, ...files]);
        // Clear photo error
        if (errors.photos) {
            setErrors(prev => ({
                ...prev,
                photos: ''
            }));
        }
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingPhoto = (index) => {
        setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.petName.trim()) {
            newErrors.petName = 'Imię zwierzaka jest wymagane';
        }

        if (formData.petAgeValue && formData.petAgeUnit === 'months' && formData.petAgeValue > 11) {
            newErrors.petAge = 'Maksymalnie 11 miesięcy';
        }

        if (!formData.petSize) {
            newErrors.petSize = 'Wielkość jest wymagana';
        }

        if (!formData.petSpecies) {
            newErrors.petSpecies = 'Gatunek jest wymagany';
        }

        if (!formData.petColor.trim()) {
            newErrors.petColor = 'Kolor jest wymagany';
        }

        if (photos.length + existingPhotos.length === 0) {
            newErrors.photos = 'Przynajmniej jedno zdjęcie jest wymagane';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const token = localStorage.getItem('token');
            const submitData = new FormData();
            
            const ageString = formData.petAgeValue ? 
                `${formData.petAgeValue} ${formData.petAgeUnit === 'months' ? 'miesięcy' : 'lat'}` : 
                '';
            
            submitData.append('petName', formData.petName);
            submitData.append('petAge', ageString);
            submitData.append('petSize', formData.petSize);
            submitData.append('petSpecies', formData.petSpecies); // Wysyłamy jako petSpecies
            submitData.append('petBreed', formData.petBreed);
            submitData.append('petColor', formData.petColor);

            photos.forEach(photo => {
                submitData.append('photos', photo);
            });

            existingPhotos.forEach(photoUrl => {
                submitData.append('existingPhotos', photoUrl);
            });

            if (editPet) {
                submitData.append('petId', editPet.id);
                
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/settings/updatePetProfile`,
                    submitData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                toast.success('Profil zwierzęcia został zaktualizowany');
            } else {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/settings/createPetProfile`,
                    submitData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                toast.success('Profil zwierzęcia został utworzony');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Błąd operacji profilu:', error);
            
            // Handle specific field errors from backend
            if (error.response?.data?.message) {
                const backendError = error.response.data.message;
                
                // Map backend errors to specific fields
                if (backendError.includes('zdjęć')) {
                    setErrors({ photos: backendError });
                } else if (backendError.includes('Limit')) {
                    setErrors({ general: backendError });
                } else {
                    setErrors({ general: backendError });
                }
            } else {
                setErrors({ 
                    general: `Nie udało się ${editPet ? 'zaktualizować' : 'utworzyć'} profilu` 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed backdrop-blur-2xl h-screen w-screen z-10000 top-0 left-0 flex items-center justify-center">
            <div
                className="bg-main rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text">
                        {editPet ? 'Edytuj profil zwierzęcia' : 'Dodaj nowy profil zwierzęcia'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-cta cursor-pointer text-2xl hover:opacity-80 transition-opacity"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Error */}
                    {errors.general && (
                        <div className="bg-negative bg-opacity-20 border border-negative rounded-lg p-3">
                            <p className="text-negative text-sm">{errors.general}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-lg font-semibold mb-3 text-text">Zdjęcia* (max 5)</label>
                        <div className="flex flex-wrap gap-3 mb-3">
                            {existingPhotos.map((photoUrl, index) => (
                                <div key={`existing-${index}`} className="relative">
                                    <img
                                        src={photoUrl}
                                        alt={`Preview ${index}`}
                                        className="w-20 h-20 object-cover rounded-lg border-2 border-cta"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingPhoto(index)}
                                        className="absolute -top-2 -right-2 bg-negative text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-negative-dark transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            
                            {photos.map((photo, index) => (
                                <div key={`new-${index}`} className="relative">
                                    <img
                                        src={URL.createObjectURL(photo)}
                                        alt={`Preview ${index}`}
                                        className="w-20 h-20 object-cover rounded-lg border-2 border-cta"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute -top-2 -right-2 bg-negative text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-negative-dark transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            
                            {photos.length + existingPhotos.length < 5 && (
                                <label className="w-20 h-20 border-2 border-dashed border-cta rounded-lg flex items-center justify-center cursor-pointer hover:bg-cta hover:bg-opacity-10 transition-colors group">
                                    <span className="text-cta text-2xl group-hover:scale-110 transition-transform">+</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        {errors.photos && (
                            <p className="text-negative text-sm mt-1">{errors.photos}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-text">Imię zwierzaka*</label>
                            <input
                                type="text"
                                value={formData.petName}
                                onChange={(e) => handleInputChange('petName', e.target.value)}
                                className={`w-full px-3 py-3 rounded-md bg-secondary border-2 text-text placeholder:text-gray ${
                                    errors.petName ? 'border-negative' : 'border-cta'
                                }`}
                                placeholder="Wprowadź imię zwierzaka"
                            />
                            {errors.petName && (
                                <p className="text-negative text-sm mt-1">{errors.petName}</p>
                            )}
                        </div>

                        <div>
                            <label className='block text-sm font-medium mb-2 text-text'>
                                Podaj wiek zwierzęcia
                            </label>
                            <div className='flex gap-0 rounded-md overflow-hidden'>
                                <div className='flex-1'>
                                    <input
                                        type='number'
                                        placeholder='Np. 5'
                                        value={formData.petAgeValue}
                                        onChange={(e) => handleInputChange('petAgeValue', e.target.value)}
                                        min="0"
                                        max={formData.petAgeUnit === 'months' ? '11' : ''}
                                        className={`w-full px-3 py-3 border-2 rounded-l-md bg-secondary text-text placeholder:text-gray ${
                                            errors.petAge ? 'border-negative' : 'border-cta'
                                        }`}
                                    />
                                </div>
                                <select
                                    value={formData.petAgeUnit}
                                    onChange={(e) => handleInputChange('petAgeUnit', e.target.value)}
                                    className={`w-32 px-3 py-3 border-2 border-l-0 rounded-r-md bg-secondary text-text ${
                                        errors.petAge ? 'border-negative' : 'border-cta'
                                    }`}
                                >
                                    <option value='months'>miesięcy</option>
                                    <option value='years'>lat</option>
                                </select>
                            </div>
                            {errors.petAge && (
                                <p className='text-negative text-sm mt-1'>{errors.petAge}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-text">Wielkość*</label>
                            <select
                                value={formData.petSize}
                                onChange={(e) => handleInputChange('petSize', e.target.value)}
                                className={`w-full px-3 py-3 rounded-md bg-secondary border-2 text-text ${
                                    errors.petSize ? 'border-negative' : 'border-cta'
                                }`}
                            >
                                <option value="" className="text-gray">Wybierz wielkość</option>
                                {petSizeTypes.map((size) => (
                                    <option key={size.value} value={size.value} className="text-text">
                                        {size.label}
                                    </option>
                                ))}
                            </select>
                            {errors.petSize && (
                                <p className="text-negative text-sm mt-1">{errors.petSize}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-text">Gatunek*</label>
                            <select
                                value={formData.petSpecies}
                                onChange={(e) => handleInputChange('petSpecies', e.target.value)}
                                className={`w-full px-3 py-3 rounded-md bg-secondary border-2 text-text ${
                                    errors.petSpecies ? 'border-negative' : 'border-cta'
                                }`}
                            >
                                <option value="" className="text-gray">Wybierz gatunek</option>
                                {petSpeciesTypes.map((species) => (
                                    <option key={species.value} value={species.value} className="text-text">
                                        {species.label}
                                    </option>
                                ))}
                            </select>
                            {errors.petSpecies && (
                                <p className="text-negative text-sm mt-1">{errors.petSpecies}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-text">Rasa</label>
                            <input
                                type="text"
                                value={formData.petBreed}
                                onChange={(e) => handleInputChange('petBreed', e.target.value)}
                                className="w-full px-3 py-3 rounded-md bg-secondary border-2 border-cta text-text placeholder:text-gray"
                                placeholder="Wprowadź rasę"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-text">Kolor*</label>
                            <input
                                type="text"
                                value={formData.petColor}
                                onChange={(e) => handleInputChange('petColor', e.target.value)}
                                className={`w-full px-3 py-3 rounded-md bg-secondary border-2 text-text placeholder:text-gray ${
                                    errors.petColor ? 'border-negative' : 'border-cta'
                                }`}
                                placeholder="Wprowadź kolor"
                            />
                            {errors.petColor && (
                                <p className="text-negative text-sm mt-1">{errors.petColor}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border-2 border-gray-300 rounded-lg cursor-pointer text-text hover:bg-secondary transition-colors"
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (formData.petAgeUnit === 'months' && formData.petAgeValue > 11)}
                            className="bg-cta text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-cta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading 
                                ? (editPet ? 'Aktualizowanie...' : 'Tworzenie...') 
                                : (editPet ? 'Zaktualizuj profil' : 'Utwórz profil')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PetProfiles = () => {
    const [petProfiles, setPetProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreatePetProfile, setShowCreatePetProfile] = useState(false);
    const [petToDelete, setPetToDelete] = useState(null);
    const [petToEdit, setPetToEdit] = useState(null);

    const fetchPetProfiles = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/settings/fetchPetProfiles`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            console.log('Pobrane profile zwierząt:', response.data);
            setPetProfiles(response.data);
        } catch (error) {
            console.error('Błąd pobierania profili zwierząt:', error);
            if (error.response?.status === 404) {
                setPetProfiles([]);
            } else {
                toast.error('Nie udało się pobrać profili zwierząt');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePetProfile = async (petId, petName) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/settings/deletePetProfile`,
                {
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    },
                    data: { petId }
                }
            );
            toast.success(`Profil ${petName} został usunięty`);
            fetchPetProfiles();
            setPetToDelete(null);
        } catch (error) {
            console.error('Błąd usuwania profilu:', error);
            toast.error('Nie udało się usunąć profilu');
        }
    };

    const handleEditPetProfile = (pet) => {
        setPetToEdit(pet);
    };

    const cancelEdit = () => {
        setPetToEdit(null);
    };

    const confirmDelete = (pet) => {
        setPetToDelete(pet);
    };

    const cancelDelete = () => {
        setPetToDelete(null);
    };

    useEffect(() => {
        fetchPetProfiles();
    }, []);

    const renderPetProfiles = () => {
        if (loading) {
            return <p className="text-accent">Ładowanie profili...</p>;
        }

        return (
            <div className="space-y-3">
                {petProfiles.map((pet) => (
                    <div
                        key={pet.id}
                        className="bg-main flex items-center rounded-xl w-full py-3 px-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-main-dark transition-colors border border-secondary"
                    >
                        {pet.photo_url && pet.photo_url.length > 0 && (
                            <img
                                src={pet.photo_url[0]}
                                alt={pet.pet_name}
                                className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-cta"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-text">{pet.pet_name}</h3>
                            <p className="text-sm text-accent">
                                {getSpeciesLabel(pet.pet_species_type || pet.pet_species)} • {getSizeLabel(pet.pet_size)} • {pet.pet_age || 'Nieznany wiek'}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                className="bg-cta text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-cta-dark transition-colors text-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditPetProfile(pet);
                                }}
                            >
                                Edytuj
                            </button>
                            <button
                                className="bg-negative text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-negative-dark transition-colors text-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(pet);
                                }}
                            >
                                Usuń
                            </button>
                        </div>
                    </div>
                ))}
                
                {petProfiles.length <= 2 && (
                    <button
                        className="bg-transparent border-2 border-dashed border-cta flex items-center justify-center rounded-xl w-full py-4 px-3 cursor-pointer transition-colors group"
                        onClick={() => setShowCreatePetProfile(true)}
                    >
                        <div className="flex items-center justify-center">
                            <span className="text-cta text-2xl font-bold mr-2 transition-transform">+</span>
                            <span className="text-cta font-semibold">Dodaj nowy profil zwierzęcia</span>
                        </div>
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <p className="text-cta font-semibold">Profil zwierzaka</p>
            {renderPetProfiles()}
            
            {showCreatePetProfile && (
                <CreatePetProfile
                    onClose={() => setShowCreatePetProfile(false)}
                    onSuccess={() => {
                        fetchPetProfiles();
                        setShowCreatePetProfile(false);
                    }}
                />
            )}

            {petToEdit && (
                <CreatePetProfile
                    editPet={petToEdit}
                    onClose={cancelEdit}
                    onSuccess={() => {
                        fetchPetProfiles();
                        cancelEdit();
                    }}
                />
            )}

            {petToDelete && (
                <div className="fixed inset-0 backdrop-blur-2xl flex items-center justify-center z-10000">
                    <div className="bg-main p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-md mx-4 border-2 border-cta">
                        <p className='text-lg font-bold text-negative text-center'>
                            Czy na pewno chcesz usunąć profil {petToDelete.pet_name}?
                        </p>
                        <p className='text-sm text-center text-accent'>
                            Profil zwierzęcia zostanie trwale usunięty.
                        </p>
                        <div className='flex gap-4'>
                            <button
                                onClick={() => handleDeletePetProfile(petToDelete.id, petToDelete.pet_name)}
                                className='bg-negative text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-negative-dark transition-colors'
                            >
                                Tak, usuń profil
                            </button>
                            <button
                                onClick={cancelDelete}
                                className='px-6 py-2 rounded-lg text-text border-2 border-gray-300 hover:bg-secondary transition-colors'
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { PetProfiles, CreatePetProfile };
export default PetProfiles;