import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function ensureThread({ subject, petId, ownerEmail, partnerEmail }) {
  const { data } = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/chats/ensure-thread`,
    { subject, petId, ownerEmail, partnerEmail },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return data;
}

const API_URL = import.meta.env.VITE_BACKEND_URL;

function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function uploadChatImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const res = await fetch(`${API_URL}/chats/upload-image`, {
    method: 'POST',
    headers: authHeaders(), // UWAGA: NIE dodajemy tu Content-Type – ustawia go sam fetch dla FormData
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Nie udało się przesłać zdjęć.');
  }

  const data = await res.json();
  return data.attachments || [];
}

export async function fetchThreads() {
  const { data } = await api.get('/chats/threads');
  return data;
}

export async function fetchMessages(threadId) {
  const { data } = await api.get(`/chats/${threadId}/messages`);
  return data;
}

export async function sendMessageHttp(threadId, payload) {
  const { data } = await api.post(`/chats/${threadId}/message`, payload);
  return data;
}

export async function deleteThread(threadId) {
  const { data } = await api.delete(`/chats/${threadId}`);
  return data;
}
