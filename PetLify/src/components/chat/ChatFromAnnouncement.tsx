import React, { useState } from "react";
import ChatModal, { ChatMessage } from "./ChatModal";

type Props = {
  partnerName: string;     // właściciel ogłoszenia
  topicName: string;       // nazwa zwierzaka
  currentUserId: string;   // zalogowany user
};

export default function ChatFromAnnouncement({
  partnerName,
  topicName,
  currentUserId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      senderId: "owner",
      text: "Dzień dobry! Tak, nadal szukamy. Czy ma Pan/Pani jakieś informacje?",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ]);

  const handleSend = (text: string) => {
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), senderId: currentUserId, text, createdAt: new Date().toISOString() },
    ]);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16 }}>
        <button
          onClick={() => setOpen(true)}
          className="bg-cta text-main font-bold px-5 py-2 rounded-xl"
        >
          Chat
        </button>
      </div>

      <ChatModal
        isOpen={open}
        onClose={() => setOpen(false)}
        partnerName={partnerName}
        topicName={topicName}
        currentUserId={currentUserId}
        messages={messages}
        onSend={handleSend}
      />
    </>
  );
}
