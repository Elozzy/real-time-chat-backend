import { io, Socket } from "socket.io-client";
import { config } from "../config/env";

const ROOM_ID = "cmejvdxc700022gi730uuxg5o";

interface SimUser {
  name: string;
  socket: Socket;
  token: string;
}

function createSimUser(name: string, token: string): SimUser {
  const socket = io(`http://localhost:${config.port}`, {
    auth: { token }
  });

  socket.on("connect", () => {
    console.log(`✅ ${name} connected with id: ${socket.id}`);
    socket.emit("join_room", { roomId: ROOM_ID }, (res: any) => {
      console.log(`📥 ${name} join_room response:`, res);
    });
  });

  socket.on("receive_message", (msg) => {
    console.log(`💬 [${msg.roomId}] ${msg.user.name}: ${msg.content}`);
  });

  socket.on("typing", (data) => {
    console.log(`✍️ ${data.user.name || 'Unknown'} is typing...`);
  });

  socket.on("user_status", (data) => {
    console.log(
      `📡 ${data.user.name || 'Unknown'} is now ${data.status} (last seen: ${data.lastSeen || "now"})`
    );
  });

  socket.on("disconnect", () => {
    console.log(`❌ ${name} disconnected`);
  });

  return { name, socket, token };
}

// Simulated users
const alice = createSimUser("Alice", config.aliceToken);
const bob = createSimUser("Bob", config.bobToken);

// Simple simulation flow
setTimeout(() => {
  alice.socket.emit("typing", { roomId: ROOM_ID, isTyping: true });
}, 2000);

setTimeout(() => {
  alice.socket.emit("send_message", { roomId: ROOM_ID, content: "Hello Bob!" });
}, 4000);

setTimeout(() => {
  bob.socket.emit("typing", { roomId: ROOM_ID, isTyping: true });
}, 6000);

setTimeout(() => {
  bob.socket.emit("send_message", { roomId: ROOM_ID, content: "Hey Alice, got you!" });
}, 8000);

setTimeout(() => {
  alice.socket.emit("user_status", { roomId: ROOM_ID, status: "offline" });
  alice.socket.disconnect();
}, 10000);

setTimeout(() => {
  bob.socket.emit("user_status", { roomId: ROOM_ID, status: "offline" });
  bob.socket.disconnect();
}, 12000);
