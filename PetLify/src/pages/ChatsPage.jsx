import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SubPagesNav from "../components/ui/SubPagesNav";
import BurgerMenu from "../components/ui/BurgerMenu";
import ChatModal from "../components/chat/ChatModal";


const API_BASE = import.meta.env?.VITE_API_URL || "";

// pomocniczy fetch
async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    credentials: "include",
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// demo – zachowuje te same teksty/snippety co wcześniej
const SAMPLE_CHATS = [
  {
    id: 1,
    partnerName: "Anna Nowak",
    subject: "Burek",
    lastMessage: "Wydaje mi się, że widziałam podobnego psa rano w Parku",
    lastTimeHuman: "5 min. temu",
    messages: [
      { id: "1", senderId: "me", text: "Dzień dobry, widziałem Pańskie zgłoszenie. Czy piesek nadal jest zaginiony?", createdAt: new Date(Date.now()-60*60*1000).toISOString() },
      { id: "2", senderId: "anna", text: "Dzień dobry! Tak, niestety nadal go szukamy. Czy ma Pan/Pani jakieś informacje?", createdAt: new Date(Date.now()-58*60*1000).toISOString() },
    ],
  },
  {
    id: 2,
    partnerName: "Piotr Wiśniewski",
    subject: "Kicia",
    lastMessage: "Bardzo się cieszę, że znalazł Pan kicię. Spotkajmy",
    lastTimeHuman: "2 godz. temu",
    messages: [
      { id: "1", senderId: "piotr", text: "Super, dziękuję!", createdAt: new Date(Date.now()-2*60*60*1000).toISOString() },
    ],
  },
  {
    id: 3,
    partnerName: "Ewa Zielińska",
    subject: "Grubcio",
    lastMessage: "Dziękuję za informację!",
    lastTimeHuman: "Wczoraj",
    messages: [
      { id: "1", senderId: "ewa", text: "Dziękuję za informację!", createdAt: new Date(Date.now()-26*60*60*1000).toISOString() },
    ],
  },
];

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
  const [loading, setLoading] = useState(true);

  // modal
  const [openChat, setOpenChat] = useState(null);
  const currentUserId = "me"; // <- podmień na zalogowanego

  useEffect(() => {
    document.body.classList.add("page-chats");
    return () => document.body.classList.remove("page-chats");
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let list = [];
      try {
        const data = await fetchJSON(`${API_BASE}/api/chats`);
        list = Array.isArray(data) ? data : data?.data || [];
      } catch {
        if (import.meta.env.DEV) list = SAMPLE_CHATS;
      } finally {
        if (mounted) { setChats(list); setLoading(false); }
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div className="relative flex">
      <SubPagesNav currentPath={currentPath} isBurgerOpen={isBurgerOpen} />
      <div className="flex flex-col gap-10 px-5 w-full h-screen bg-secondary py-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl border-b-2 w-full py-5">Moje czaty</h2>
          <BurgerMenu isBurgerOpen={isBurgerOpen} handleBurger={() => setIsBurgerOpen(p=>!p)} />
        </div>

        <div className="flex flex-col gap-4 pb-10 h-full custom-scroll pr-2 lg:overflow-y-auto">
          {loading && <div className="text-accent">Wczytywanie…</div>}

          {!loading && chats.map((c) => (
            <div
              key={c.id || c.chatId}
              className="relative bg-main rounded-2xl p-4 pr-16 shadow-[0_6px_18px_rgba(0,0,0,.35)] cursor-pointer"
              onClick={() => setOpenChat({ partnerName: c.partnerName || "Użytkownik", subject: c.subject || "Zwierzak", messages: c.messages || [] })}
            >
              {/* lewy akcent */}
              <div className="absolute -left-2 top-2 bottom-2 w-2 rounded-xl bg-cta"></div>

              <div className="flex items-start gap-4">
                {/* avatar */}
                <div className="w-[54px] h-[54px] rounded-full bg-text text-main grid place-items-center shrink-0">
                  <PersonSVG />
                </div>

                {/* treść */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-lg truncate">{c.partnerName || "Użytkownik"}</p>
                    <p className="text-sm text-accent whitespace-nowrap">{c.lastTimeHuman || ""}</p>
                  </div>
                  <p className="text-cta text-sm">W sprawie: {c.subject || "Zwierzak"}</p>
                  <p className="text-sm truncate">{c.lastMessage || "—"}</p>
                </div>
              </div>
            </div>
          ))}

          {!loading && chats.length === 0 && <div className="text-accent">Brak rozmów.</div>}
        </div>
      </div>

      {openChat && (
        <ChatModal
          isOpen={true}
          onClose={() => setOpenChat(null)}
          partnerName={openChat.partnerName}
          topicName={openChat.subject}
          currentUserId={currentUserId}
          messages={openChat.messages}
          onSend={(txt) =>
            setOpenChat(prev =>
              prev ? {
                ...prev,
                messages: [
                  ...(prev.messages || []),
                  { id: String(Date.now()), senderId: currentUserId, text: txt, createdAt: new Date().toISOString() },
                ],
              } : prev
            )
          }
        />
      )}
    </div>
  );
}
