import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const PRIMARY_WS_URL = import.meta.env.VITE_WS_URL as string;
const SECONDARY_WS_URL = import.meta.env.VITE_WS_URL_SECONDARY as string;
const HEARTBIT_URL = `${PRIMARY_WS_URL}/api/common/heartbit`;

type Handlers = {
  [method: string]: () => void;
};

export function useFailoverSocket(channel: string, handlers: Handlers = {}) {
  const socketRef = useRef<Socket | null>(null);
  const currentUrlRef = useRef<string>(PRIMARY_WS_URL);

  const setUrl = (url: string) => {
    currentUrlRef.current = url;
  };

  const connectSocket = (url: string) => {
    if (socketRef.current) {
      socketRef.current.off(channel);
      socketRef.current.disconnect();
    }

    const socket = io(url);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`[WebSocket] Conectado a ${url}`);
    });

    socket.on("connect_error", (err: Error) => {
      console.error(`[WebSocket] Error al conectar a ${url}:`, err.message);
    });

    socket.on(channel, (msg: { method?: string }) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}
