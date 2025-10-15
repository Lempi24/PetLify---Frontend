import { io } from 'socket.io-client';

let socket = null;

/** Inicjuje połączenie, gdy mamy token. */
export function getSocket() {
  const token = localStorage.getItem('token');
  if (!token) {
    // brak tokenu -> brak połączenia (chroni przed Unauthorized spam)
    if (socket) {
      try { socket.disconnect(); } catch {}
      socket = null;
    }
    // zwróć atrapę z minimalnym API, żeby UI się nie wywalał
    return {
      connected: false,
      emit: () => {},
      on: () => {},
      off: () => {},
      disconnect: () => {},
    };
  }

  if (socket && socket.connected) return socket;

  // (Re)connect z aktualnym tokenem
  socket = io(import.meta.env.VITE_BACKEND_URL, {
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect_error:', err?.message || err);
  });

  return socket;
}

/** Rozłącz i wyczyść referencję (np. przy wylogowaniu). */
export function disconnectSocket() {
  if (socket) {
    try { socket.disconnect(); } catch {}
    socket = null;
  }
}

/** Użyj po zalogowaniu — od razu zestawi nowe połączenie z nowym tokenem. */
export function reconnectSocket() {
  disconnectSocket();
  return getSocket();
}
