import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get the backend URL from environment or default to localhost
    const serverUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    // Get auth token for authenticated socket connection
    const token = localStorage.getItem('token') || localStorage.getItem('droneflux-token');
    
    // Initialize socket connection with authentication
    const newSocket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      console.log('🔗 Server URL:', serverUrl);
      console.log('🔑 Auth token:', token ? 'Present' : 'Missing');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error);
      console.log('🔍 Trying to connect to:', serverUrl);
      setIsConnected(false);
    });

    // Authentication events
    newSocket.on('authenticated', () => {
      console.log('🔐 Socket authenticated successfully');
    });

    newSocket.on('unauthorized', (error) => {
      console.error('🔒 Socket authentication failed:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Reconnect when token changes (user login/logout)
  useEffect(() => {
    if (socket) {
      const token = localStorage.getItem('token');
      if (token) {
        socket.auth = { token };
        socket.connect();
      } else {
        socket.disconnect();
      }
    }
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = (): Socket | null => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};

// Hook to get connection status
export const useSocketConnection = (): boolean => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketConnection must be used within a SocketProvider');
  }
  return context.isConnected;
};

export default SocketContext;
