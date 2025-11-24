import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SubPagesNav from '../components/ui/SubPagesNav';
import BurgerMenu from '../components/ui/BurgerMenu';
import ChatModal from '../components/chat/ChatModal';
import useAuth from '../hooks/useAuth';
import {
  fetchThreads,
  fetchMessages,
  sendMessageHttp,
  deleteThread,
} from '../services/chatApi';
import { getSocket } from '../lib/socket';
import ChatSkeleton from '../components/skeletons/ChatSkeleton';

function PersonSVG() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[32px] h-[32px]">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8H4z" fill="currentColor" />
    </svg>
  );
}

export default function ChatsPage() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [loading, setLoading] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [threads, setThreads] = useState([]);
  const [openThread, setOpenThread] = useState(null);
  const [messages, setMessages] = useState([]);

  const { user: authUser } = useAuth();
  const currentUserId = authUser?.email
    ? authUser.email.toLowerCase()
    : '';

  useEffect(() => {
    setLoading(true);
    fetchThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // nasłuchiwanie chat:notify (lista wątków)
  useEffect(() => {
    const socket = getSocket();

    socket.on('chat:notify', ({ threadId, preview, deleted }) => {
      if (deleted) {
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
        if (openThread?.id === threadId) {
          setOpenThread(null);
          setMessages([]);
        }
        return;
      }
      setThreads((prev) => {
        const next = [...prev];
        const i = next.findIndex((t) => t.id === threadId);
        if (i >= 0 && preview) {
          next[i] = {
            ...next[i],
            last_message:
              preview.text || preview.attachments?.[0]?.name || 'Załącznik',
            last_time: preview.createdAt,
          };
        }
        return next.sort(
          (a, b) =>
            new Date(b.last_time || b.created_at) -
            new Date(a.last_time || a.created_at)
        );
      });
    });

    return () => {
      socket.off('chat:notify');
    };
  }, [openThread?.id]);

  async function handleOpenThread(thread) {
    setOpenThread(thread);
    setMessages(await fetchMessages(thread.id));

    const socket = getSocket();
    socket.emit('chat:join', { threadId: thread.id });

    socket.off('chat:newMessage');
    socket.on('chat:newMessage', (msg) => {
      if (msg.threadId !== thread.id) return;
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          sender_email: (msg.senderEmail || msg.sender_email || '').toLowerCase(),
          text: msg.text,
          attachments: msg.attachments,
          created_at: msg.createdAt,
        },
      ]);
    });
  }

  // WAŻNE: zawsze wysyłamy przez HTTP, socket tylko odbiera
  async function handleSend(text, attachments = []) {
    if (!openThread) return;
    const socket = getSocket();
    const socketActive = socket && socket.connected;

    try {
      const msg = await sendMessageHttp(openThread.id, { text, attachments });

      // jeśli socket nie działa, dodajemy wiadomość lokalnie
      if (!socketActive) {
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            sender_email: (
              msg.senderEmail ||
              msg.sender_email ||
              currentUserId
            ).toLowerCase(),
            text: msg.text,
            attachments: msg.attachments,
            created_at: msg.createdAt || msg.created_at,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Nie udało się wysłać wiadomości.');
    }
  }

  async function handleDelete(threadId, e) {
    e?.stopPropagation();
    const yes = window.confirm('Usunąć ten wątek wraz z wiadomościami?');
    if (!yes) return;
    try {
      await deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (openThread?.id === threadId) {
        setOpenThread(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      alert('Nie udało się usunąć wątku.');
    }
  }

  async function handleDeleteFromModal() {
    if (!openThread) return;
    const yes = window.confirm('Usunąć ten wątek wraz z wiadomościami?');
    if (!yes) return;
    try {
      await deleteThread(openThread.id);
      setThreads((prev) => prev.filter((t) => t.id !== openThread.id));
      setOpenThread(null);
      setMessages([]);
    } catch (err) {
      console.error(err);
      alert('Nie udało się usunąć wątku.');
    }
  }

  function fmtIso(s) {
    return s ? new Date(s).toLocaleString() : '';
  }

  return (
    <div className="relative flex">
      <SubPagesNav currentPath={currentPath} isBurgerOpen={isBurgerOpen} />

      <div className="flex flex-col gap-10 px-5 w-full h-screen bg-secondary py-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl border-b-2 w-full py-5">Moje czaty</h2>
          <BurgerMenu
            isBurgerOpen={isBurgerOpen}
            handleBurger={() => setIsBurgerOpen((prev) => !prev)}
          />
        </div>

        <div className="flex flex-col gap-4 pb-10 h-full pr-2 lg:overflow-y-auto custom-scroll">
          {loading ? (
            <ChatSkeleton />
          ) : threads.length === 0 ? (
            <div className="text-accent">
              Brak rozmów. Otwórz Chat z poziomu ogłoszenia i wyślij pierwszą
              wiadomość.
            </div>
          ) : (
            threads.map((c) => (
              <div
                key={c.id}
                className="relative bg-main rounded-2xl p-4 pr-16 shadow-[0_6px_18px_rgba(0,0,0,.35)] cursor-pointer hover:bg-black/20 transition"
                onClick={() => handleOpenThread(c)}
              >
                <div className="absolute -left-2 top-2 bottom-2 w-2 rounded-xl bg-cta" />

                <div className="absolute right-3 top-3 text-sm bg-black/30 text-text rounded-md px-2 py-1">
                  {fmtIso(c.last_time || c.created_at)}
                </div>

                <button
                  className="absolute right-3 bottom-3 text-text/80 hover:text-negative"
                  title="Usuń wątek"
                  aria-label="Usuń wątek"
                  onClick={(e) => handleDelete(c.id, e)}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path
                      d="M3 6h18M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2m1 0l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="flex items-start gap-4">
                  <div className="w-[54px] h-[54px] rounded-full bg-text text-main grid place-items-center shrink-0">
                    <PersonSVG />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-lg truncate">
                        {c.subject || 'Zwierzak'}
                      </p>
                    </div>
                    <p className="text-cta text-sm">
                      Rozmowa między: {c.owner_email} ↔ {c.partner_email}
                    </p>
                    <p className="text-sm truncate">
                      {c.last_message || '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {openThread && (
        <ChatModal
          isOpen={true}
          onClose={() => setOpenThread(null)}
          partnerName={
            openThread.owner_email?.toLowerCase() === currentUserId
              ? openThread.partner_email
              : openThread.owner_email
          }
          topicName={openThread.subject || 'Zwierzak'}
          currentUserId={currentUserId}
          messages={messages.map((m) => ({
            id: m.id,
            senderId: (m.sender_email || m.senderEmail || '').toLowerCase(),
            text: m.text,
            createdAt: m.createdat || m.created_at || m.createdAt,
            attachments: m.attachments,
          }))}
          onSend={handleSend}
          onDelete={handleDeleteFromModal}
        />
      )}
    </div>
  );
}
