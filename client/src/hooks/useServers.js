import { useState, useEffect, useCallback } from "react";
import api from "../utilities/api";

export const useServers = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/servers");
      setServers(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch servers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return { servers, loading, error, refetch: fetchServers };
};

export const useServer = (serverId) => {
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServer = useCallback(async () => {
    if (!serverId) return;
    try {
      setLoading(true);
      const response = await api.get(`/servers/${serverId}`);
      setServer(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch server");
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchServer();
  }, [fetchServer]);

  return { server, loading, error, refetch: fetchServer };
};

export const useServerStatus = (serverId, interval = 5000) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serverId) return;

    const fetchStatus = async () => {
      try {
        const response = await api.get(`/servers/${serverId}/status`);
        setStatus(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, interval);

    return () => clearInterval(intervalId);
  }, [serverId, interval]);

  return { status, loading };
};

export const useCreateServer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createServer = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post("/servers", data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to create server";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { createServer, loading, error };
};

export const useServerActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startServer = async (serverId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/servers/${serverId}/start`);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to start server";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const stopServer = async (serverId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/servers/${serverId}/stop`);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to stop server";
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { startServer, stopServer, loading, error };
};

// Made with Bob
