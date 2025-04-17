
/**
 * Cliente Socket.io para comunicación en tiempo real con el servidor
 * 
 * Este módulo proporciona un wrapper para la comunicación en tiempo real con Socket.io,
 * gestionando la conexión, reconexión y eventos de socket.
 */

import { io, Socket } from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';

class SocketClient {
  private socket: Socket | null = null;
  private eventHandlers: { [key: string]: Function[] } = {};
  
  // Inicializar la conexión con el servidor Socket.io
  connect(token: string) {
    if (this.socket && this.socket.connected) {
      return Promise.resolve(this.socket);
    }
    
    return new Promise<Socket>((resolve, reject) => {
      try {
        this.socket = io('http://localhost:5000', {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        });
        
        this.socket.on('connect', () => {
          console.log('Socket.io conectado');
          resolve(this.socket!);
        });
        
        this.socket.on('connect_error', (error) => {
          console.error('Error de conexión Socket.io:', error);
          if (!this.socket?.connected) {
            reject(error);
          }
        });
        
        this.socket.on('error', (error) => {
          console.error('Error de Socket.io:', error);
          toast({
            title: 'Error de conexión',
            description: error.message || 'Error de conexión en tiempo real',
            variant: 'destructive'
          });
        });
        
        // Reconectar listeners cuando la conexión se restablece
        this.socket.on('reconnect', () => {
          console.log('Socket.io reconectado');
          this.reattachEventHandlers();
        });
        
      } catch (error) {
        console.error('Error al inicializar Socket.io:', error);
        reject(error);
      }
    });
  }
  
  // Desconectar del servidor
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventHandlers = {};
      console.log('Socket.io desconectado');
    }
  }
  
  // Verificar si el socket está conectado
  isConnected(): boolean {
    return !!this.socket?.connected;
  }
  
  // Enviar un evento al servidor
  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn('Intentando emitir evento sin conexión:', event);
      return;
    }
    
    this.socket.emit(event, data);
  }
  
  // Registrar un handler para un evento
  on(event: string, callback: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    
    this.eventHandlers[event].push(callback);
    
    if (this.socket) {
      this.socket.on(event, (...args) => callback(...args));
    }
    
    // Devolver una función para eliminar el handler
    return () => this.off(event, callback);
  }
  
  // Eliminar un handler para un evento
  off(event: string, callback: Function) {
    if (!this.eventHandlers[event]) return;
    
    const index = this.eventHandlers[event].indexOf(callback);
    if (index !== -1) {
      this.eventHandlers[event].splice(index, 1);
    }
    
    if (this.socket) {
      this.socket.off(event);
      
      // Reattach remaining handlers
      this.eventHandlers[event].forEach(handler => {
        this.socket!.on(event, (...args) => handler(...args));
      });
    }
  }
  
  // Volver a adjuntar todos los handlers después de una reconexión
  private reattachEventHandlers() {
    if (!this.socket) return;
    
    // Eliminar todos los listeners actuales
    this.socket.removeAllListeners();
    
    // Volver a adjuntar handlers básicos
    this.socket.on('connect', () => {
      console.log('Socket.io conectado');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión Socket.io:', error);
    });
    
    this.socket.on('reconnect', () => {
      console.log('Socket.io reconectado');
    });
    
    // Volver a adjuntar los handlers personalizados
    Object.entries(this.eventHandlers).forEach(([event, handlers]) => {
      handlers.forEach(handler => {
        this.socket!.on(event, (...args) => handler(...args));
      });
    });
  }
  
  // Unirse a una sala de chat
  joinChat(chatId: string) {
    this.emit('join_chat', { chatId });
  }
  
  // Enviar un mensaje al chat
  sendChatMessage(chatId: string, content: string) {
    this.emit('send_message', { chatId, content });
  }
  
  // Notificar que el usuario está escribiendo
  sendTyping(chatId: string) {
    this.emit('typing', { chatId });
  }
  
  // Marcar mensajes como leídos
  markChatMessagesAsRead(chatId: string) {
    this.emit('mark_read', { chatId });
  }
}

// Exportar una instancia única del cliente de Socket.io
export const socketClient = new SocketClient();

export default socketClient;
