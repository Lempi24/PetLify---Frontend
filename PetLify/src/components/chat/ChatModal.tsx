import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ChatModal.css";

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string; // ISO
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;   // np. "Jan Kowalski"
  topicName: string;     // np. "Burek"
  currentUserId: string; // zalogowany użytkownik
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onAttachClick?: () => void;
};

function fmt(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatModal({
  isOpen,
  onClose,
  partnerName,
  topicName,
  currentUserId,
  messages,
  onSend,
  onAttachClick,
}: Props) {
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [messages]
  );

  const withSeps = useMemo(() => {
    const out: Array<{ type: "sep"; at: string } | { type: "msg"; m: ChatMessage }> = [];
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
  }, [isOpen, withSeps.length, otherTyping]);

  const handleSend = () => {
    const v = text.trim();
    if (!v) return;
    onSend(v);
    setText("");
    setOtherTyping(true);
    setTimeout(() => setOtherTyping(false), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="chat__backdrop" onClick={(e)=>e.stopPropagation()} role="dialog" aria-modal="true">
      <div className="chat__panel" onClick={(e)=>e.stopPropagation()}>
        {/* HEADER */}
        <div className="chat__header">
          <button className="chat__back" onClick={onClose} aria-label="Wstecz">
            <svg viewBox="0 0 24 24" className="chat__icon">
              <path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="chat__headerText">
            <div className="chat__title">Rozmowa z {partnerName}</div>
            <div className="chat__subtitle">
              w sprawie: <span className="chat__subject">{topicName}</span>
            </div>
          </div>

          <button className="chat__close" onClick={onClose} aria-label="Zamknij">X</button>
        </div>
        <div className="chat__divider" />

        {/* WIADOMOŚCI */}
        <div ref={listRef} className="chat__messages">
          {withSeps.length === 0 && (
            <div className="chat__empty">Napisz pierwszą wiadomość…</div>
          )}

          {withSeps.map((it, i) => {
            if (it.type === "sep") {
              return (
                <div key={`sep-${i}`} className="chat__timeSep">
                  {new Date(it.at).toLocaleString()}
                </div>
              );
            }
            const m = it.m;
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`chat__row ${mine ? "mine" : "theirs"}`}
                title={`${fmt(m.createdAt)}`}
              >
                <div className={`chat__bubble ${mine ? "bubble--mine" : "bubble--theirs"}`}>
                  {m.text}
                </div>
              </div>
            );
          })}

          {otherTyping && (
            <div className="chat__row theirs">
              <div className="chat__bubble bubble--theirs">
                <span className="chat__typing"><i></i><i></i><i></i></span>
              </div>
            </div>
          )}
        </div>

        {/* INPUT: pole + dwa kółka po prawej (Wyślij, Załącz) */}
        <div className="chat__inputBar">
          <textarea
            ref={taRef}
            className="chat__input"
            placeholder="Wpisz wiadomość..."
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const ta = e.currentTarget;
              ta.style.height = "auto";
              ta.style.height = Math.min(120, ta.scrollHeight) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="chat__btnsRight">
            {/* Wyślij */}
            <button
              className="chat__circleBtn send"
              title="Wyślij"
              aria-label="Wyślij"
              onClick={handleSend}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="chat__icon" aria-hidden="true">
                <path d="M22 2L11 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 2l-7 20-4-9-9-4 20-7z" fill="currentColor"/>
              </svg>
            </button>

            {/* Załącz */}
            <button
              className="chat__circleBtn"
              title="Załącz plik"
              aria-label="Załącz plik"
              onClick={onAttachClick}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="chat__icon" aria-hidden="true">
                <path d="M16.5 6.5l-7.78 7.78a3 3 0 104.24 4.24l8.13-8.13a5 5 0 10-7.07-7.07L5.9 10.44"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
