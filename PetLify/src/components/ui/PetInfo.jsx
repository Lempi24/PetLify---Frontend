import { useEffect, useState } from 'react';
import ImageCarousel from './ImageCarousel';
import useAuth from '../../hooks/useAuth';
import ChatModal from '../chat/ChatModal';

// NOWY czat – backend (Socket.IO + REST)
import {
  ensureThread,
  fetchMessages,
  sendMessageHttp,
} from '../../services/chatApi';
import { getSocket } from '../../lib/socket';


import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      className="border rounded px-2 py-1 text-accent"
    />
  ) : (
    <p className={`text-accent ${className}`}>{value}</p>
  );

const PetInfo = ({ pet: initialPet, setSelectedPet, mode = 'view' }) => {
  const navigate = useNavigate();

  //  POPRAWKA: useAuth zwraca { user }, więc trzeba go rozpakować
  const { user: authUser } = useAuth();
  const me = authUser?.email;

  // Dane zwierzaka (obsługa trybu edycji)
  const [pet, setPet] = useState(initialPet);
  const isOwner = me && me === initialPet?.owner;

  // --- CZAT (backend) ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);

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
    try {
      await axios.put(
        import.meta.env.VITE_BACKEND_URL + `/reports/edit-report`,
        pet,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Błąd zapisu: ', error);
    }
  };

  return (
    <div
      className="fixed backdrop-blur-2xl h-screen w-screen z-10000"
      onClick={() => setSelectedPet(null)}
    >
      <div
        className="fixed left-1/2 -translate-x-1/2 h-full w-full lg:w-1/2 bg-main overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <EditableField
              value={pet?.pet_name}
              onChange={(v) => setPet({ ...pet, pet_name: v })}
              mode={mode}
              className="text-4xl font-bold"
            />
            <span className="bg-negative p-2 rounded-2xl">Zaginiony</span>
            <button
              onClick={() => setSelectedPet(null)}
              className="absolute right-5 cursor-pointer"
              aria-label="Zamknij"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="fill-cta w-[30px]">
                <path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z" />
              </svg>
            </button>
          </div>

          <ImageCarousel images={pet?.photo_url} />
        </div>

        {/* Dane zwierzaka */}
        <div className="flex flex-col py-8 border-b-2 border-accent gap-4">
          <div className="flex items-center gap-2">
            <p className="bold text-xl">Gatunek:</p>
            <EditableField
              value={pet?.pet_species}
              onChange={(v) => setPet({ ...pet, pet_species: v })}
              mode={mode}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="bold text-xl">Rasa:</p>
            <EditableField
              value={pet?.pet_breed}
              onChange={(v) => setPet({ ...pet, pet_breed: v })}
              mode={mode}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="bold text-xl">Wiek:</p>
            <EditableField
              value={pet?.pet_age}
              onChange={(v) => setPet({ ...pet, pet_age: v })}
              mode={mode}
            />
          </div>

          <div className="space-y-2 mt-6 border-t border-secondary pt-4">
            <p className="font-bold text-xl">Znaki szczególne:</p>
            <EditableField
              value={pet?.description}
              onChange={(v) => setPet({ ...pet, description: v })}
              mode={mode}
            />
          </div>

          <div className="space-y-2 mt-6 border-t border-secondary pt-4">
            <p className="font-bold text-xl">Ostatnio widziany:</p>
            {mode === 'edit' ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={pet?.street ?? ''}
                  onChange={(e) => setPet({ ...pet, street: e.target.value })}
                  className="border rounded px-2 py-1 text-accent"
                  placeholder="Ulica"
                />
                <input
                  type="text"
                  value={pet?.city ?? ''}
                  onChange={(e) => setPet({ ...pet, city: e.target.value })}
                  className="border rounded px-2 py-1 text-accent"
                  placeholder="Miasto"
                />
              </div>
            ) : (
              <p className="text-accent">
                01.03.2022, ok 18:30 <br />
                {pet?.street}, {pet?.city}
              </p>
            )}
          </div>
        </div>

        {/* Mapa – placeholder */}
        <div className="border-b-2 border-accent pb-8">
          <div className="w-full h-[200px] flex justify-center items-center bg-secondary rounded-2xl mt-8">
            <p>Tutaj będzie mapa... SERIO!</p>
          </div>
        </div>

        {/* Kontakt + akcje */}
        <div className="flex flex-col py-8 space-y-2">
          <p className="font-bold text-xl mb-4">Kontakt do właściciela:</p>
          <p className={`text-accent`}>{pet?.owner}</p>
          <p className={`text-accent`}>{pet?.phone || 'Nie podano'}</p>

          {/* Chat tylko dla oglądającego (nie dla właściciela) w trybie 'view' */}
          {!isOwner && mode === 'view' && (
            <button
              className="bg-cta rounded-2xl py-1 px-3 ml-auto text-lg cursor-pointer"
              onClick={openChatWindow}
            >
              Chat
            </button>
          )}

          {/* Zapis tylko w trybie edycji */}
          {mode === 'edit' && (
            <button
              onClick={handleSave}
              className="bg-cta rounded-2xl py-1 px-3 ml-auto text-lg cursor-pointer"
            >
              Zapisz
            </button>
          )}
        </div>
      </div>

      {/* Modal czatu – backend */}
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
    </div>
  );
};

export default PetInfo;
