import os
import json
import threading
import time
from datetime import datetime, timezone

class StationMonitor:
    def __init__(self, stations_dir="server/data/stations", users_dir="server/data/users", interval=10):
        """Inicializa o monitor de postos."""
        self.stations_dir = stations_dir
        self.users_dir = users_dir
        self.interval = interval  # Intervalo de verificação em segundos
        self.locks = {}  # Locks por station_id
        self.running = False

    def start(self):
        """Inicia o monitoramento em uma thread separada."""
        self.running = True
        self.thread = threading.Thread(target=self._monitor_stations, daemon=True)
        self.thread.start()
        print(f"Monitoramento de postos iniciado com intervalo de {self.interval} segundos.")

    def stop(self):
        """Para o monitoramento."""
        self.running = False
        if self.thread.is_alive():
            self.thread.join()
        print("Monitoramento de postos encerrado.")

    def _monitor_stations(self):
        """Monitora os postos e remove veículos concluídos."""
        while self.running:
            station_files = [f for f in os.listdir(self.stations_dir) if f.startswith("station_") and f.endswith(".json")]
            current_time = datetime.now(timezone.utc).timestamp()

            for station_file in station_files:
                station_id = station_file.split("_")[1].split(".")[0]
                filepath = os.path.join(self.stations_dir, station_file)

                # Cria ou obtém o lock para este station_id
                if station_id not in self.locks:
                    self.locks[station_id] = threading.Lock()
                lock = self.locks[station_id]

                with lock:
                    # Lê o arquivo do posto
                    if not os.path.exists(filepath):
                        continue
                    with open(filepath, "r", encoding="utf-8") as f:
                        station_data = json.load(f)

                    # Verifica veículos
                    updated = False
                    vehicles_to_remove = []
                    for user_id, vehicle in list(station_data["vehicles"].items()):
                        if current_time >= vehicle["estimated_timestamp"]:
                            vehicles_to_remove.append(user_id)
                            station_data["available_slots"] += 1
                            updated = True
                            # Deleta o arquivo do usuário
                            user_filepath = os.path.join(self.users_dir, f"{user_id}.json")
                            if os.path.exists(user_filepath):
                                os.remove(user_filepath)
                                print(f"Cliente {user_id} removido após conclusão de carregamento.")

                    # Remove veículos concluídos do posto
                    for user_id in vehicles_to_remove:
                        del station_data["vehicles"][user_id]

                    # Salva alterações no arquivo do posto
                    if updated:
                        with open(filepath, "w", encoding="utf-8") as f:
                            json.dump(station_data, f, indent=4)
                        print(f"Posto {station_id}: Atualizou vagas disponíveis ({station_data['available_slots']}/{station_data['max_slots']})")

            # Aguarda o intervalo antes da próxima verificação
            time.sleep(self.interval)

if __name__ == "__main__":
    # Teste standalone
    monitor = StationMonitor()
    monitor.start()
    try:
        time.sleep(60)  # Roda por 1 minuto
    except KeyboardInterrupt:
        monitor.stop()
        