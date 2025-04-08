from utils.time_utils import get_current_timestamp

class StartManager:
    def __init__(self, car_models, station_models):
        """Inicializa com dados pré-carregados."""
        self.car_models = car_models if car_models is not None else {}
        self.station_models = station_models if station_models is not None else {}

    def handle_start(self, request):
        """Retorna os dados iniciais de modelos de carros e postos com tratamento de erros."""
        # Verifica se os dados estão vazios
        if not self.car_models and not self.station_models:
            return {
                "type": "START",
                "data": {},
                "status": {
                    "code": 500,
                    "message": "Erro interno: Nenhum dado de carros ou postos disponível"
                },
                "timestamp": get_current_timestamp()
            }
        elif not self.car_models:
            return {
                "type": "START",
                "data": {
                    "station_models": self.station_models
                },
                "status": {
                    "code": 500,
                    "message": "Erro interno: Modelos de carros não disponíveis"
                },
                "timestamp": get_current_timestamp()
            }
        elif not self.station_models:
            return {
                "type": "START",
                "data": {
                    "car_models": self.car_models
                },
                "status": {
                    "code": 500,
                    "message": "Erro interno: Postos de carregamento não disponíveis"
                },
                "timestamp": get_current_timestamp()
            }

        # Sucesso: retorna todos os dados
        return {
            "type": "START",
            "data": {
                "car_models": self.car_models,
                "station_models": self.station_models
            },
            "status": {
                "code": 200,
                "message": "Dados iniciais carregados com sucesso"
            },
            "timestamp": get_current_timestamp()
        }