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
