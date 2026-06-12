import { Client } from "@stomp/stompjs";
import { API_BASE_URL, getAuthHeader } from "./client";

const toWebSocketUrl = (url) =>
  url
    .replace(/^https:\/\//, "wss://")
    .replace(/^http:\/\//, "ws://");

export const CHAT_SOCKET_URL =
  import.meta.env.VITE_CHAT_SOCKET_URL || toWebSocketUrl(`${API_BASE_URL}/ws`);

const SEND_DESTINATION = "/app/chat";

export const getRoomTopic = (roomId) => `/topic/room/${roomId}`;

export function createChatSocketClient(handlers = {}) {
  return new Client({
    brokerURL: CHAT_SOCKET_URL,
    connectHeaders: getAuthHeader(),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
    ...handlers,
  });
}

export function publishChatMessage(client, message) {
  client.publish({
    destination: SEND_DESTINATION,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(message),
  });
}
