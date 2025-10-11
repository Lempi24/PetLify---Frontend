// src/services/chatApi.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

function authHeader() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export async function ensureThread({ subject, petId, ownerEmail, partnerEmail }) {
  const { data } = await api.post(
    '/chats/ensure-thread',
    { subject, petId, ownerEmail, partnerEmail },
    { headers: authHeader() }
  );
  return data;
}

export async function fetchThreads() {
  const { data } = await api.get('/chats/threads', { headers: authHeader() });
  return data;
}

export async function fetchMessages(threadId) {
  const { data } = await api.get(`/chats/${threadId}/messages`, { headers: authHeader() });
  return data;
}

export async function sendMessageHttp(threadId, payload) {
  const { data } = await api.post(`/chats/${threadId}/message`, payload, { headers: authHeader() });
  return data;
}

export async function deleteThread(threadId) {
  const { data } = await api.delete(`/chats/${threadId}`, { headers: authHeader() });
  return data;
}
