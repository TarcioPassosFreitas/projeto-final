from datetime import datetime, timezone

def get_current_timestamp(as_float=False):
    """Retorna o timestamp atual em formato ISO 8601 (com UTC) ou em segundos desde epoch."""
    now = datetime.now(timezone.utc)
    if as_float:
        return now.timestamp()  # Segundos desde epoch (float)
    return now.isoformat()  # Ex: '2025-04-06T18:22:30.123456+00:00'