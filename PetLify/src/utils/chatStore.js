// Prosty store czatów w localStorage (front-end only)

const KEY = "pl_chats";

function uid() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9)
  );
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

/** Zwraca listę posortowaną malejąco po czasie ostatniej wiadomości */
export function listChats() {
  const list = load();
  return [...list].sort((a, b) => {
    const tb = new Date(b.lastTimeISO || 0).getTime();
    const ta = new Date(a.lastTimeISO || 0).getTime();
    return tb - ta;
  });
}

export function getChat(chatId) {
  return load().find((c) => c.id === chatId) || null;
}

/** Usuń czat po ID */
export function deleteChat(chatId) {
  const list = load();
  const next = list.filter((c) => c.id !== chatId);
  save(next);
  return next;
}

/**
 * Dodaj wiadomość do istniejącego wątku (opcjonalnie z załącznikami)
 * attachments: [{ id, name, type, size, url }]
 */
export function addMessage(chatId, senderId, text, attachments = []) {
  const list = load();
  const idx = list.findIndex((c) => c.id === chatId);
  if (idx < 0) return null;

  const msg = {
    id: uid(),
    senderId,
    text,
    createdAt: new Date().toISOString(),
    attachments: attachments.map((a) => ({
      id: a.id || uid(),
      name: a.name,
      type: a.type,
      size: a.size,
      url: a.url, // blob: lub data:
    })),
  };

  list[idx].messages = list[idx].messages || [];
  list[idx].messages.push(msg);
  list[idx].lastMessage = text || (attachments[0]?.name || "Załącznik");
  list[idx].lastTimeISO = msg.createdAt;

  save(list);
  return list[idx];
}

/**
 * Utwórz DRAFT (niezapisany) wątek dla ogłoszenia.
 * Dopóki nie wyślesz pierwszej wiadomości, nic nie zapisujemy do localStorage.
 */
export function createDraftThreadForPet(pet) {
  return {
    id: null, // brak ID dopóki nie zapiszemy
    petId: pet.id,
    subject: pet.pet_name || "Zwierzak",
    partnerName: "Właściciel",
    partnerEmail: pet.owner || "",
    lastMessage: "",
    lastTimeISO: null,
    messages: [], // {id, senderId, text, createdAt, attachments?}
    __draft: true,
  };
}

/**
 * Upewnij się, że wątek istnieje (jeśli to draft – utwórz), dołóż wiadomość i zapisz.
 * attachments: [{ id, name, type, size, url }]
 */
export function ensureThreadAndAddMessage(threadOrPet, senderId, text, attachments = []) {
  let list = load();
  let thread = null;

  const isPetObj =
    threadOrPet && typeof threadOrPet === "object" && "pet_name" in threadOrPet;
  const isDraftObj =
    threadOrPet && typeof threadOrPet === "object" && threadOrPet.__draft;

  if (isPetObj) {
    // spróbuj znaleźć istniejący wątek po petId
    thread = list.find((c) => String(c.petId) === String(threadOrPet.id)) || null;
    if (!thread) {
      thread = {
        id: uid(),
        petId: threadOrPet.id,
        subject: threadOrPet.pet_name || "Zwierzak",
        partnerName: "Właściciel",
        partnerEmail: threadOrPet.owner || "",
        lastMessage: "",
        lastTimeISO: null,
        messages: [],
      };
      list.unshift(thread);
    }
  } else if (isDraftObj) {
    // przekształć draft w normalny wątek
    thread = { ...threadOrPet, id: uid() };
    delete thread.__draft;
    list.unshift(thread);
  } else if (threadOrPet && threadOrPet.id) {
    thread = list.find((c) => c.id === threadOrPet.id) || null;
  }

  if (!thread) {
    // fallback — nowy pusty wątek
    thread = {
      id: uid(),
      petId: threadOrPet?.petId ?? null,
      subject: threadOrPet?.subject || "Zwierzak",
      partnerName: threadOrPet?.partnerName || "Rozmówca",
      partnerEmail: threadOrPet?.partnerEmail || "",
      lastMessage: "",
      lastTimeISO: null,
      messages: [],
    };
    list.unshift(thread);
  }

  // dołóż wiadomość (z załącznikami)
  const msg = {
    id: uid(),
    senderId,
    text,
    createdAt: new Date().toISOString(),
    attachments: attachments.map((a) => ({
      id: a.id || uid(),
      name: a.name,
      type: a.type,
      size: a.size,
      url: a.url,
    })),
  };

  thread.messages = thread.messages || [];
  thread.messages.push(msg);
  thread.lastMessage = text || (attachments[0]?.name || "Załącznik");
  thread.lastTimeISO = msg.createdAt;

  // zapisz
  const idx = list.findIndex((c) => c.id === thread.id);
  if (idx >= 0) list[idx] = thread;
  else list.unshift(thread);
  save(list);

  return thread;
}
