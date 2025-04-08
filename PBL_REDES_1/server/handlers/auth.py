import os
import json
import uuid
from utils.time_utils import get_current_timestamp
from models.electric_car import ElectricCar

class AuthManager:
    def __init__(self, users_dir="server/data/users", car_models=None):
        """Inicializa com diretório de usuários e modelos de carros pré-carregados."""
        self.users_dir = users_dir
        self.car_models = car_models if car_models is not None else {}
        os.makedirs(self.users_dir, exist_ok=True)

    def handle_login(self, request):
        """Processa o login, criando um novo usuário se necessário."""
        data = request["data"]
        username = data.get("user_name")
        selected_car = data.get("selected_car")
        battery_car = data.get("battery_car")

        # Validação dos campos
        if not all([username, selected_car, battery_car is not None]):
            return {
                "type": "LOGIN",
                "data": {},
                "status": {"code": 400, "message": "Campos obrigatórios ausentes (user_name, selected_car, battery_car)"},
                "timestamp": get_current_timestamp()
            }

        # Validação do selected_car
        if selected_car not in self.car_models:
            return {
                "type": "LOGIN",
                "data": {},
                "status": {"code": 400, "message": f"Modelo de carro '{selected_car}' inválido"},
                "timestamp": get_current_timestamp()
            }

        # Validação da bateria
        try:
            battery_percentage = float(battery_car)
            if not 0 <= battery_percentage <= 100:  # Ajustado para incluir 0%
                raise ValueError
        except (ValueError, TypeError):
            return {
                "type": "LOGIN",
                "data": {},
                "status": {"code": 400, "message": "battery_car deve ser um número entre 0 e 100"},
                "timestamp": get_current_timestamp()
            }

        # Gera um user_id único com UUID
        user_id = str(uuid.uuid4())
        filepath = os.path.join(self.users_dir, f"{user_id}.json")

        # Cria o objeto ElectricCar
        car_data = self.car_models[selected_car].copy()
        car = ElectricCar(
            brand=car_data["brand"],
            model=car_data["model"],
            battery_capacity=car_data["battery_capacity"],
            energy_consumption=car_data["energy_consumption"],
            max_speed=car_data["max_speed"],
            battery_percentage=battery_percentage
        )

        # Estrutura do arquivo do usuário
        user_data = {
            "user_id": user_id,
            "user_name": username,
            "user_car": {
                "brand": car.brand,
                "model": car.model,
                "battery_capacity": car.battery_capacity,
                "current_battery": car.current_battery,
                "energy_consumption": car.energy_consumption,
                "max_speed": car.max_speed
            }
        }

        # Salva o arquivo
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(user_data, f, indent=4)

        # Resposta ao cliente
        return {
            "type": "LOGIN",
            "data": {"user_id": user_id},
            "status": {"code": 200, "message": "Sucesso"},
            "timestamp": get_current_timestamp()
        }