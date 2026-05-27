import { useEffect, useRef, useState } from "react";

export const useWebSocket = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { autoReconnect = true, reconnectInterval = 3000 } = options;

  useEffect(() => {
    if (!url) return;

    const connect = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname;
        const port = host === "localhost" ? ":5050" : "";
        const wsUrl = `${protocol}//${host}${port}${url}`;

        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          if (autoReconnect) {
            reconnectTimeoutRef.current = setTimeout(
              connect,
              reconnectInterval,
            );
          }
        };

        wsRef.current.onerror = (err) => {
          setError("WebSocket connection error");
          console.error("WebSocket error:", err);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setData(parsed);
          } catch (err) {
            setData(event.data);
          }
        };
      } catch (err) {
        setError(err.message);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, autoReconnect, reconnectInterval]);

  const send = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        typeof message === "string" ? message : JSON.stringify(message),
      );
    }
  };

  return { data, isConnected, error, send };
};

// Made with Bob
