import { createContext, useContext, useEffect, useRef, useState, memo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = memo(function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();
  const userIdRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    if (userIdRef.current === user._id && socketRef.current?.connected) return;

    const isDev = window.location.hostname === 'localhost';
    const socketUrl = isDev ? 'http://localhost:5000' : undefined;
    if (!isDev && !socketUrl) return;

    userIdRef.current = user._id;
    const s = io(socketUrl || '/', {
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 30000,
      timeout: 10000
    });

    s.on('connect', () => { setConnected(true); s.emit('join', user._id); });
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));

    socketRef.current = s;
    return () => { s.disconnect(); socketRef.current = null; setConnected(false); userIdRef.current = null; };
  }, [user?._id]);

  const value = { socket: socketRef.current, connected };
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
});

export const useSocket = () => useContext(SocketContext);
