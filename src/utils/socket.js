import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

// const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const SOCKET_URL = "http://localhost:5000";

let socket = null;

const getAuthPayload = () => {
  const { user } = useAuthStore.getState();
  const userId = Number(user?.UserID || user?.userId || 0);
  const role = String(user?.Role || user?.role || '').toLowerCase();

  if (!userId || !role) {
    return null;
  }

  return { userId, role };
};

const emitAuthenticate = () => {
  const authPayload = getAuthPayload();
  if (!authPayload || !socket?.connected) {
    return;
  }

  socket.emit('authenticate', authPayload);
  console.log('Socket authenticate emitted:', authPayload);
};

export const initializeSocket = () => {
  if (socket) {
    if (!socket.connected && !socket.active) {
      socket.connect();
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    emitAuthenticate();
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return initializeSocket();
};

export const authenticateSocket = () => {
  const currentSocket = getSocket();
  const authPayload = getAuthPayload();

  if (!authPayload) {
    console.error('Unable to authenticate socket: missing userId or role');
    return false;
  }

  if (!currentSocket.connected) {
    return false;
  }

  currentSocket.emit('authenticate', authPayload);
  return true;
};

export const subscribeLiveActivities = (payload) => {
  const currentSocket = getSocket();
  currentSocket.emit('subscribeLiveActivities', payload);
};

export const unsubscribeLiveActivities = (payload) => {
  const currentSocket = getSocket();
  currentSocket.emit('unsubscribeLiveActivities', payload);
};

export const subscribeToSocketEvent = (eventName, callback) => {
  const currentSocket = getSocket();
  currentSocket.on(eventName, callback);

  return () => {
    currentSocket.off(eventName, callback);
  };
};

export default {
  initializeSocket,
  disconnectSocket,
  getSocket,
  authenticateSocket,
  subscribeLiveActivities,
  unsubscribeLiveActivities,
  subscribeToSocketEvent,
};
