"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket(eventId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!eventId) return;

    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    socketRef.current.emit("joinEvent", eventId);

    return () => {
      socketRef.current.emit("leaveEvent", eventId);
      socketRef.current.disconnect();
    };
  }, [eventId]);

  return socketRef;
}