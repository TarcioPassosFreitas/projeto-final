# 🚀 Projeto Final - PBL Redes

Este repositório unifica o frontend (React) e o backend (Python TCP) em um ambiente Docker completo, pronto para rodar localmente em qualquer rede Wi-Fi.

## 🐳 Como executar com Docker

Certifique-se de ter o **Docker** e o **Docker Compose** instalados.

### 1. Clonar o projeto

```bash
git clone git@github.com:TarcioPassosFreitas/projeto-final.git
cd projeto-final
```

### 2. Subir os containers

```bash
docker compose up --build
```

- O **frontend** estará acessível em: `http://<SEU-IP-LOCAL>:5173`
- O **backend TCP** estará escutando na porta `8888`
- A **bridge WebSocket ↔ TCP** estará rodando na porta `4000`

> 💡 Use `ipconfig` (Windows) ou `ifconfig` (Linux/macOS) para descobrir o IP local.

---

### 📦 Estrutura do projeto

```bash
projeto-final/
├── backend-tcp/          # Servidor TCP em Python
├── frontend-react/       # Aplicação React + WebSocket Bridge
├── docker-compose.yml    # Orquestração dos serviços
└── README.md             # Instruções gerais
```

Para mais detalhes sobre o backend ou frontend, veja os READMEs individuais em cada pasta.

---

### 🧼 Para parar os serviços

```bash
docker compose down
```
