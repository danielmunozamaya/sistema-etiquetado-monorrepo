import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const PRIMARY_WS_URL = import.meta.env.VITE_WS_URL;
const SECONDARY_WS_URL = import.meta.env.VITE_WS_URL_SECONDARY;
const HEARTBIT_URL = `${PRIMARY_WS_URL}/api/common/heartbit`;

export function useFailoverSocket(channel, handlers = {}) {
  const socketRef = useRef(null);
  // const [currentUrl, setCurrentUrl] = useState(PRIMARY_WS_URL);
  const currentUrlRef = useRef(PRIMARY_WS_URL);

  const setUrl = (url) => {
    // setCurrentUrl(url);
    currentUrlRef.current = url;
  };

  const connectSocket = (url) => {
    if (socketRef.current) {
      socketRef.current.off(channel);
      socketRef.current.disconnect();
    }

    const socket = io(url);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`[WebSocket] Conectado a ${url}`);
    });

    socket.on("connect_error", (err) => {
      console.error(`[WebSocket] Error al conectar a ${url}:`, err.message);
    });

    socket.on(channel, (msg) => {
      if (!msg?.method) return;
      if (handlers[msg.method]) {
        handlers[msg.method]();
      }
    });
  };

  useEffect(() => {
    connectSocket(PRIMARY_WS_URL);

    const interval = setInterval(async () => {
      try {
        const response = await fetch(HEARTBIT_URL, { cache: "no-store" });
        const data = await response.json();

        if (data.alive && currentUrlRef.current !== PRIMARY_WS_URL) {
          console.log(
            "[WebSocket] Se ha recuperado el backend primario. Reconectando..."
          );
          setUrl(PRIMARY_WS_URL);
          connectSocket(PRIMARY_WS_URL);
        }
      } catch (err) {
        if (currentUrlRef.current !== SECONDARY_WS_URL) {
          console.warn("[WebSocket] Heartbit fallido. Usando secundario.");
          setUrl(SECONDARY_WS_URL);
          connectSocket(SECONDARY_WS_URL);
        }
      }
    }, 7000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.off(channel);
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef;
}
