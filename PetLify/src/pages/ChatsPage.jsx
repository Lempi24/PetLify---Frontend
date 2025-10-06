import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SubPagesNav from "../components/ui/SubPagesNav";
import BurgerMenu from "../components/ui/BurgerMenu";
import ChatModal from "../components/chat/ChatModal";
import { listChats, addMessage, deleteChat } from "../utils/chatStore";
import useAuth from "../hooks/useAuth";

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

  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [openChat, setOpenChat] = useState(null);

  const loggedUser = useAuth();
  const currentUserId = loggedUser?.email || "me";

  useEffect(() => {
    document.body.classList.add("page-chats");
    return () => document.body.classList.remove("page-chats");
  }, []);

  useEffect(() => {
    setChats(listChats());
  }, []);

  function handleOpenThread(thread) {
    setOpenChat(thread);
  }

  function handleSend(text, attachments = []) {
    if (!openChat) return;
    const updated = addMessage(openChat.id, currentUserId, text, attachments);
    setOpenChat(updated);
    setChats(listChats());
  }

  function handleDeleteThread(e, threadId) {
    e.stopPropagation();
    if (!confirm("Usunąć ten czat?")) return;
    deleteChat(threadId);
    setChats(listChats());
    if (openChat?.id === threadId) setOpenChat(null);
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
          {chats.length === 0 && (
            <div className="text-accent">
              Brak rozmów. Otwórz Chat z poziomu ogłoszenia i wyślij pierwszą wiadomość.
            </div>
          )}

          {chats.map((c) => (
            <div
              key={c.id}
              className="relative bg-main rounded-2xl p-4 pr-16 shadow-[0_6px_18px_rgba(0,0,0,.35)] cursor-pointer hover:bg-black/20 transition"
              onClick={() => handleOpenThread(c)}
            >
              <div className="absolute -left-2 top-2 bottom-2 w-2 rounded-xl bg-cta" />

              <button
                className="absolute right-3 top-3 text-sm bg-black/30 hover:bg-black/50 text-text rounded-md px-2 py-1"
                title="Usuń czat"
                onClick={(e) => handleDeleteThread(e, c.id)}
              >
                Usuń
              </button>

              <div className="flex items-start gap-4">
                <div className="w-[54px] h-[54px] rounded-full bg-text text-main grid place-items-center shrink-0">
                  <PersonSVG />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-lg truncate">{c.partnerName || "Użytkownik"}</p>
                    <p className="text-sm text-accent whitespace-nowrap">
                      {c.lastTimeISO ? new Date(c.lastTimeISO).toLocaleString() : ""}
                    </p>
                  </div>
                  <p className="text-cta text-sm">W sprawie: {c.subject || "Zwierzak"}</p>
                  <p className="text-sm truncate">{c.lastMessage || "—"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {openChat && (
        <ChatModal
          isOpen={true}
          onClose={() => setOpenChat(null)}
          partnerName={openChat.partnerName || "Użytkownik"}
          topicName={openChat.subject || "Zwierzak"}
          currentUserId={currentUserId}
          messages={openChat.messages || []}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
