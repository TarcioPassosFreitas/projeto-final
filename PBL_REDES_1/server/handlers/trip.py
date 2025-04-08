import os
import json
from models.electric_car import ElectricCar
from utils.time_utils import get_current_timestamp

class TripManager:
    def __init__(self, users_dir="server/data/users"):
        """Inicializa com diretório de usuários."""
        self.users_dir = users_dir

    def get_user_car(self, user_id):
        """Carrega o carro do usuário a partir do arquivo JSON."""
        filepath = os.path.join(self.users_dir, f"{user_id}.json")
        if not os.path.exists(filepath):
            return None
        with open(filepath, "r", encoding="utf-8") as f:
            user_data = json.load(f)
        car_data = user_data["user_car"]
        return ElectricCar(
            brand=car_data["brand"],
            model=car_data["model"],
            battery_capacity=car_data["battery_capacity"],
            energy_consumption=car_data["energy_consumption"],
            max_speed=car_data["max_speed"],
            current_battery=car_data["current_battery"]
        )

    def handle_navigation(self, request):
        """Avalia se o usuário pode percorrer uma distância específica."""
        data = request["data"]
        user_id = data.get("user_id")
        route_distance = data.get("route_distance")

        # Validação dos campos
        if not all([user_id, route_distance is not None]):
            return {
                "type": "NAVIGATION",
                "data": {
                    "can_complete": False,
                    "message": "Campos obrigatórios ausentes (user_id, route_distance)",
                    "autonomy": 0
                },
                "status": {"code": 400, "message": "Erro na requisição"},
                "timestamp": get_current_timestamp()
            }

        # Validação da distância
        try:
            route_distance = float(route_distance)
            if route_distance <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return {
                "type": "NAVIGATION",
                "data": {
                    "can_complete": False,
                    "message": "route_distance deve ser um número maior que 0",
                    "autonomy": 0
                },
                "status": {"code": 400, "message": "Erro na requisição"},
                "timestamp": get_current_timestamp()
            }

        # Carrega o carro do usuário
        car = self.get_user_car(user_id)
        if not car:
            return {
                "type": "NAVIGATION",
                "data": {
                    "can_complete": False,
                    "message": "Usuário não encontrado",
                    "autonomy": 0
                },
                "status": {"code": 404, "message": "Usuário não encontrado"},
                "timestamp": get_current_timestamp()
            }

        # Calcula autonomia e verifica o percurso
        autonomy = car.current_range()
        can_complete = car.can_complete_trip(route_distance)
        message = (
            f"Percurso viável! Autonomia atual: {autonomy:.2f} km"
            if can_complete
            else f"Percurso não viável. Autonomia atual: {autonomy:.2f} km, insuficiente para {route_distance} km"
        )

        return {
            "type": "NAVIGATION",
            "data": {
                "can_complete": can_complete,
                "message": message,
                "autonomy": autonomy
            },
            "status": {"code": 200, "message": "Sucesso"},
            "timestamp": get_current_timestamp()
        }
