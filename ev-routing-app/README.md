# ⚡ EV Routing App

Este projeto é um sistema completo de **simulação de navegação e recarga de veículos elétricos** baseado em **sockets TCP/IP**, com visual interativo no navegador (desktop e mobile) e integração com **Google Maps**, **OpenRouteService** e **Overpass API**.

---

## 🎯 Propósito do projeto

O desafio principal deste sistema é **realizar a comunicação entre frontend (web/mobile) e backend (Python)** através de **sockets nativos TCP/IP**, o que é incomum em aplicações web modernas.

Para contornar as limitações dos navegadores (que não permitem conexão direta via TCP), foi implementado um componente chamado **Bridge** — um **proxy intermediário** em Node.js que faz a ponte entre o **WebSocket (navegador)** e o **socket TCP/IP (backend)**.

---

## 🔧 Tecnologias Utilizadas

- **Frontend**: React + Vite + TailwindCSS + Leaflet + WebSocket
- **Backend**: Python com sockets TCP/IP + selectors
- **Bridge**: Node.js WebSocket ↔ TCP Proxy (`bridge.cjs`)
- **Mapas & Rotas**: Google Maps API + OpenRouteService + Overpass API
- **Build**: Vite + `serve`

---

## 📡 Como funciona a comunicação?

### 🔁 Fluxo de mensagens

O frontend envia e recebe mensagens com o seguinte formato (via WebSocket → Bridge → TCP):

1. `START` → solicita modelos de carros e postos.
2. `LOGIN` → cria um novo usuário com nome, carro e nível de bateria.
3. `NAVIGATION` → informa distância do trajeto e pergunta se é possível completar com a autonomia atual.
4. `SELECTION_STATION` → envia lista de postos ordenados por distância e recebe sugestão do melhor posto.
5. `PAYMENT` → confirma ou rejeita ida ao posto sugerido.

As respostas são estruturadas com campos como:

```json
{
  "type": "NAVIGATION",
  "data": {
    "can_complete": false,
    "message": "Fora de alcance",
    "autonomy": 5
  },
  "status": { "code": 200, "message": "Sucesso" },
  "timestamp": "2025-04-07T15:00:00Z"
}
```

---

## 🚀 Rodando em rede local (sem alterar `.env`!)

> A proposta é permitir rodar o sistema **em qualquer rede Wi-Fi (ex: casa, universidade)**, sem necessidade de editar o arquivo `.env`. O frontend detecta automaticamente o IP da máquina host.

### ✅ 1. Subir o servidor backend (TCP/IP)

```bash
docker-compose up -d
# ou
python server/server.py
```

> Certifique-se que está escutando na porta `8888`.

### 🔁 2. Iniciar a Bridge (WebSocket ↔ TCP)

```bash
node bridge/bridge.cjs
```

> Essa ponte escutará em `ws://<IP>:4000` e repassará tudo ao servidor TCP.

### 🌐 3. Descobrir o IP local da máquina

```bash
ipconfig # ou ifconfig
```

> Exemplo: `192.168.0.157`

### 🧱 4. Buildar o frontend

```bash
npm run build
npm install -g serve
serve -s dist -l 192.168.0.157:5173
```

### 📱 5. Acessar do celular (ou qualquer outro dispositivo na mesma rede)

```
http://192.168.0.157:5173
```

> O frontend detecta o IP dinamicamente usando `window.location.hostname`, então **não é necessário modificar o `.env` mesmo mudando de rede**.

---

## 📦 Estrutura resumida

```
📦 ev-routing-app
 ┣ 📁 public
 ┣ 📁 src
 ┃ ┣ 📁 components
 ┃ ┣ 📁 mocks
 ┃ ┣ 📁 pages
 ┃ ┣ 📁 services
 ┃ ┣ 📁 utils
 ┃ ┣ App.tsx
 ┣ 📁 bridge
 ┃ ┗ bridge.cjs ← Ponte WebSocket → TCP
 ┣ server/
 ┃ ┗ server.py ← Servidor TCP/IP (simula backend)
 ┣ .env ← usado somente para API Keys (não precisa mudar IP)
 ┗ README.md ← (este arquivo)
```

---

## ✨ Funcionalidades-chave

- Busca de destinos reais com Google Places
- Roteamento via ruas reais (OpenRouteService)
- Simulação de autonomia e decisão inteligente de rota
- Sugestão automática de posto de recarga
- Comunicação WebSocket → Bridge → TCP
- Rodável diretamente do navegador no celular sem alteração de configuração

---

## 📅 Última atualização

**07/04/2025**
