import { useEffect, useMemo, useRef, useState } from "react";

// helpers
function fmt(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function isImage(type = "") {
  return /^image\//i.test(type);
}
function fileIcon(type = "") {
  if (/pdf$/i.test(type)) return "📄";
  if (/word|officedocument\.word/i.test(type)) return "📝";
  if (/sheet|excel|spreadsheet/i.test(type)) return "📊";
  if (/text\/plain/i.test(type)) return "📃";
  return "📎";
}

export default function ChatModal({
  isOpen,
  onClose,
  partnerName,
  topicName,
  currentUserId,
  messages,
  onSend, // (text, attachments)
}) {
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);

  // załączniki przed wysłaniem
  const [pending, setPending] = useState([]);
  const fileInputRef = useRef(null);

  const listRef = useRef(null);
  const taRef = useRef(null);

  // posortowane + separatory
  const sorted = useMemo(
    () => [...(messages || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages]
  );

  const withSeps = useMemo(() => {
    const out = [];
    let last = 0;
    for (const m of sorted) {
      const t = new Date(m.createdAt).getTime();
      if (last !== 0 && t - last > 10 * 60 * 1000) out.push({ type: "sep", at: m.createdAt });
      out.push({ type: "msg", m });
      last = t;
    }
    return out;
  }, [sorted]);

  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    setTimeout(() => taRef.current?.focus(), 0);
  }, [isOpen, withSeps.length, otherTyping, pending.length]);

  // załączniki
  function openFilePicker() {
    fileInputRef.current?.click();
  }
  function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = files.map((f) => ({
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      name: f.name,
      type: f.type || "application/octet-stream",
      size: f.size,
      url: URL.createObjectURL(f), // blob:
    }));
    setPending((prev) => [...prev, ...next]);
    e.target.value = "";
  }
  function removePending(id) {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.url) URL.revokeObjectURL(item.url);
      return prev.filter((p) => p.id !== id);
    });
  }
  function openAttachment(att) {
    window.open(att.url, "_blank", "noopener,noreferrer");
  }

  const canSend = text.trim().length > 0 || pending.length > 0;

  function handleSend() {
    if (!canSend) return;
    onSend(text.trim(), pending);
    setText("");
    setPending([]);
    setOtherTyping(true);
    setTimeout(() => setOtherTyping(false), 1200);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] bg-black/60 grid place-items-center"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[720px] mx-6 h-[66vh] md:h-[66vh] bg-main text-text rounded-2xl shadow-[0_18px_44px_rgba(0,0,0,.55)] grid grid-rows-[auto_1fr_auto] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center gap-2 bg-secondary px-3 py-2">
          <button
            className="w-9 h-9 rounded-md grid place-items-center hover:bg-white/10"
            onClick={onClose}
            aria-label="Wstecz"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M15 19l-7-7 7-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-sm sm:text-base truncate">
              Rozmowa z {partnerName}
            </div>
            <div className="text-xs text-accent truncate">
              w sprawie: <span className="font-extrabold text-text">{topicName}</span>
            </div>
          </div>

          <button
            className="px-2 py-1 text-cta font-extrabold text-lg rounded-md hover:bg-cta/15"
            onClick={onClose}
            aria-label="Zamknij"
          >
            X
          </button>
        </div>

        <div className="h-[1px] bg-white/10" />

        {/* WIADOMOŚCI */}
        <div ref={listRef} className="bg-[#1b1b1b] overflow-y-auto px-4 py-3">
          {withSeps.length === 0 && (
            <div className="text-center text-accent text-sm py-4">
              Napisz pierwszą wiadomość…
            </div>
          )}

          {withSeps.map((it, i) => {
            if (it.type === "sep") {
              return (
                <div
                  key={`sep-${i}`}
                  className="text-xs text-accent border border-white/15 rounded-full px-2 py-1 w-fit mx-auto my-2"
                >
                  {new Date(it.at).toLocaleString()}
                </div>
              );
            }
            const m = it.m;
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex my-2 ${mine ? "justify-end" : "justify-start"}`}
                title={fmt(m.createdAt)}
              >
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl whitespace-pre-wrap break-words text-sm leading-relaxed ${
                    mine
                      ? "bg-cta text-main rounded-br-md"
                      : "bg-user-options-fill text-text rounded-bl-md"
                  }`}
                >
                  {m.text}

                  {!!m.attachments?.length && (
                    <div className="flex flex-col gap-2 mt-2">
                      {m.attachments.map((a) => (
                        <div
                          key={a.id}
                          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-lg px-2 py-1 cursor-pointer"
                          onClick={() => openAttachment(a)}
                          title={`Otwórz: ${a.name}`}
                          role="button"
                        >
                          {isImage(a.type) ? (
                            <img
                              src={a.url}
                              alt={a.name}
                              className="w-10 h-10 object-cover rounded-md bg-black"
                            />
                          ) : (
                            <span className="text-base">{fileIcon(a.type)}</span>
                          )}
                          <span className="text-xs max-w-[220px] truncate">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {otherTyping && (
            <div className="flex my-2 justify-start">
              <div className="max-w-[78%] px-3 py-2 rounded-2xl bg-user-options-fill rounded-bl-md">
                <span className="inline-flex items-center gap-1">
                  <i className="w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce [animation-delay:-.2s]" />
                  <i className="w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce" />
                  <i className="w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce [animation-delay:.2s]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PENDING ZAŁĄCZNIKI */}
        {pending.length > 0 && (
          <div className="bg-secondary border-y border-white/10 px-3 py-2 flex flex-wrap gap-2">
            {pending.map((a) => (
              <div
                key={a.id}
                className="inline-flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1"
              >
                {isImage(a.type) ? (
                  <img
                    src={a.url}
                    alt={a.name}
                    className="w-10 h-10 object-cover rounded-md bg-black cursor-pointer"
                    onClick={() => openAttachment(a)}
                  />
                ) : (
                  <span
                    className="text-base cursor-pointer"
                    onClick={() => openAttachment(a)}
                  >
                    {fileIcon(a.type)}
                  </span>
                )}
                <span
                  className="text-xs max-w-[220px] truncate cursor-pointer"
                  onClick={() => openAttachment(a)}
                >
                  {a.name}
                </span>
                <button
                  className="ml-1 text-base leading-none hover:opacity-100 opacity-80"
                  onClick={() => removePending(a.id)}
                  title="Usuń"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INPUT BAR */}
        <div className="bg-secondary border-t border-white/10 px-3 py-2 flex items-end gap-2">
          <textarea
            ref={taRef}
            className="flex-1 max-h-[140px] min-h-[44px] resize-none bg-user-options-fill text-text rounded-xl px-3 py-2 outline-none border border-transparent focus:border-cta leading-relaxed placeholder:text-accent"
            placeholder="Wpisz wiadomość..."
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const ta = e.currentTarget;
              ta.style.height = "auto";
              ta.style.height = Math.min(140, ta.scrollHeight) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="flex items-center gap-2">
            {/* WYŚLIJ – CTA */}
            <button
              className="w-10 h-10 rounded-full grid place-items-center bg-cta text-main font-extrabold disabled:opacity-60"
              onClick={handleSend}
              title="Wyślij"
              aria-label="Wyślij"
              disabled={!canSend}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22 2L11 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" fill="currentColor" />
              </svg>
            </button>

            {/* ZAŁĄCZ – TEN SAM STYL CO „WYŚLIJ” */}
            <button
              className="w-10 h-10 rounded-full grid place-items-center bg-cta text-main font-extrabold"
              onClick={openFilePicker}
              title="Załącz plik"
              aria-label="Załącz plik"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  d="M16.5 6.5l-7.78 7.78a3 3 0 104.24 4.24l8.13-8.13a5 5 0 10-7.07-7.07L5.9 10.44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
              accept="
                image/*,
                application/pdf,
                application/msword,
                application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                application/vnd.ms-excel,
                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                text/plain
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
