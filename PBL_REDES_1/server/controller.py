import json
from handlers.auth import AuthManager
from handlers.start import StartManager
from handlers.trip import TripManager
from handlers.station import StationManager
from utils.time_utils import get_current_timestamp
import bootstrap

# Carrega dados na inicialização
bootstrap.check_and_create_stations()
data = bootstrap.initialize_data()

start_manager = StartManager(car_models=data["car_models"], station_models=data["station_models"])
auth_manager = AuthManager(car_models=data["car_models"])
trip_manager = TripManager()
station_manager = StationManager()

handlers = {
    "START": start_manager.handle_start,
    "LOGIN": auth_manager.handle_login,
    "NAVIGATION": trip_manager.handle_navigation,
    "SELECTION_STATION": station_manager.handle_selection_station,
    "PAYMENT": station_manager.handle_payment
}

required_fields = ["type", "data", "status", "timestamp"]

def route_request(request: dict) -> dict:
    if not validate_request(request, required_fields):
        return {
            "type": request.get("type", "error"),
            "data": {},
            "status": {"code": 400, "message": "Campos obrigatórios ausentes"},
            "timestamp": get_current_timestamp()
        }

    if request["type"] in handlers:
        print("REQUEST: " + request["type"])
        return handlers[request["type"]](request)

    return {
        "type": request.get("type", "error"),
        "data": {},
        "status": {"code": 404, "message": "Ação desconhecida"},
        "timestamp": get_current_timestamp()
    }

def validate_request(data, required_fields):
    return all(field in data for field in required_fields)

if __name__ == "__main__":
    # Lista de requisições para teste, todas visando sucesso
    test_requests = [
        # 1. START: Obter dados iniciais
        {
            "type": "START",
            "data": {},
            "status": {"code": 200, "message": "Sucesso"},
            "timestamp": "2025-03-29T10:30:46Z"
        },
        # 2. LOGIN: Criar um usuário com Tesla Model 3
        {
            "type": "LOGIN",
            "data": {
                "user_name": "joao_teste",
                "selected_car": "Tesla Model 3",
                "battery_car": 60  # 60 kWh, dentro da capacidade (75 kWh)
            },
            "status": {"code": 200, "message": "Sucesso"},
            "timestamp": "2025-03-29T10:30:46Z"
        },
        # 3. NAVIGATION: Verificar autonomia para 250 km (viável com 60 kWh)
        {
            "type": "NAVIGATION",
            "data": {
                "user_id": None,  # Preenchido após LOGIN
                "route_distance": 250  # Tesla Model 3: 0.2 kWh/km * 250 km = 50 kWh < 60 kWh
            },
            "status": {"code": 200, "message": "Sucesso"},
            "timestamp": "2025-03-29T10:30:46Z"
        },
        # 4. SELECTION_STATION: Selecionar um posto alcançável
        {
            "type": "SELECTION_STATION",
            "data": {
                "user_id": None,  # Preenchido após LOGIN
                "list_stations": {
                    "1": {"distance_origin_position": 50},  # 50 km = 10 kWh < 60 kWh
                    "2": {"distance_origin_position": 100}  # 100 km = 20 kWh < 60 kWh
                }
            },
            "status": {"code": 200, "message": "Sucesso"},
            "timestamp": "2025-03-29T10:30:46Z"
        },
        # 5. PAYMENT: Confirmar pagamento e reservar vaga
        {
            "type": "PAYMENT",
            "data": {
                "user_id": None,  # Preenchido após LOGIN
                "id_station": None,  # Preenchido após SELECTION_STATION
                "confirmation": True
            },
            "status": {"code": 200, "message": "Sucesso"},
            "timestamp": "2025-03-29T10:30:46Z"
        },
        # 6. LOGIN: Criar outro usuário para teste de deleção
        {
            "type": "LOGIN",
            "data": {
                "user_name": "maria_teste",
                "selected_car": "Nissan Leaf",
                "battery_car": 30  # 30 kWh, dentro da capacidade (40 kWh)
            },
            "status": {"code": 200, "message": "Sucesso"},
            "timestamp": "2025-03-29T10:30:46Z"
        },
        # 7. PAYMENT: Não confirmar pagamento (deleta usuário)
        {
            "type": "PAYMENT",
            "data": {
                "user_id": None,  # Preenchido após segundo LOGIN
                "id_station": "1",  # Posto fixo para simplicidade
                "confirmation": False
            },
            "status": {"code": 200, "message": "Sucesso"},
            "timestamp": "2025-03-29T10:30:46Z"
        }
    ]

    print("=== Iniciando Teste de Requisições ===")
    user_id = None
    station_id = None
    second_user_id = None

    # Executa cada requisição em sequência
    for i, request in enumerate(test_requests, 1):
        print(f"\nTeste {i}: {request['type']}")

        # Preenche user_id e id_station dinamicamente
        if request["type"] in ["NAVIGATION", "SELECTION_STATION", "PAYMENT"] and user_id and not second_user_id:
            request["data"]["user_id"] = user_id
        if request["type"] == "PAYMENT" and station_id and request["data"]["confirmation"]:
            request["data"]["id_station"] = station_id
        if request["type"] == "PAYMENT" and second_user_id:
            request["data"]["user_id"] = second_user_id

        # Executa a requisição
        response = route_request(request)
        print(json.dumps(response, indent=4))

        # Armazena user_id e id_station conforme as respostas
        if request["type"] == "LOGIN" and response["status"]["code"] == 200:
            if not user_id:
                user_id = response["data"]["user_id"]
                print(f"User ID gerado para João: {user_id}")
            else:
                second_user_id = response["data"]["user_id"]
                print(f"User ID gerado para Maria: {second_user_id}")
        if request["type"] == "SELECTION_STATION" and response["status"]["code"] == 200:
            station_id = response["data"]["id_station"]
            print(f"Station ID selecionado: {station_id}")

    print("\n=== Teste Concluído ===")