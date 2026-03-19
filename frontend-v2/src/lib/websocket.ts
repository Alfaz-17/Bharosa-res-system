"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

type MessageHandler = (data: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private token: string | null = null;

  constructor(url: string) {
    this.url = url;
  }

  setToken(token: string) {
    this.token = token;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) return;

    try {
      // Append token to URL if available
      const connectionUrl = this.token ? `${this.url}?token=${this.token}` : this.url;
      this.socket = new WebSocket(connectionUrl);

      this.socket.onopen = () => {
        console.log("WebSocket Connected");
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlers.forEach(handler => handler(data));
        } catch (e) {
          console.error("Failed to parse WS message:", event.data);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket Disconnected (Code: ${event.code}). Reconnecting...`);
        if (event.code !== 1000 && event.code !== 1001) {
          this.reconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
        this.socket?.close();
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
  }

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.socket?.close();
    this.socket = null;
  }
}

const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
export const socket = new WebSocketClient(wsUrl);

export const useWebSocket = (onMessage: MessageHandler) => {
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    // Connect even if no user/token (guest mode)
    if (accessToken) {
      socket.setToken(accessToken);
    }
    
    socket.connect();
    const unsubscribe = socket.subscribe(onMessage);

    return () => {
      unsubscribe();
    };
  }, [user, accessToken, onMessage]);

  return { send: socket.send.bind(socket) };
};
