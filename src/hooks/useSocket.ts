import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message, Conversation } from '../services/chatApi';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io(API_BASE, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
        });

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, []);

    const sendMessage = useCallback((conversationId: string, content: string): Promise<Message | null> => {
        return new Promise((resolve) => {
            const socket = socketRef.current;
            if (!socket) return resolve(null);
            socket.emit('send_message', { conversationId, content }, (response: any) => {
                if (response?.success) {
                    resolve(response.message);
                } else {
                    resolve(null);
                }
            });
        });
    }, []);

    const onNewMessage = useCallback((callback: (message: Message) => void) => {
        const socket = socketRef.current;
        if (!socket) return () => { };
        socket.on('new_message', callback);
        return () => { socket.off('new_message', callback); };
    }, []);

    const onNewConversation = useCallback((callback: (conversation: Conversation) => void) => {
        const socket = socketRef.current;
        if (!socket) return () => { };
        socket.on('new_conversation', callback);
        return () => { socket.off('new_conversation', callback); };
    }, []);

    const joinConversation = useCallback((conversationId: string) => {
        socketRef.current?.emit('join_conversation', { conversationId });
    }, []);

    const emitTypingStart = useCallback((conversationId: string) => {
        socketRef.current?.emit('typing_start', { conversationId });
    }, []);

    const emitTypingStop = useCallback((conversationId: string) => {
        socketRef.current?.emit('typing_stop', { conversationId });
    }, []);

    const onTyping = useCallback((callback: (data: { conversationId: string; userId: string }) => void) => {
        const socket = socketRef.current;
        if (!socket) return () => { };
        socket.on('user_typing', callback);
        return () => { socket.off('user_typing', callback); };
    }, []);

    const onStopTyping = useCallback((callback: (data: { conversationId: string; userId: string }) => void) => {
        const socket = socketRef.current;
        if (!socket) return () => { };
        socket.on('user_stop_typing', callback);
        return () => { socket.off('user_stop_typing', callback); };
    }, []);

    return {
        isConnected,
        sendMessage,
        onNewMessage,
        onNewConversation,
        joinConversation,
        emitTypingStart,
        emitTypingStop,
        onTyping,
        onStopTyping,
    };
}
