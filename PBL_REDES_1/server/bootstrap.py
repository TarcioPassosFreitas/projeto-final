import os
import csv
import json
import uuid
import random
from datetime import datetime, timezone

def check_and_create_stations(csv_file="server/data/feira_de_santana_stations.csv", output_folder="server/data/stations"):
    os.makedirs(output_folder, exist_ok=True)
    expected_ids = set()
    
    # Pega os IDs esperados do CSV
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            expected_ids.add(int(row["id"]))
    
    # Verifica os arquivos já existentes
    existing_files = {
        int(f.split("_")[1].split(".")[0])
        for f in os.listdir(output_folder)
        if f.startswith("station_") and f.endswith(".json")
    }
    
    missing_ids = expected_ids - existing_files

    if not existing_files and os.listdir(output_folder):
        print("Aviso: A pasta de estações contém arquivos inesperados, mas não os arquivos padrão. Nada será recriado.")
        return

    if missing_ids:
        print(f"Arquivos faltantes detectados: {missing_ids}")
        with open(csv_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter=";")
            for row in reader:
                station_id = int(row["id"])
                if station_id in missing_ids:
                    station_data = {
                        "id": station_id,
                        "max_slots": int(row["quantidadeDeVeiculosSimultaneos"]),
                        "available_slots": int(row["quantidadeDeVeiculosSimultaneos"]),
                        "vehicles": {}
                    }
                    filepath = os.path.join(output_folder, f"station_{station_id}.json")
                    if not os.path.exists(filepath):
                        with open(filepath, "w", encoding="utf-8") as json_file:
                            json.dump(station_data, json_file, indent=4)
                        print(f"Arquivo criado: {filepath}")
    else:
        print("Todos os arquivos das estações estão presentes.")

def initialize_data(car_models_file="server/data/car_models.json", stations_file="server/data/feira_de_santana_stations.csv"):
    """Carrega dados iniciais na memória ao iniciar o servidor."""
    if not os.path.exists(car_models_file):
        raise FileNotFoundError(f"Arquivo {car_models_file} não encontrado")
    with open(car_models_file, "r", encoding="utf-8") as f:
        car_models = json.load(f)

    if not os.path.exists(stations_file):
        raise FileNotFoundError(f"Arquivo {stations_file} não encontrado")
    stations = {}
    with open(stations_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            station_id = row["id"]
            stations[station_id] = {
                "name_station": row["nomeDoPosto"],
                "address": row["endereço"],
                "latitude": row["latitude"],
                "longitude": row["longitude"],
            }

    return {
        "car_models": car_models,
        "station_models": stations
    }

def populate_clients(num_clients=150, users_dir="server/data/users", stations_dir="server/data/stations", car_models_file="server/data/car_models.json"):
    """Cria clientes e os aloca aleatoriamente em postos de carregamento."""
    # Cria diretórios se não existirem
    os.makedirs(users_dir, exist_ok=True)
    os.makedirs(stations_dir, exist_ok=True)

    # Carrega modelos de carros
    with open(car_models_file, "r", encoding="utf-8") as f:
        car_models = json.load(f)
    car_list = list(car_models.keys())

    # Lista de arquivos de postos
    station_files = [f for f in os.listdir(stations_dir) if f.startswith("station_") and f.endswith(".json")]
    if not station_files:
        raise FileNotFoundError("Nenhum arquivo de posto encontrado em stations_dir")

    # Gera clientes
    for i in range(num_clients):
        user_id = str(uuid.uuid4())
        user_name = f"Cliente_{i+1}"
        selected_car = random.choice(car_list)
        car_data = car_models[selected_car]
        
        # Bateria aleatória entre 10% e 100%
        battery_capacity = car_data["battery_capacity"]
        current_battery = random.uniform(0.1 * battery_capacity, battery_capacity)

        # Cria arquivo do usuário
        user_data = {
            "user_name": user_name,
            "user_car": {
                "brand": car_data["brand"],
                "model": selected_car,
                "battery_capacity": battery_capacity,
                "energy_consumption": car_data["energy_consumption"],
                "max_speed": car_data["max_speed"],
                "current_battery": current_battery
            }
        }
        user_filepath = os.path.join(users_dir, f"{user_id}.json")
        with open(user_filepath, "w", encoding="utf-8") as f:
            json.dump(user_data, f, indent=4)
        print(f"Criado usuário: {user_filepath}")

        # Aloca o cliente em um posto
        random.shuffle(station_files)  # Embaralha para alocação aleatória
        allocated = False
        for station_file in station_files:
            station_filepath = os.path.join(stations_dir, station_file)
            with open(station_filepath, "r", encoding="utf-8") as f:
                station_data = json.load(f)

            if station_data["available_slots"] > 0:
                # Calcula tempo de carga até 80% (50 kW padrão)
                charge_rate = 50  # kW
                energy_needed = min(battery_capacity * 0.8 - current_battery, battery_capacity - current_battery)
                charge_time = (energy_needed / charge_rate) * 3600  # Segundos
                current_time = datetime.now(timezone.utc).timestamp()
                estimated_timestamp = current_time + charge_time

                # Atualiza o posto
                station_data["available_slots"] -= 1
                station_data["vehicles"][user_id] = {
                    "estimated_timestamp": estimated_timestamp
                }

                # Salva as alterações
                with open(station_filepath, "w", encoding="utf-8") as f:
                    json.dump(station_data, f, indent=4)
                print(f"Cliente {user_id} alocado no posto {station_data['id']}")
                allocated = True
                break

        if not allocated:
            print(f"Cliente {user_id} não alocado: todos os postos estão lotados")

if __name__ == "__main__":
    check_and_create_stations()
    populate_clients()
