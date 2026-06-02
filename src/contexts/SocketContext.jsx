import { createContext, useContext } from "react";

const SocketContext = createContext({ socket: null, connected: false });

export const SocketProvider = ({ children }) => children;

export const useSocket = () => useContext(SocketContext);
