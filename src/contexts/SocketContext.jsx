import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { BASE } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const SocketContext = createContext({ socket: null, connected: false });

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [connected, setConnected] = useState(false);

  const socket = useMemo(() => {
    if (!token) return null;
    return io(BASE, {
      path: "/api/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }, [token]);

  useEffect(() => {
    if (!socket) {
      setConnected(false);
      return undefined;
    }

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
