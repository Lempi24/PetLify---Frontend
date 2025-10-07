import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (socket) return socket;

  const token = localStorage.getItem('token');
  socket = io(import.meta.env.VITE_BACKEND_URL, {
    transports: ['websocket'],
    auth: { token },
    autoConnect: true
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect_error:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
