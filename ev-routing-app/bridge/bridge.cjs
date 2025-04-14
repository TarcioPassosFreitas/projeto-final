const net = require("net");
const WebSocket = require("ws");

const backendHost = "server";
const backendPort = 8888;
const bridgePort = 4000;

const tcpClient = new net.Socket();
const wss = new WebSocket.Server({ port: bridgePort });

const clients = []; // Lista de clientes conectados

let buffer = ""; // Buffer para dados recebidos do TCP

console.log(`[BRIDGE] 🌐 WebSocket escutando em ws://0.0.0.0:${bridgePort}`);
console.log(
  `[BRIDGE] 🔌 Conectando ao backend TCP em ${backendHost}:${backendPort}...`
);

tcpClient.connect(backendPort, backendHost, () => {
  console.log(
    `[BRIDGE] ✅ TCP conectado ao backend em ${backendHost}:${backendPort}`
  );
});

wss.on("connection", (ws) => {
  console.log("[BRIDGE] 🌐 Cliente WebSocket conectado!");
  clients.push(ws);

  ws.on("message", (message) => {
    console.log(
      "[BRIDGE] 📦 Mensagem recebida do frontend:",
      message.toString()
    );
    tcpClient.write(message + "\n");
  });

  ws.on("close", () => {
    console.log("[BRIDGE] 🔌 Cliente WebSocket desconectado.");
    const index = clients.indexOf(ws);
    if (index !== -1) clients.splice(index, 1);
  });
});

tcpClient.on("data", (chunk) => {
  buffer += chunk.toString();
  const messages = buffer.split("\n");

  for (let i = 0; i < messages.length - 1; i++) {
    const msg = messages[i];
    if (!msg.trim()) continue;

    try {
      const parsed = JSON.parse(msg);
      const type = parsed.type || "UNKNOWN";

      console.log("[BRIDGE] 📨 Mensagem recebida do backend:", parsed);

      const messagesToSend = [];
      messagesToSend.push({ type, data: parsed });

      if (type === "START" && parsed.data?.station_models) {
        messagesToSend.push({
          type: "STATION_MODELS",
          data: parsed.data.station_models,
        });
      }

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          for (const msg of messagesToSend) {
            client.send(JSON.stringify(msg));
          }
        }
      });
    } catch (err) {
      console.error("[BRIDGE] ❌ Erro ao parsear JSON:", err);
    }
  }

  buffer = messages[messages.length - 1];
});

tcpClient.on("close", () => {
  console.log("[BRIDGE] ⚠️ Desconectado do backend.");
});

tcpClient.on("error", (err) => {
  console.error("[BRIDGE] ❌ Erro ao conectar ao backend:", err.message);
});
