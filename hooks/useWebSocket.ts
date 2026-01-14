import { useEffect, useRef } from 'react';
import { WebSocketService } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';

export function useWebSocket() {
  const wsRef = useRef<WebSocketService | null>(null);
  const { setStats, setEarnings, addToken, updateTokenStatus } = useAppStore();

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocketService('wss://slotb.in/');

    // Handle incoming messages
    ws.onMessage((data) => {
      switch (data.type) {
        case 'token_created':
          if (data.token) {
            addToken(data.token);
          }
          break;
        case 'stats_updated':
          if (data.stats) {
            setStats(data.stats);
          }
          break;
        case 'earnings_updated':
          if (data.earnings) {
            setEarnings(data.earnings);
          }
          break;
        case 'token_status_updated':
          if (data.tokenId && data.status) {
            updateTokenStatus(data.tokenId, data.status);
          }
          break;
        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    });

    // Connect WebSocket
    ws.connect();
    wsRef.current = ws;

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [addToken, setStats, setEarnings, updateTokenStatus]);

  return wsRef.current;
}

