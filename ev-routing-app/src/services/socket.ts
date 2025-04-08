import { VITE_USE_MOCK } from '../utils/constants';
import mock from './mockSocket';

type CommonSocket = {
  on(event: string, handler: (payload: any) => void): void;
  off(event: string, handler?: (payload: any) => void): void;
  emit(event: string, payload?: any): void;
};

class WebSocketAdapter implements CommonSocket {
  private ws: WebSocket;
  private handlers: Record<string, ((data: any) => void)[]> = {};
  private isReady: Promise<void>;

  constructor(url: string) {
    this.ws = new WebSocket(url);

    this.isReady = new Promise((resolve) => {
      this.ws.onopen = () => {
        console.log('[WS] Conectado com sucesso:', url);
        resolve();
      };
    });

    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      this.handlers[type]?.forEach((handler) => handler(data));
    };

    this.ws.onclose = () => {
      console.warn('[WS] Conexão encerrada');
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Erro:', err);
    };
  }

  on(event: string, handler: (payload: any) => void) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  off(event: string, handler?: (payload: any) => void) {
    if (!handler) {
      delete this.handlers[event];
    } else {
      this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
    }
  }

  async emit(_event: string, payload?: any) {
  await this.isReady;
  this.ws.send(JSON.stringify(payload));
}

}

const getDynamicBackendUrl = () => {
  const host = localStorage.getItem('server_ip') || window.location.hostname;
  return `ws://${host}:4000`;
};

export const socket: CommonSocket = VITE_USE_MOCK
  ? mock
  : new WebSocketAdapter(getDynamicBackendUrl());
