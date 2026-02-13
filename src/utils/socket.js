import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

// const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://intelliquiz-backend-4bha.onrender.com';
const SOCKET_URL = "http://localhost:5000"

let socket = null;

export const initializeSocket = () => {
  if (socket?.connected) {
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
    
    // Authenticate after connection
    const { user } = useAuthStore.getState();
    if (user?.UserID) {
      socket.emit('authenticate', user.UserID);
      console.log('Socket authenticated with userId:', user.UserID);
      
      // Join teacher room if user is a teacher
      if (user.Role === 'teacher') {
        socket.emit('joinTeacherRoom');
        console.log('Joined teacher room');
      }
    }
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
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initializeSocket();
  }
  return socket;
};

export const joinQuizRoom = (quizId) => {
  const currentSocket = getSocket();
  currentSocket.emit('joinQuizRoom', quizId);
  console.log('Joined quiz room:', quizId);
};

export const subscribeToSubmissionNotifications = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('submissionNotification', callback);
  
  return () => {
    currentSocket.off('submissionNotification', callback);
  };
};

export const subscribeToLeaderboardUpdates = (callback) => {
  const currentSocket = getSocket();
  currentSocket.on('leaderboardUpdate', callback);
  
  return () => {
    currentSocket.off('leaderboardUpdate', callback);
  };
};

export default {
  initializeSocket,
  disconnectSocket,
  getSocket,
  joinQuizRoom,
  subscribeToSubmissionNotifications,
  subscribeToLeaderboardUpdates,
};
