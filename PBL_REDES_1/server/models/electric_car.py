class ElectricCar:
    def __init__(self, brand, model, battery_capacity, energy_consumption, max_speed, battery_percentage=None, current_battery=None):
        """Inicializa um carro elétrico com suas propriedades e estado inicial."""
        if battery_capacity < 0 or energy_consumption <= 0 or max_speed <= 0:
            raise ValueError("Capacidade, consumo e velocidade máxima devem ser positivos")

        self.brand = brand
        self.model = model
        self.battery_capacity = battery_capacity  # kWh (máxima)
        self.energy_consumption = energy_consumption  # kWh/km
        self.max_speed = max_speed  # km/h

        # Define current_battery com base em battery_percentage ou valor direto
        if battery_percentage is not None:
            if not 0 <= battery_percentage <= 100:
                raise ValueError("Porcentagem de bateria deve estar entre 0 e 100")
            self.current_battery = (battery_percentage / 100) * battery_capacity
        elif current_battery is not None:
            if not 0 <= current_battery <= battery_capacity:
                raise ValueError("Bateria atual deve estar entre 0 e a capacidade máxima")
            self.current_battery = current_battery
        else:
            raise ValueError("Deve fornecer battery_percentage ou current_battery")

    def current_range(self):
        """Retorna a autonomia atual em km com base na bateria atual."""
        return self.current_battery / self.energy_consumption

    def battery_at_destination(self, distance):
        """Estima a bateria restante (kWh) após percorrer uma distância em km."""
        if distance < 0:
            raise ValueError("Distância deve ser não-negativa")
        energy_used = distance * self.energy_consumption
        return max(0, self.current_battery - energy_used)

    def can_complete_trip(self, distance):
        """Verifica se o carro pode completar o percurso com a bateria atual."""
        if distance < 0:
            raise ValueError("Distância deve ser não-negativa")
        return self.battery_at_destination(distance) > 0

    def charge(self, energy_added):
        """Adiciona energia (kWh) à bateria, respeitando o limite da capacidade."""
        if energy_added < 0:
            raise ValueError("Energia adicionada deve ser não-negativa")
        self.current_battery = min(self.battery_capacity, self.current_battery + energy_added)

    def consume(self, distance):
        """Consome energia com base na distância percorrida (km) e retorna se resta bateria."""
        if distance < 0:
            raise ValueError("Distância deve ser não-negativa")
        energy_used = distance * self.energy_consumption
        self.current_battery = max(0, self.current_battery - energy_used)
        return self.current_battery > 0
    