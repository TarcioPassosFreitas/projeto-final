# ⚡ Sistema de Gerenciamento de Carregamento de Carros Elétricos

Este projeto implementa um servidor **socket assíncrono** projetado para simular a jornada de um motorista de veículo elétrico interagindo com postos de recarga. O sistema utiliza **protocolo TCP** e mensagens em **formato JSON**, permitindo que clientes realizem operações como login, consulta de autonomia, seleção de postos e pagamento de carregamento.

---

## 🎯 Objetivo

- Simular o fluxo de um motorista de veículo elétrico em busca de autonomia, localização de postos e carregamento.
- Gerenciar múltiplas conexões simultâneas de forma eficiente, processando requisições e atualizando dados em tempo real.
- Oferecer uma experiência **stateless**, onde cada requisição é independente e processada com base em dados persistentes.

---

## 🧠 Arquitetura e Decisões Técnicas

### 📡 Comunicação

- **Modelo:** Stateless – o servidor não mantém estado entre requisições.
- **Protocolo:** TCP (sockets padrão do Python).
- **Formato das mensagens:** JSON, com os seguintes campos obrigatórios:

```json
{
  "type": "LOGIN",
  "data": {},
  "status": { "code": 0, "message": "" },
  "timestamp": "2025-04-07T13:45:12Z"
}
```

---

### 🔄 Concorrência

- **Modelo:** Multiplexação assíncrona com `selectors`.
- **Benefícios:**
  - Alta escalabilidade sem uso de múltiplas threads.
  - Uso eficiente de recursos, ideal para simular muitos clientes simultaneamente.
- **Monitoramento:** Uma thread separada (`station_monitor.py`) atualiza os postos em tempo real, liberando vagas e removendo usuários concluídos.

---

### 💾 Serialização e Persistência

- **Formato das mensagens:** JSON estruturado.
- **Persistência:**
  - Arquivos `.json` em `server/data/` armazenam dados de carros, usuários e postos.
  - Arquivo `.csv` (`feira_de_santana_stations.csv`) contém os dados iniciais dos postos.
  - Arquivos de usuários são criados dinamicamente e removidos após o carregamento.
- **Concorrência:** Controle com `threading.Lock` por recurso (posto ou usuário).

---

### 🧩 Design Modular

- **Roteamento:** `controller.py` centraliza o redirecionamento das requisições.
- **Handlers:** Classes específicas tratam tipos distintos de requisições:
  - `auth.py`, `start.py`, `trip.py`, `station.py`
- **Inicialização:** `bootstrap.py` carrega 150 usuários e os postos a partir do CSV.

---

## 🔁 Exemplo de Comunicação Cliente ↔ Servidor

### 📤 Requisição (LOGIN)

```json
{
  "type": "LOGIN",
  "data": {
    "user_name": "joao_teste",
    "selected_car": "Tesla Model 3",
    "battery_car": 60
  },
  "status": { "code": 200, "message": "Sucesso" },
  "timestamp": "2025-04-07T13:45:12.345Z"
}
```

### 📥 Resposta do Servidor

```json
{
  "type": "LOGIN",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "status": {
    "code": 200,
    "message": "Sucesso"
  },
  "timestamp": "2025-04-07T13:45:12.678Z"
}
```

> **Nota:** Cada mensagem deve ser terminada com `\n` para que o servidor a processe corretamente.  
> O `user_id` deve ser usado nas requisições seguintes (ex: `NAVIGATION`, `SELECTION_STATION`).

---

## 🐳 Execução com Docker

O projeto suporta dois modos:

### 1️⃣ Modo Simples (`server`)

- Executa apenas o servidor.
- Supõe que os dados já estejam preparados no volume `dados-volume`.

```bash
docker-compose up server
```

- Porta: `8888`
- Container: `server`

---

### 2️⃣ Modo com Bootstrap (`server-with-bootstrap`)

- Executa `bootstrap.py` para gerar dados (postos e 150 usuários) e em seguida inicia o servidor.

```bash
docker-compose up server-with-bootstrap
```

- Porta: `8888`
- Container: `server-with-bootstrap`

---

### 🛑 Parando os containers

```bash
docker-compose down          # Encerra os containers
docker-compose down -v       # Remove também os volumes
```

---

## 📂 Estrutura de Diretórios

```
.
├── server/
│   ├── server.py                 # Entrada do servidor
│   ├── controller.py           # Roteamento central
│   ├── station_monitor.py      # Libera vagas e limpa usuários
│   ├── handlers/
│   │   ├── auth.py             # LOGIN
│   │   ├── start.py            # START
│   │   ├── trip.py             # NAVIGATION
│   │   └── station.py          # SELECTION_STATION e PAYMENT
│   ├── models/
│   │   └── electric_car.py     # Classe ElectricCar
│   ├── utils/
│   │   └── time_utils.py       # Funções de tempo
│   ├── data/
│   │   ├── car_models.json
│   │   ├── feira_de_santana_stations.csv
│   │   ├── stations/
│   │   └── users/
│   └── bootstrap.py            # Cria dados simulados
├── Dockerfile-server
├── docker-compose.yml
└── README.md
```

---

## 🧪 Execução Local (Sem Docker)

### Pré-requisitos

- Python 3.8+

### Passos

```bash
pip install -r requirements.txt
python server/bootstrap.py
python server/main.py 8888
```

### Teste com netcat

```bash
echo '{"type": "LOGIN", "data": {"user_name": "joao", "selected_car": "Tesla Model 3", "battery_car": 60}, "status": {"code": 200, "message": "Sucesso"}, "timestamp": "2025-04-07T13:45:12Z"}\n' | nc 127.0.0.1 8888
```

---

## ✅ Funcionalidades Principais

- `START`: Retorna dados iniciais do sistema.
- `LOGIN`: Registra usuário e retorna um `user_id`.
- `NAVIGATION`: Calcula se a viagem é possível com a autonomia atual.
- `SELECTION_STATION`: Sugere o melhor posto com base na distância.
- `PAYMENT`: Finaliza a jornada e reserva a vaga.
- **Monitoramento em tempo real** dos postos.

---

## 📝 Notas Finais

- Simulação realista com 150 usuários e postos dinâmicos.
- Uso de `selectors` e TCP para garantir eficiência.
- Persistência leve com arquivos JSON/CSV.
