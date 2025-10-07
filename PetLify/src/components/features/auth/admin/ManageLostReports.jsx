import { useState, useEffect } from 'react';
import axios from 'axios';
import PetCard from "../../../ui/PetCard";
import PetInfo from "../../../ui/PetInfo";
import { useNavigate } from 'react-router-dom';
import AdminOptionsNav from '../../../ui/AdminOptionsNav';

const ManageLostReports = () => {
  const [lostPets, setLostPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const navigate = useNavigate();

  const petSpeciesTypes = [
    { value: 'dog', label: 'Pies' },
    { value: 'cat', label: 'Kot' },
    { value: 'bird', label: 'Ptak' },
    { value: 'rodent', label: 'Gryzoń' },
    { value: 'reptile', label: 'Gad' },
    { value: 'other', label: 'Inne' },
  ];

  const fetchLostPets = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + `/main-page/fetch-pets?type=lost`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const petsWithLabels = response.data.map((pet) => {
        if (pet.pet_species) {
          pet.pet_species =
            petSpeciesTypes.find((s) => s.value === pet.pet_species)?.label || pet.pet_species;
        }
        return pet;
      });

      setLostPets(petsWithLabels);
    } catch (error) {
      console.error('Błąd podczas pobierania zgubionych zwierząt:', error);
    }
  };

  useEffect(() => {
    fetchLostPets();
  }, []);

  const handleApprove = async (petId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + ``, // TODO: dodać endpoint do zatwierdzania raportów
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLostPets((prev) => prev.filter((pet) => pet.id !== petId));
    } catch (error) {
      console.error('Błąd podczas zatwierdzania raportu:', error);
    }
  };

  const handleReject = async (petId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + ``, // TODO: dodać endpoint do odrzucania raportów
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLostPets((prev) => prev.filter((pet) => pet.id !== petId));
    } catch (error) {
      console.error('Błąd podczas odrzucania raportu:', error);
    }
  };

  const handlePetClick = (pet) => {
    setSelectedPet(pet);
  };

  return (
    <>
      <AdminOptionsNav />
      <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 mb-6">
          Akceptuj lub odrzuć zgłoszenia zaginionych zwierząt
        </h1>
        <p className="text-md text-gray-600 mb-10">Tutaj możesz akceptować lub odrzucać zgłoszenia zaginionych zwierząt.</p>
      </div>
      
      {selectedPet && (
        <PetInfo 
          pet={selectedPet} 
          setSelectedPet={setSelectedPet} 
        />
      )}
      
      <div className="flex flex-col gap-4 w-full px-4 max-w-4xl mx-auto">
        {lostPets.map((pet) => (
          <div
            key={pet.id}
            className="flex items-center justify-between border p-4 rounded shadow"
          >
            <PetCard 
              pet={pet} 
              handlePetInfo={handlePetClick} 
            />
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(pet.id);
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Zatwierdź
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(pet.id);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Odrzuć
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ManageLostReports;