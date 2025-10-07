// src/components/ui/PetInfo.jsx
import { useEffect, useState } from 'react';
import ImageCarousel from './ImageCarousel';
import useAuth from '../../hooks/useAuth';
import ChatModal from '../chat/ChatModal';
import { ensureThread, fetchMessages, sendMessageHttp } from '../../services/chatApi';
import { getSocket } from '../../lib/socket';

const PetInfo = ({ pet, setSelectedPet }) => {
  const loggedUser = useAuth();
  const me = loggedUser?.email;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);

  // gdy mamy już wątek – dołącz do pokoju i włącz live-update
  useEffect(() => {
    if (!thread) return;
    const socket = getSocket();
    socket.emit('chat:join', { threadId: thread.id });

    const onNew = (msg) => {
      if (msg.threadId !== thread.id) return;
      setMessages((prev) => [...prev, msg]);
    };
    socket.off('chat:newMessage', onNew);
    socket.on('chat:newMessage', onNew);

    return () => {
      socket.off('chat:newMessage', onNew);
    };
  }, [thread]);

  function openChatWindow() {
    // Nie tworzymy wątku tutaj – tylko otwieramy okno.
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
      // jeśli serwer zwraca istniejący wątek, pobierz dotychczasowe wiadomości
      try {
        const history = await fetchMessages(t.id);
        setMessages(history);
      } catch (_) {}
      // dołączenie do pokoju zrobi useEffect
    }

    const socket = getSocket();
    if (socket.connected) {
      socket.emit('chat:send', { threadId: t.id, text, attachments });
    } else {
      const msg = await sendMessageHttp(t.id, { text, attachments });
      setMessages((prev) => [...prev, msg]);
    }
  }

  const isOwner = me && me === pet?.owner;

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
            <h2 className="font-bold text-4xl">{pet?.pet_name}</h2>
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

        {/* Dane zwierzaka – przywrócona struktura i klasy */}
        <div className="flex flex-col py-8 border-b-2 border-accent gap-4">
          <div className="flex items-center gap-2">
            <p className="bold text-xl">Gatunek:</p>
            <p className="text-accent">{pet?.pet_species}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="bold text-xl">Rasa:</p>
            <p className="text-accent">{pet?.pet_breed}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="bold text-xl">Wiek:</p>
            <p className="text-accent">Ok. {pet?.pet_age}</p>
          </div>

          <div className="space-y-2 mt-6 border-t border-secondary pt-4">
            <p className="font-bold text-xl">Znaki szczególne:</p>
            <p className="text-accent">{pet?.description}</p>
          </div>

          <div className="space-y-2 mt-6 border-t border-secondary pt-4">
            <p className="font-bold text-xl">Ostatnio widziany:</p>
            <p className="text-accent">
              01.03.2022, ok 18:30 <br />
              {pet?.street}, {pet?.city}
            </p>
          </div>
        </div>

        <div className="border-b-2 border-accent pb-8">
          <div className="w-full h-[200px] flex justify-center items-center bg-secondary rounded-2xl mt-8">
            <p>Tutaj będzie mapa... SERIO!</p>
          </div>
        </div>

        <div className="flex flex-col py-8 space-y-2">
          <p className="font-bold text-xl mb-4">Kontakt do właściciela:</p>
          <p className="text-accent">{pet?.owner}</p>
          <p className="text-accent">Tel: {pet?.phone || 'Nie podano'}</p>
          {!isOwner && (
            <button
              className="bg-cta rounded-2xl py-1 px-3 ml-auto text-lg cursor-pointer"
              onClick={openChatWindow}
            >
              Chat
            </button>
          )}
        </div>
      </div>

      {isChatOpen && (
        <ChatModal
          isOpen={true}
          onClose={closeChatWindow}
          partnerName={pet?.owner}
          topicName={pet?.pet_name || 'Zwierzak'}
          currentUserId={me || 'me'}
          messages={messages.map((m) => ({
            id: m.id,
            senderId: m.sender_email || m.senderId,
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
